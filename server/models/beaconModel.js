import mongoose from "mongoose";

const beaconSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  lastStatus: { type: String, default: "UNKNOWN" },
  lastDuration: { type: Number, default: null },

  lastExecution: { type: Date, default: null },
  nextExecution: { type: Date, default: null },

  alertSent: { type: Boolean, default: false }


}, { timestamps: true });

export default mongoose.model("Beacon", beaconSchema);
