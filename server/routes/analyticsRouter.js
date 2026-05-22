import express from "express";
import {
  getBeaconAnalytics,
  getBeaconHistory,
  getAnalyticsPreferences,
  updateAnalyticsPreferences,
  getAllBeaconsAnalyticsSummary,
  sendAnalyticsEmailOnDemand
} from "../controllers/analyticsController.js";
import { authUser } from "../middlewares/authUser.js";

const router = express.Router();

// Analytics routes - all require authentication
router.get("/beacon/:beaconId", authUser, getBeaconAnalytics);
router.get("/beacon/:beaconId/history", authUser, getBeaconHistory);
router.post("/beacon/:beaconId/send-email", authUser, sendAnalyticsEmailOnDemand);
router.get("/summary", authUser, getAllBeaconsAnalyticsSummary);
router.get("/preferences", authUser, getAnalyticsPreferences);
router.put("/preferences", authUser, updateAnalyticsPreferences);

export default router;
