import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { sendOtpMail } from "../utils/sendMail.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Login user otp
// Login user otp
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("user found");

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    console.log("password match");

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // ✅ SEND RESPONSE FIRST
    res.status(200).json({
      message: "OTP sent to email",
    });

    // ✅ SEND EMAIL ASYNC (DO NOT AWAIT)
    sendOtpMail(email, otp).catch(err => {
      console.error("OTP email failed:", err.message);
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login user" });
  }
};
