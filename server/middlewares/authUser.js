import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token provided",
        message: "Authorization header is missing",
      });
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Invalid token format",
        message: "Authorization header must be 'Bearer <token>'",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message: "Token is empty",
      });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired",
          message: "Your session has expired. Please login again.",
        });
      }
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided token is invalid.",
      });
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "The user associated with this token no longer exists.",
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      error: "Authentication failed",
      message: error.message || "An unexpected error occurred during authentication",
    });
  }
};