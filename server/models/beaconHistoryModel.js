import mongoose from "mongoose";

const beaconHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  beacon: { type: mongoose.Schema.Types.ObjectId, ref: "Beacon" },
  actionType: { 
    type: String, 
    enum: ["add", "edit", "delete"], 
    required: true 
  },
  beaconTitle: { type: String, required: true },
  beaconUrl: { type: String, required: true },
  changedFields: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
});

beaconHistorySchema.index({ user: 1, createdAt: -1 });
beaconHistorySchema.index({ beaconTitle: 1 });

export default mongoose.model("BeaconHistory", beaconHistorySchema);
