import cron from "node-cron";
import Beacon from "../models/beaconModel.js";
import User from "../models/userModel.js";
import { checkWebsite } from "../utils/checkWebsite.js";
import { sendBeaconFailMail } from "../utils/sendMail.js";

export function startScheduler(io) {
  cron.schedule("*/10 * * * * *", async () => {
    const beacons = await Beacon.find();

    for (const beacon of beacons) {
      try {
        const prevStatus = beacon.lastStatus;
        const result = await checkWebsite(beacon.url);

        beacon.lastStatus = result.status;
        beacon.lastDuration = result.duration;
        beacon.lastExecution = new Date();
        beacon.nextExecution = new Date(Date.now() + 10000);

        if (
          prevStatus === "UP" &&
          result.status === "DOWN" &&
          !beacon.alertSent
        ) {
          const user = await User.findById(beacon.user);
          if (user) {
            await sendBeaconFailMail(user.email, beacon);
            beacon.alertSent = true;
          }
        }

        if (result.status === "UP") {
          beacon.alertSent = false;
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

  console.log("Internal scheduler started.");
}
