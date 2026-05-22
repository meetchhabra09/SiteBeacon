import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    beacons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Beacon",
      },
    ],
    otpHash: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    analyticsPreferences: {
      emailReports: { type: Boolean, default: true },
      reportFrequency: { 
        type: String, 
        enum: ["daily", "weekly", "monthly"], 
        default: "weekly" 
      },
      reportDay: { 
        type: Number, 
        min: 0, 
        max: 6, 
        default: 0 
      },
      reportTime: { type: String, default: "09:00" },
      lastReportSent: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
