import BeaconHistory from "../models/beaconHistoryModel.js";

// ================= LOG BEACON ACTION =================
export const logBeaconAction = async (userId, beaconId, actionType, beaconTitle, beaconUrl, changedFields = null) => {
  try {
    await BeaconHistory.create({
      user: userId,
      beacon: beaconId,
      actionType,
      beaconTitle,
      beaconUrl,
      changedFields,
    });
  } catch (error) {
    console.error("Failed to log beacon action:", error);
  }
};

// ================= GET BEACON HISTORY WITH FILTERS =================
export const getBeaconHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { beaconName, fromDate, toDate, actionType, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * pageLimit;

    const filter = { user: userId };

    // Filter by beacon name (case-insensitive)
    if (beaconName && beaconName.trim()) {
      filter.beaconTitle = { $regex: beaconName.trim(), $options: "i" };
    }

    // Filter by action type
    if (actionType && ["add", "edit", "delete"].includes(actionType)) {
      filter.actionType = actionType;
    }

    // Filter by date range
    const dateFilter = {};
    if (fromDate) {
      const from = new Date(fromDate);
      if (!isNaN(from)) {
        dateFilter.$gte = from;
      }
    }
    if (toDate) {
      const to = new Date(toDate);
      if (!isNaN(to)) {
        to.setHours(23, 59, 59, 999);
        dateFilter.$lte = to;
      }
    }

    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }

    const total = await BeaconHistory.countDocuments(filter);
    const history = await BeaconHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    res.json({
      history,
      pagination: {
        page: pageNum,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch beacon history:", error);
    res.status(500).json({ error: "Failed to fetch beacon history" });
  }
};

// ================= GET HISTORY SUMMARY STATS =================
export const getHistorySummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const summary = await BeaconHistory.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$actionType",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: 0,
      add: 0,
      edit: 0,
      delete: 0,
    };

    summary.forEach(item => {
      stats[item._id] = item.count;
      stats.total += item.count;
    });

    res.json(stats);
  } catch (error) {
    console.error("Failed to fetch history summary:", error);
    res.status(500).json({ error: "Failed to fetch history summary" });
  }
};
