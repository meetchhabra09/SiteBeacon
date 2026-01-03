import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";
import { verifyOtp } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

export default router;
