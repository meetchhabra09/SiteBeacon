import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import userRouter from "./routes/userRouter.js";
import historyRouter from "./routes/historyRouter.js";
import analyticsRouter from "./routes/analyticsRouter.js";
import { authUser } from "./middlewares/authUser.js";

import Beacon from "./models/beaconModel.js";
import User from "./models/userModel.js";
import BeaconHistory from "./models/beaconHistoryModel.js";

import { checkWebsite } from "./utils/checkWebsite.js";
import { startScheduler } from "./workers/scheduler.js";
import { startAnalyticsReporter } from "./workers/analyticsReporter.js";
import { logBeaconAction } from "./controllers/historyController.js";
import { logBeaconStatus, logNotification } from "./controllers/analyticsController.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/user", userRouter);
app.use("/history", historyRouter);
app.use("/analytics", analyticsRouter);

app.get("/jobs", authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const beacons = await Beacon.find({ user: userId });
    res.json({ beacons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user beacons" });
  }
});

app.get("/jobs/:id", authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const beacon = await Beacon.findOne({ _id: req.params.id, user: userId });

    if (!beacon) {
      return res.status(404).json({ error: "Beacon not found" });
    }

    res.json(beacon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch beacon details" });
  }
});

app.post("/jobs", authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const checkInterval = req.body.checkInterval || 10;

    const beacon = await Beacon.create({
      title: req.body.title,
      url: req.body.url,
      user: userId,
      checkInterval: checkInterval,
      nextExecution: new Date(Date.now() + checkInterval * 1000),
    });

    await User.findByIdAndUpdate(userId, { $push: { beacons: beacon._id } });

    await logBeaconAction(userId, beacon._id, "add", beacon.title, beacon.url);

    res.json(beacon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create beacon" });
  }
});

app.put("/jobs/:id", authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const beaconId = req.params.id;
    const { title, url, checkInterval } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }

    const beacon = await Beacon.findOne({ _id: beaconId, user: userId });

    if (!beacon) return res.status(404).json({ error: "Beacon not found" });

    const changedFields = {};
    if (beacon.title !== title.trim()) {
      changedFields.title = { old: beacon.title, new: title.trim() };
    }
    if (beacon.url !== url.trim()) {
      changedFields.url = { old: beacon.url, new: url.trim() };
    }
    if (checkInterval && [5, 10, 20].includes(checkInterval) && beacon.checkInterval !== checkInterval) {
      changedFields.checkInterval = { old: beacon.checkInterval, new: checkInterval };
    }

    beacon.title = title.trim();
    beacon.url = url.trim();
    
    if (checkInterval && [5, 10, 20].includes(checkInterval)) {
      beacon.checkInterval = checkInterval;
    }
    
    await beacon.save();

    if (Object.keys(changedFields).length > 0) {
      await logBeaconAction(userId, beaconId, "edit", beacon.title, beacon.url, changedFields);
    }

    res.json({ message: "Beacon updated successfully", beacon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update beacon" });
  }
});

// Endpoint to update just the check interval
app.patch("/jobs/:id/interval", authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const beaconId = req.params.id;
    const { checkInterval } = req.body;

    if (!checkInterval || ![5, 10, 20].includes(checkInterval)) {
      return res.status(400).json({ error: "Check interval must be 5, 10, or 20 seconds" });
    }

    const beacon = await Beacon.findOne({ _id: beaconId, user: userId });

    if (!beacon) {
      return res.status(404).json({ error: "Beacon not found" });
    }

    const oldInterval = beacon.checkInterval;
    beacon.checkInterval = checkInterval;
    beacon.nextExecution = new Date(Date.now() + checkInterval * 1000);
    await beacon.save();

    const changedFields = { checkInterval: { old: oldInterval, new: checkInterval } };
    await logBeaconAction(userId, beaconId, "edit", beacon.title, beacon.url, changedFields);

    res.json({ message: `Check interval updated to ${checkInterval} seconds`, beacon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update check interval" });
  }
});

app.delete("/jobs/:id", authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const beaconId = req.params.id;

    const beacon = await Beacon.findOne({ _id: beaconId, user: userId });

    if (!beacon) return res.status(404).json({ error: "Beacon not found" });

    await logBeaconAction(userId, beaconId, "delete", beacon.title, beacon.url);

    await Beacon.findByIdAndDelete(beaconId);

    await User.findByIdAndUpdate(userId, { $pull: { beacons: beaconId } });

    res.json({ message: "Beacon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete beacon" });
  }
});

app.get("/jobsRefresh", authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const beacons = await Beacon.find({ user: userId });

    const updated = await Promise.all(
      beacons.map(async beacon => {
        const result = await checkWebsite(beacon.url);

        beacon.lastStatus = result.status;
        beacon.lastDuration = result.duration;
        beacon.lastExecution = new Date();
        beacon.nextExecution = new Date(Date.now() + 10000);

        await beacon.save();

        // Log beacon status for analytics
        await logBeaconStatus(
          beacon._id,
          userId,
          result.status,
          result.duration,
          result.statusCode,
          result.errorMessage
        );

        return beacon;
      })
    );

    res.json({ beacons: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh beacons" });
  }
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      cors: { origin: "*" },
    });

    io.on("connection", socket => {
      const userId = socket.handshake.query.userId;
      socket.join(userId);
    });

    startScheduler(io);
    startAnalyticsReporter();

    const port = process.env.PORT || 3000;

    httpServer.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
