# Analytics Feature Implementation Guide

## Overview
A comprehensive analytics feature has been added to the SiteBeacon monitoring system that tracks beacon performance, sends analytics reports via email, and provides detailed insights through an interactive dashboard.

## What's New

### Backend Features

#### 1. **New Database Models**
- **BeaconStatusModel** - Tracks all beacon status changes with timestamps and metrics
- **NotificationModel** - Logs all notifications sent for each beacon
- **Updated UserModel** - Added analytics preferences (email frequency, report time, etc.)

#### 2. **Analytics API Endpoints**
All endpoints are authenticated (Bearer token required):

```
GET    /analytics/beacon/:beaconId         - Get beacon analytics with 30-day stats
GET    /analytics/beacon/:beaconId/history - Get detailed status history (paginated)
POST   /analytics/beacon/:beaconId/send-email - Send analytics report email on demand
GET    /analytics/summary                  - Get analytics summary for all beacons
GET    /analytics/preferences              - Get user's analytics preferences
PUT    /analytics/preferences              - Update analytics preferences
```

#### 3. **Automatic Analytics Collection**
- Every beacon status check is automatically logged to `BeaconStatus`
- Status changes (UP→DOWN, DOWN→UP) trigger notifications logged to `Notification`
- No manual configuration needed - works out of the box

#### 4. **Email Reporting System**
- **On-demand emails**: Users can email analytics anytime from the analytics dashboard
- **Scheduled emails**: Automated daily, weekly, or monthly reports
- **Smart scheduling**: Cron jobs handle timezone-aware scheduling
- **Chart generation**: Server-side chart rendering with Chart.js for beautiful email reports

#### 5. **Metrics Tracked**
Per beacon (30-day period):
- **Uptime %** - Percentage of time beacon was UP
- **Downtime Events** - Number of times beacon went down
- **Total Checks** - How many status checks were performed
- **Notifications** - Total notifications sent
- **Avg Response Time** - Average response time in milliseconds
- **Daily Stats** - 7-day trend data for charts

### Frontend Features

#### 1. **Analytics Dashboard Component**
New modal showing:
- Real-time metrics cards (uptime, downtime, notifications, response time)
- 7-day performance chart
- Recent downtime incidents list
- Refresh and email report buttons

Access: Click **📊 Analytics** button on any beacon card

#### 2. **Analytics Preferences Settings**
New settings modal allowing users to:
- Enable/disable analytics emails
- Choose report frequency (daily, weekly, monthly)
- Select preferred report day (for weekly)
- Set report time
- Preview analytics email

Access: Profile → **📊 Analytics Settings** button

#### 3. **Beacon Details Enhancement**
- Added prominent **📊 Analytics** button above Edit/Delete buttons
- One-click access to full analytics dashboard

## Installation & Setup

### Backend Setup

1. **Update Dependencies**
```bash
cd server
npm install chart.js chartjs-node-canvas
```

2. **Environment Variables**
No new environment variables needed - uses existing setup

3. **Database**
New collections created automatically on first use:
- `beaconstatuses` - Status logs
- `notifications` - Notification logs
- Updates to `users` collection add `analyticsPreferences` field

4. **Start Server**
```bash
npm run dev
```

Analytics reporter starts automatically when server boots

### Frontend Setup

1. **Update Dependencies**
```bash
cd frontend
npm install chart.js react-chartjs-2
```

2. **Components Added**
- `AnalyticsDashboard.jsx` - Main analytics modal
- `AnalyticsPreferences.jsx` - Preferences settings modal
- Updated `BeaconDetails.jsx` - Added analytics button
- Updated `Profile.jsx` - Added preferences access

3. **Start Frontend**
```bash
npm run dev
```

## Usage Guide

### Viewing Analytics

1. Go to Dashboard
2. Click **📊 Analytics** button on any beacon card
3. View metrics and 7-day chart
4. Click **🔄 Refresh** to update data
5. Click **📧 Email Report** to send via email

### Configuring Email Reports

1. Go to Profile page
2. Click **📊 Analytics Settings**
3. Toggle **Enable Email Reports**
4. Choose frequency:
   - **Daily**: Receives report every day at set time
   - **Weekly**: Receives report on specific day at set time
   - **Monthly**: Receives report on 1st of month at set time
5. Set preferred time (24-hour format)
6. Click **Save**

### What Users See in Email

Recipients get a beautifully formatted HTML email with:
- Uptime percentage with visual indicator
- Downtime count
- Notification statistics
- Average response time
- 7-day performance trend chart (visual)
- Company branding

## Technical Details

### Data Collection Flow

```
Beacon Status Check
    ↓
scheduler.js (checkWebsite)
    ↓
logBeaconStatus() → BeaconStatusModel
logNotification() → NotificationModel (if status changed)
    ↓
Email sent (if configured)
    ↓
Analytics data ready for reporting
```

### Email Report Generation

```
User clicks "Email Report" or cron triggers
    ↓
Fetch 30-day analytics from BeaconStatusModel
Calculate metrics (uptime %, downtime count, etc.)
    ↓
Fetch 7-day daily stats
    ↓
generateUptimeChart() → Create Chart.js image
    ↓
generateAnalyticsEmailTemplate() → Create HTML email
    ↓
sendAnalyticsEmail() → Send via Brevo API
    ↓
User receives email with charts
```

### Report Scheduling

Cron jobs run at:
- 9:00 AM daily (daily reports)
- 9:00 AM on set day weekly (weekly reports)
- 9:00 AM on 1st of month (monthly reports)

User's preferred time can be configured in settings

## API Response Examples

### Get Beacon Analytics
```json
{
  "beaconId": "64xyz...",
  "beaconTitle": "My Website",
  "uptimePercentage": 99.5,
  "downCount": 2,
  "totalChecks": 1440,
  "notificationCount": 5,
  "avgResponseTime": "245.32",
  "downtimeIncidents": [
    {
      "timestamp": "2024-05-20T14:30:00Z",
      "status": "DOWN",
      "duration": 120,
      "statusCode": 503,
      "errorMessage": "Service Unavailable"
    }
  ],
  "dailyStats": [
    {
      "_id": { "year": 2024, "month": 5, "day": 20 },
      "upCount": 143,
      "downCount": 1,
      "totalCount": 144
    }
  ]
}
```

### Get Preferences
```json
{
  "preferences": {
    "emailReports": true,
    "reportFrequency": "weekly",
    "reportDay": 0,
    "reportTime": "09:00",
    "lastReportSent": "2024-05-21T09:00:00Z"
  }
}
```

## File Structure

### Backend Files Created
```
server/
├── models/
│   ├── beaconStatusModel.js        (NEW)
│   ├── notificationModel.js        (NEW)
│   └── userModel.js                (UPDATED)
├── controllers/
│   └── analyticsController.js      (NEW)
├── routes/
│   └── analyticsRouter.js          (NEW)
├── utils/
│   ├── chartGenerator.js           (NEW)
│   └── sendMail.js                 (UPDATED)
├── workers/
│   ├── scheduler.js                (UPDATED)
│   └── analyticsReporter.js        (NEW)
└── server.js                       (UPDATED)
```

### Frontend Files Created
```
frontend/src/
├── Components/
│   ├── AnalyticsDashboard.jsx      (NEW)
│   ├── AnalyticsPreferences.jsx    (NEW)
│   └── BeaconDetails.jsx           (UPDATED)
└── Profile.jsx                     (UPDATED)
```

## Testing the Feature

### Manual Testing Checklist

1. **Analytics Data Collection**
   - [ ] Add a beacon
   - [ ] Wait for status checks to occur
   - [ ] Check MongoDB: `db.beaconstatuses.find()` should have records
   - [ ] Verify timestamps and status values

2. **Analytics Dashboard**
   - [ ] Navigate to dashboard
   - [ ] Click Analytics button on any beacon
   - [ ] Verify metrics display
   - [ ] Verify 7-day chart renders
   - [ ] Verify downtime incidents appear

3. **Email Report On-Demand**
   - [ ] Click "📧 Email Report" in analytics dashboard
   - [ ] Check inbox for email
   - [ ] Verify email contains all metrics
   - [ ] Verify charts are visible

4. **Scheduled Reports**
   - [ ] Go to Profile → Analytics Settings
   - [ ] Enable email reports
   - [ ] Set frequency to "daily" and time to 5 min ahead
   - [ ] Wait for cron to trigger
   - [ ] Verify email received

5. **Preferences**
   - [ ] Update all preferences
   - [ ] Refresh page
   - [ ] Verify preferences persisted
   - [ ] Disable emails and verify no email sent

## Troubleshooting

### Issue: No analytics data appearing
**Solution**: 
1. Check MongoDB connection
2. Wait for at least one beacon check to complete
3. Verify `logBeaconStatus()` is being called in scheduler
4. Check server logs for errors

### Issue: Email not sending
**Solution**:
1. Verify Brevo API key in `.env`
2. Check email preferences are enabled
3. Look for errors in server console
4. Verify beacon email is valid

### Issue: Charts not rendering in email
**Solution**:
1. Verify `chartjs-node-canvas` is installed
2. Check server logs for chart generation errors
3. Try resending report manually
4. Check available system memory (canvas requires ~50MB per chart)

### Issue: Cron jobs not running
**Solution**:
1. Check server logs for "Analytics Reporter scheduler started"
2. Verify `node-cron` is installed
3. Check system time/timezone
4. Restart server

## Performance Considerations

- **Database indexes** on BeaconStatus for fast queries
- **Aggregation pipelines** for efficient metric calculation
- **7-day data** used for charts (not full 30-day) to reduce data transfer
- **Server-side rendering** of charts to avoid client memory issues
- **Lazy loading** of analytics modal to not impact dashboard load time

## Security Notes

- All analytics endpoints require authentication
- Users can only access their own beacons' analytics
- Email sending uses configured Brevo account
- No sensitive data in analytics reports
- Status/error messages don't expose system details

## Future Enhancements

Potential features for future versions:
- [ ] Custom date range selection
- [ ] Export analytics as CSV/PDF
- [ ] Custom alert thresholds
- [ ] Comparison reports (week-over-week, month-over-month)
- [ ] Team analytics sharing
- [ ] Slack/Discord integration for alerts
- [ ] Multiple chart types (bar, pie, etc.)
- [ ] Anomaly detection

## Support & Documentation

For issues or questions:
1. Check troubleshooting section above
2. Review API endpoints documentation
3. Check component props in source files
4. Review MongoDB schema in model files
