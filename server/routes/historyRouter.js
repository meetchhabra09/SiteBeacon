import express from "express";
import { getBeaconHistory, getHistorySummary } from "../controllers/historyController.js";
import { authUser } from "../middlewares/authUser.js";

const router = express.Router();

router.get("/", authUser, getBeaconHistory);
router.get("/summary", authUser, getHistorySummary);

export default router;
