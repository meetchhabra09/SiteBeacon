import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import userRouter from "./routes/userRouter.js";
import { authUser } from "./middlewares/authUser.js";

import Beacon from "./models/beaconModel.js";
import User from "./models/userModel.js";

import { checkWebsite } from "./utils/checkWebsite.js";
import { startScheduler } from "./workers/scheduler.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/user", userRouter);

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

    const beacon = await Beacon.create({
      title: req.body.title,
      url: req.body.url,
      user: userId,
      nextExecution: new Date(Date.now() + 10000),
    });

    await User.findByIdAndUpdate(userId, { $push: { beacons: beacon._id } });

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
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }

    const beacon = await Beacon.findOne({ _id: beaconId, user: userId });

    if (!beacon) return res.status(404).json({ error: "Beacon not found" });

    beacon.title = title.trim();
    beacon.url = url.trim();
    await beacon.save();

    res.json({ message: "Beacon updated successfully", beacon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update beacon" });
  }
});

app.delete("/jobs/:id", authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const beaconId = req.params.id;

    const beacon = await Beacon.findOne({ _id: beaconId, user: userId });

    if (!beacon) return res.status(404).json({ error: "Beacon not found" });

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

    const port = process.env.PORT || 3000;

    httpServer.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
