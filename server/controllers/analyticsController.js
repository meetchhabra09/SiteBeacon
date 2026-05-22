import User from "../models/userModel.js";
import Beacon from "../models/beaconModel.js";
import BeaconStatus from "../models/beaconStatusModel.js";
import Notification from "../models/notificationModel.js";
import { sendAnalyticsEmail } from "../utils/sendMail.js";

// ================= GET BEACON ANALYTICS =================
export const getBeaconAnalytics = async (req, res) => {
  const { beaconId } = req.params;
  const userId = req.user._id;

  try {
    // Verify beacon belongs to user
    const beacon = await Beacon.findOne({ _id: beaconId, user: userId });
    if (!beacon) {
      return res.status(404).json({ error: "Beacon not found" });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get status distribution
    const statusCounts = await BeaconStatus.aggregate([
      {
        $match: {
          beacon: beacon._id,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate uptime percentage
    const totalChecks = statusCounts.reduce((sum, s) => sum + s.count, 0);
    const downCount = statusCounts.find(s => s._id === "DOWN")?.count || 0;
    const uptimePercentage = totalChecks > 0 ? ((totalChecks - downCount) / totalChecks * 100).toFixed(2) : 100;

    // Get average response time
    const avgDuration = await BeaconStatus.aggregate([
      {
        $match: {
          beacon: beacon._id,
          duration: { $exists: true, $ne: null },
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" }
        }
      }
    ]);

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      beacon: beacon._id,
      sentAt: { $gte: thirtyDaysAgo }
    });

    // Get downtime incidents
    const downtimeIncidents = await BeaconStatus.aggregate([
      {
        $match: {
          beacon: beacon._id,
          status: "DOWN",
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get last 7 days status timeline for chart
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = await BeaconStatus.aggregate([
      {
        $match: {
          beacon: beacon._id,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          upCount: {
            $sum: { $cond: [{ $eq: ["$status", "UP"] }, 1, 0] }
          },
          downCount: {
            $sum: { $cond: [{ $eq: ["$status", "DOWN"] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    res.json({
      beaconId: beacon._id,
      beaconTitle: beacon.title,
      uptimePercentage: parseFloat(uptimePercentage),
      downCount,
      totalChecks,
      notificationCount,
      avgResponseTime: avgDuration[0]?.avgDuration?.toFixed(2) || 0,
      downtimeIncidents,
      dailyStats,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// ================= GET BEACON STATUS HISTORY =================
export const getBeaconHistory = async (req, res) => {
  const { beaconId } = req.params;
  const { limit = 100, page = 1 } = req.query;
  const userId = req.user.id;

  try {
    const beacon = await Beacon.findOne({ _id: beaconId, user: userId });
    if (!beacon) {
      return res.status(404).json({ error: "Beacon not found" });
    }

    const skip = (page - 1) * limit;

    const history = await BeaconStatus.find({
      beacon: beaconId
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await BeaconStatus.countDocuments({ beacon: beaconId });

    res.json({
      history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

// ================= GET USER ANALYTICS PREFERENCES =================
export const getAnalyticsPreferences = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).select("analyticsPreferences");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      preferences: user.analyticsPreferences || {}
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
};

// ================= UPDATE ANALYTICS PREFERENCES =================
export const updateAnalyticsPreferences = async (req, res) => {
  const userId = req.user._id;
  const { emailReports, reportFrequency, reportDay, reportTime } = req.body;

  try {
    const updateData = {};
    if (emailReports !== undefined) updateData["analyticsPreferences.emailReports"] = emailReports;
    if (reportFrequency) updateData["analyticsPreferences.reportFrequency"] = reportFrequency;
    if (reportDay !== undefined) updateData["analyticsPreferences.reportDay"] = reportDay;
    if (reportTime) updateData["analyticsPreferences.reportTime"] = reportTime;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("analyticsPreferences");

    res.json({
      message: "Preferences updated successfully",
      preferences: user.analyticsPreferences
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
};

// ================= GET ALL BEACONS ANALYTICS SUMMARY =================
export const getAllBeaconsAnalyticsSummary = async (req, res) => {
  const userId = req.user._id;

  try {
    const beacons = await Beacon.find({ user: userId });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const summaries = await Promise.all(
      beacons.map(async (beacon) => {
        const statusCounts = await BeaconStatus.aggregate([
          {
            $match: {
              beacon: beacon._id,
              timestamp: { $gte: thirtyDaysAgo }
            }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]);

        const totalChecks = statusCounts.reduce((sum, s) => sum + s.count, 0);
        const downCount = statusCounts.find(s => s._id === "DOWN")?.count || 0;
        const uptimePercentage = totalChecks > 0 ? ((totalChecks - downCount) / totalChecks * 100).toFixed(2) : 100;

        const notificationCount = await Notification.countDocuments({
          beacon: beacon._id,
          sentAt: { $gte: thirtyDaysAgo }
        });

        return {
          beaconId: beacon._id,
          beaconTitle: beacon.title,
          status: beacon.lastStatus,
          uptimePercentage: parseFloat(uptimePercentage),
          downCount,
          notificationCount
        };
      })
    );

    res.json({
      summary: summaries,
      totalBeacons: beacons.length
    });
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
};

// ================= LOG BEACON STATUS (for internal use) =================
export const logBeaconStatus = async (beaconId, userId, status, duration, statusCode, errorMessage) => {
  try {
    await BeaconStatus.create({
      beacon: beaconId,
      user: userId,
      status,
      duration,
      statusCode,
      errorMessage
    });
  } catch (error) {
    console.error("Error logging beacon status:", error);
  }
};

// ================= LOG NOTIFICATION (for internal use) =================
export const logNotification = async (beaconId, userId, type, title, message) => {
  try {
    await Notification.create({
      beacon: beaconId,
      user: userId,
      type,
      title,
      message
    });
  } catch (error) {
    console.error("Error logging notification:", error);
  }
};

// ================= SEND ANALYTICS EMAIL ON DEMAND =================
export const sendAnalyticsEmailOnDemand = async (req, res) => {
  const { beaconId } = req.params;
  const userId = req.user._id;

  try {
    const beacon = await Beacon.findOne({ _id: beaconId, user: userId });
    if (!beacon) {
      return res.status(404).json({ error: "Beacon not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get analytics data
    const statusCounts = await BeaconStatus.aggregate([
      {
        $match: {
          beacon: beacon._id,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalChecks = statusCounts.reduce((sum, s) => sum + s.count, 0);
    const downCount = statusCounts.find(s => s._id === "DOWN")?.count || 0;
    const uptimePercentage = totalChecks > 0 ? ((totalChecks - downCount) / totalChecks * 100).toFixed(2) : 100;

    const avgDuration = await BeaconStatus.aggregate([
      {
        $match: {
          beacon: beacon._id,
          duration: { $exists: true, $ne: null },
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" }
        }
      }
    ]);

    const notificationCount = await Notification.countDocuments({
      beacon: beacon._id,
      sentAt: { $gte: thirtyDaysAgo }
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = await BeaconStatus.aggregate([
      {
        $match: {
          beacon: beacon._id,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          upCount: {
            $sum: { $cond: [{ $eq: ["$status", "UP"] }, 1, 0] }
          },
          downCount: {
            $sum: { $cond: [{ $eq: ["$status", "DOWN"] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    const analyticsData = {
      uptimePercentage: parseFloat(uptimePercentage),
      downCount,
      totalChecks,
      notificationCount,
      avgResponseTime: avgDuration[0]?.avgDuration?.toFixed(2) || 0,
      dailyStats
    };

    await sendAnalyticsEmail(user.email, beacon.title, analyticsData);

    res.json({
      message: "Analytics email sent successfully",
      email: user.email
    });
  } catch (error) {
    console.error("Error sending analytics email:", error);
    res.status(500).json({ error: "Failed to send analytics email" });
  }
};
