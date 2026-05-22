import mongoose from "mongoose";

const beaconStatusSchema = new mongoose.Schema({
  beacon: { type: mongoose.Schema.Types.ObjectId, ref: "Beacon", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["UP", "DOWN", "UNKNOWN"], 
    required: true 
  },
  duration: { type: Number, default: null },
  statusCode: { type: Number, default: null },
  errorMessage: { type: String, default: null },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: false });

beaconStatusSchema.index({ beacon: 1, timestamp: -1 });
beaconStatusSchema.index({ user: 1, timestamp: -1 });
beaconStatusSchema.index({ beacon: 1, status: 1 });

export default mongoose.model("BeaconStatus", beaconStatusSchema);
