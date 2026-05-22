# Analytics Feature - Complete Implementation Summary

## 🎯 What Was Implemented

A comprehensive analytics and reporting system for SiteBeacon that tracks beacon performance, generates insights, and sends automated email reports.

## 📊 Key Features

### 1. **Real-Time Analytics Dashboard**
- View uptime percentage, downtime events, notifications count, and average response time
- Interactive 7-day performance chart
- List of recent downtime incidents
- One-click email reporting

### 2. **Automated Data Collection**
- Every beacon status check is logged automatically
- Status changes trigger notifications
- 30+ days of historical data retained
- No configuration needed

### 3. **Email Analytics Reports**
- Beautiful HTML emails with metrics and charts
- On-demand: Users can email reports anytime
- Scheduled: Daily/Weekly/Monthly automated emails
- Customizable timing via user preferences

### 4. **Analytics Settings**
- Enable/disable email reports
- Choose report frequency (daily/weekly/monthly)
- Select preferred day and time
- All settings persist in database

### 5. **Comprehensive Metrics**
Per beacon (30-day rolling window):
- Uptime percentage
- Number of downtime events
- Total checks performed
- Notifications sent
- Average response time
- 7-day daily breakdown

## 🗂️ Files Created/Modified

### Backend

**New Files:**
- `server/models/beaconStatusModel.js` - Track all status changes
- `server/models/notificationModel.js` - Log all notifications
- `server/controllers/analyticsController.js` - Analytics API logic
- `server/routes/analyticsRouter.js` - Analytics endpoints
- `server/utils/chartGenerator.js` - Server-side chart rendering
- `server/workers/analyticsReporter.js` - Scheduled email reports

**Modified Files:**
- `server/models/userModel.js` - Added analytics preferences
- `server/package.json` - Added chart.js, chartjs-node-canvas
- `server/server.js` - Integrated analytics router and reporter
- `server/workers/scheduler.js` - Added status/notification logging
- `server/utils/sendMail.js` - Added analytics email template

### Frontend

**New Files:**
- `frontend/src/Components/AnalyticsDashboard.jsx` - Analytics modal
- `frontend/src/Components/AnalyticsPreferences.jsx` - Settings modal

**Modified Files:**
- `frontend/src/Components/BeaconDetails.jsx` - Added analytics button
- `frontend/src/Profile.jsx` - Added analytics settings access
- `frontend/package.json` - Added chart.js, react-chartjs-2

### Documentation
- `ANALYTICS_FEATURE.md` - Complete implementation guide
- `setup-analytics.sh` - Installation script

## 🚀 API Endpoints Added

All endpoints require Bearer token authentication:

```
GET    /analytics/beacon/:beaconId           - Get analytics data
GET    /analytics/beacon/:beaconId/history   - Get status history
POST   /analytics/beacon/:beaconId/send-email - Send email report
GET    /analytics/summary                    - Summary for all beacons
GET    /analytics/preferences                - Get user preferences
PUT    /analytics/preferences                - Update preferences
```

## 🏗️ Database Schema

### BeaconStatus Collection
```javascript
{
  beacon: ObjectId,
  user: ObjectId,
  status: "UP" | "DOWN" | "UNKNOWN",
  duration: Number,      // response time in ms
  statusCode: Number,
  errorMessage: String,
  timestamp: Date
}
```

### Notification Collection
```javascript
{
  beacon: ObjectId,
  user: ObjectId,
  type: "status_down" | "status_up" | "threshold_exceeded" | "custom",
  title: String,
  message: String,
  read: Boolean,
  sentAt: Date
}
```

### User Model Addition
```javascript
analyticsPreferences: {
  emailReports: Boolean,          // default: true
  reportFrequency: "daily" | "weekly" | "monthly",  // default: weekly
  reportDay: Number,              // 0-6 for days of week, default: 0 (Sunday)
  reportTime: String,             // 24-hour format, default: "09:00"
  lastReportSent: Date
}
```

## 📈 How It Works

### Data Collection
1. Scheduler checks beacon status every interval
2. `logBeaconStatus()` creates BeaconStatus record
3. If status changes: `logNotification()` creates Notification record
4. Records are indexed by beacon, user, and timestamp

### Analytics Query
1. User opens analytics dashboard
2. Frontend calls `GET /analytics/beacon/:id`
3. Backend aggregates last 30 days of data
4. Returns metrics, incidents, and daily stats
5. Frontend renders chart and displays metrics

### Email Report
**On-Demand:**
1. User clicks "Email Report" button
2. Frontend calls `POST /analytics/beacon/:id/send-email`
3. Backend generates charts and email HTML
4. Brevo API sends email

**Scheduled:**
1. Cron job runs at 9 AM daily/weekly/monthly
2. Checks user preferences
3. For qualifying users, generates report
4. Sends email via Brevo API

## 🛠️ Installation Steps

### Backend
```bash
cd server
npm install chart.js chartjs-node-canvas
npm run dev
```

### Frontend
```bash
cd frontend
npm install chart.js react-chartjs-2
npm run dev
```

**Note:** No database migrations needed - collections created automatically

## 📖 Usage Examples

### View Analytics Dashboard
1. Go to Dashboard
2. Click "📊 Analytics" button on any beacon
3. View metrics and chart

### Send Email Report
1. Open analytics dashboard
2. Click "📧 Email Report"
3. Check inbox

### Configure Email Preferences
1. Go to Profile
2. Click "📊 Analytics Settings"
3. Configure frequency, day, and time
4. Click "Save"

## 🔒 Security

- ✅ All endpoints require authentication
- ✅ Users can only access their own data
- ✅ Status checks can't expose system info
- ✅ Email addresses validated before sending
- ✅ Charts generated server-side (no client exposure)

## 📊 Performance

- ✅ Indexed database queries (beacon, user, timestamp)
- ✅ MongoDB aggregation pipelines for efficiency
- ✅ Chart generation server-side (reduces client load)
- ✅ 7-day data for charts (not full 30-day)
- ✅ Lazy-loaded modals (no impact on dashboard load)

## 🧪 Testing Checklist

- [ ] Analytics data collection working
- [ ] Dashboard displays correct metrics
- [ ] 7-day chart renders properly
- [ ] On-demand email sends successfully
- [ ] Scheduled emails trigger at right time
- [ ] Email contains correct data and charts
- [ ] Preferences save and persist
- [ ] Only user's own data is accessible

## 🐛 Troubleshooting

**No analytics data?**
- Wait for status check to complete
- Check MongoDB connection
- Verify `logBeaconStatus()` in scheduler

**Email not sending?**
- Check Brevo API key in .env
- Verify preferences enabled
- Check server logs

**Chart not rendering?**
- Verify chart dependencies installed
- Check available system memory
- Try resending email

## 📚 Documentation

See `ANALYTICS_FEATURE.md` for:
- Detailed API documentation
- Complete troubleshooting guide
- Performance considerations
- Security notes
- Future enhancement ideas

## ✨ Highlights

✅ **Zero Configuration** - Works out of the box  
✅ **Real-Time Data** - Automatic collection with each check  
✅ **Beautiful Reports** - HTML emails with charts  
✅ **Flexible Scheduling** - Daily/weekly/monthly options  
✅ **User-Friendly** - Intuitive dashboard and settings  
✅ **Scalable** - Indexed queries for performance  
✅ **Secure** - Auth required, user data isolated  
✅ **Extensible** - Easy to add more metrics/charts

## 🎉 Next Steps

1. Install dependencies (npm install in server & frontend)
2. Start both servers (npm run dev)
3. Try adding a beacon and viewing its analytics
4. Configure email preferences and test reports
5. Check logs for any issues

Enjoy your new analytics feature! 📊
