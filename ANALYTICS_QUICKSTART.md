# 🚀 Quick Start - Analytics Feature

## What You Get

📊 **Analytics Dashboard** - View beacon metrics with beautiful charts  
📧 **Email Reports** - Automated or on-demand analytics reports  
⚙️ **Preferences** - Customize when and how you get reports  
📈 **7-Day Charts** - Visual performance trends  
🔔 **Notifications** - Track all uptime/downtime events  

## Installation (2 Steps)

### Step 1: Backend
```bash
cd server
npm install chart.js chartjs-node-canvas
npm run dev
```

### Step 2: Frontend
```bash
cd frontend
npm install chart.js react-chartjs-2
npm run dev
```

✅ That's it! Analytics are live.

## Using Analytics

### View Dashboard
1. Go to Dashboard
2. Click **📊 Analytics** button on any beacon
3. See uptime %, downtime events, notifications, response time
4. View 7-day performance chart

### Send Email Report
1. Open analytics dashboard
2. Click **📧 Email Report**
3. Check your email!

### Configure Emails
1. Go to **Profile**
2. Click **📊 Analytics Settings**
3. Turn on email reports
4. Choose: Daily / Weekly / Monthly
5. Set time and day
6. Click **Save**

## What Gets Tracked

Per beacon (30 days):
- ✅ Uptime percentage
- ✅ How many times went down
- ✅ Total notifications
- ✅ Average response time
- ✅ Daily breakdown

## Email Report Contains

- 📊 All metrics in cards
- 📈 7-day performance chart
- 🔔 Recent incidents list
- 🎯 Status indicators

## New Buttons

| Button | Location | Action |
|--------|----------|--------|
| **📊 Analytics** | Beacon card | Open analytics dashboard |
| **📧 Email Report** | Analytics modal | Send report via email |
| **⚙️ Analytics Settings** | Profile page | Configure email preferences |

## Endpoints (Developer)

```
GET    /analytics/beacon/:id          - Get analytics
POST   /analytics/beacon/:id/send-email - Email report
GET    /analytics/preferences         - Get settings
PUT    /analytics/preferences         - Update settings
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No analytics data | Wait for beacon check to complete |
| Email not sending | Check Brevo API key in .env |
| Chart not showing | Run: `npm install` again |

## Key Files Modified

**Backend:**
- ✅ `models/beaconStatusModel.js` - NEW
- ✅ `models/notificationModel.js` - NEW
- ✅ `controllers/analyticsController.js` - NEW
- ✅ `routes/analyticsRouter.js` - NEW
- ✅ `workers/scheduler.js` - UPDATED
- ✅ `utils/sendMail.js` - UPDATED

**Frontend:**
- ✅ `Components/AnalyticsDashboard.jsx` - NEW
- ✅ `Components/AnalyticsPreferences.jsx` - NEW
- ✅ `Components/BeaconDetails.jsx` - UPDATED
- ✅ `Profile.jsx` - UPDATED

## Email Example

```
From: SiteBeacon <noreply@sitebeacon.com>
Subject: 📊 Analytics Report: My Website

┌─────────────────────────────────────┐
│         ANALYTICS REPORT            │
│         My Website                  │
├─────────────────────────────────────┤
│ ✅ Uptime: 99.5%                    │
│ 🔴 Downtime Events: 2               │
│ 🔔 Notifications: 5                 │
│ ⚡ Avg Response: 245ms              │
├─────────────────────────────────────┤
│     [7-Day Performance Chart]       │
├─────────────────────────────────────┤
│ Recent Incidents:                   │
│ • 2024-05-20 14:30 - DOWN (120s)   │
│ • 2024-05-19 09:15 - DOWN (45s)    │
└─────────────────────────────────────┘
```

## Default Settings

- Email Reports: **Enabled**
- Frequency: **Weekly**
- Day: **Sunday** (0)
- Time: **09:00** (9 AM)

Change anytime in Analytics Settings!

## One More Thing

📚 For detailed docs, see: `ANALYTICS_FEATURE.md`

Happy monitoring! 🎉
