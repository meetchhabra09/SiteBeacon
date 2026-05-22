import cron from "node-cron";
import Beacon from "../models/beaconModel.js";
import User from "../models/userModel.js";
import { checkWebsite } from "../utils/checkWebsite.js";
import { sendBeaconFailMail } from "../utils/sendMail.js";
import { logBeaconStatus, logNotification } from "../controllers/analyticsController.js";

const activeSchedules = new Map();

export function startScheduler(io) {
  // Run check every second to evaluate beacon schedules
  cron.schedule("* * * * * *", async () => {
    const beacons = await Beacon.find();
    const now = new Date();

    for (const beacon of beacons) {
      try {
        // Check if this beacon needs to run based on its interval
        const lastExec = beacon.lastExecution || new Date(0);
        const interval = beacon.checkInterval || 10;
        const timeSinceLastExec = (now - lastExec) / 1000; // in seconds

        if (timeSinceLastExec < interval) {
          continue; // Not time to run yet
        }

        const prevStatus = beacon.lastStatus;
        const result = await checkWebsite(beacon.url);

        beacon.lastStatus = result.status;
        beacon.lastDuration = result.duration;
        beacon.lastExecution = new Date();
        beacon.nextExecution = new Date(Date.now() + interval * 1000);

        // Log beacon status for analytics
        await logBeaconStatus(
          beacon._id,
          beacon.user,
          result.status,
          result.duration,
          result.statusCode,
          result.errorMessage
        );

        if (
          prevStatus === "UP" &&
          result.status === "DOWN" &&
          !beacon.alertSent
        ) {
          const user = await User.findById(beacon.user);
          if (user) {
            await sendBeaconFailMail(user.email, beacon);
            beacon.alertSent = true;

            // Log notification
            await logNotification(
              beacon._id,
              beacon.user,
              "status_down",
              `${beacon.title} is DOWN`,
              `Your beacon "${beacon.title}" has gone down. Status: ${result.status}. Error: ${result.errorMessage || 'Unknown error'}`
            );
          }
        }

        if (result.status === "UP") {
          beacon.alertSent = false;
          if (prevStatus === "DOWN") {
            // Log UP notification
            await logNotification(
              beacon._id,
              beacon.user,
              "status_up",
              `${beacon.title} is UP`,
              `Your beacon "${beacon.title}" is back up and running.`
            );
          }
        }

        await beacon.save();

        io.to(beacon.user.toString()).emit("beaconUpdate", beacon);
      } catch (err) {
        if (err.name === "DocumentNotFoundError") {
          continue;
        }
        console.error("Scheduler error:", err);
      }
    }
  });

  console.log("Internal scheduler started (per-beacon interval support enabled).");
}
