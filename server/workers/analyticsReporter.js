import cron from 'node-cron';
import User from '../models/userModel.js';
import Beacon from '../models/beaconModel.js';
import BeaconStatus from '../models/beaconStatusModel.js';
import Notification from '../models/notificationModel.js';
import { sendAnalyticsEmail } from '../utils/sendMail.js';

export function startAnalyticsReporter() {
  // Run every day at specified times
  cron.schedule('0 9 * * *', async () => {
    console.log('[Analytics Reporter] Running daily analytics reports...');
    await sendScheduledAnalyticsReports('daily');
  });

  cron.schedule('0 9 * * 0', async () => {
    console.log('[Analytics Reporter] Running weekly analytics reports...');
    await sendScheduledAnalyticsReports('weekly');
  });

  cron.schedule('0 9 1 * *', async () => {
    console.log('[Analytics Reporter] Running monthly analytics reports...');
    await sendScheduledAnalyticsReports('monthly');
  });

  console.log('Analytics Reporter scheduler started.');
}

async function sendScheduledAnalyticsReports(frequency) {
  try {
    const users = await User.find({
      'analyticsPreferences.emailReports': true,
      'analyticsPreferences.reportFrequency': frequency
    }).populate('beacons');

    for (const user of users) {
      try {
        // Check if it's the right day for weekly reports
        if (frequency === 'weekly') {
          const today = new Date().getDay();
          const reportDay = user.analyticsPreferences.reportDay || 0;
          if (today !== reportDay) continue;
        }

        // Send analytics for each beacon
        for (const beacon of user.beacons) {
          await sendBeaconAnalyticsEmail(user, beacon);
        }

        // Update last report sent time
        user.analyticsPreferences.lastReportSent = new Date();
        await user.save();

        console.log(`[Analytics Reporter] Sent ${frequency} report to ${user.email}`);
      } catch (error) {
        console.error(`[Analytics Reporter] Error sending report to ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error('[Analytics Reporter] Error in scheduled reports:', error);
  }
}

async function sendBeaconAnalyticsEmail(user, beacon) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get status counts
    const statusCounts = await BeaconStatus.aggregate([
      {
        $match: {
          beacon: beacon._id,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate uptime
    const totalChecks = statusCounts.reduce((sum, s) => sum + s.count, 0);
    const downCount = statusCounts.find(s => s._id === 'DOWN')?.count || 0;
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
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      beacon: beacon._id,
      sentAt: { $gte: thirtyDaysAgo }
    });

    // Get 7-day stats for chart
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
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          upCount: {
            $sum: { $cond: [{ $eq: ['$status', 'UP'] }, 1, 0] }
          },
          downCount: {
            $sum: { $cond: [{ $eq: ['$status', 'DOWN'] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
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

    // Send email
    await sendAnalyticsEmail(user.email, beacon.title, analyticsData);
  } catch (error) {
    console.error(`[Analytics Reporter] Error sending email for beacon ${beacon.title}:`, error);
  }
}
