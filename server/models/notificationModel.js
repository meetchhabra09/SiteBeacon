import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  beacon: { type: mongoose.Schema.Types.ObjectId, ref: "Beacon", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { 
    type: String, 
    enum: ["status_down", "status_up", "threshold_exceeded", "custom"], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now, index: true }
}, { timestamps: false });

notificationSchema.index({ beacon: 1, sentAt: -1 });
notificationSchema.index({ user: 1, sentAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);
