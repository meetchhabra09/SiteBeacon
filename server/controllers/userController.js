import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { sendOtpMail } from "../utils/sendMail.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= REGISTER USER =================
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// ================= LOGIN USER (SEND OTP) =================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // ✅ RESPOND FIRST
    res.status(200).json({ message: "OTP sent to email" });

    // ✅ SEND EMAIL ASYNC
    sendOtpMail(email, otp).catch(err => {
      console.error("OTP email failed:", err.message);
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login user" });
  }
};

// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ error: "OTP not requested" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    const isOtpMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isOtpMatch) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    user.otpHash = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};
