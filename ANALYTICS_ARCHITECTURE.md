# Analytics Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SITEBEACON ANALYTICS                        │
└─────────────────────────────────────────────────────────────────┘

                         FRONTEND (React)
    ┌──────────────────────────────────────────────────────┐
    │                                                      │
    │  ┌─────────────────────────────────────────────┐    │
    │  │     BeaconDetails.jsx                       │    │
    │  │  ┌─────────────────────────────────────┐   │    │
    │  │  │  📊 Analytics Button               │   │    │
    │  │  └──────────┬──────────────────────────┘   │    │
    │  │             │                              │    │
    │  │  ┌──────────▼──────────────────────────┐   │    │
    │  │  │ AnalyticsDashboard.jsx              │   │    │
    │  │  │ • Metrics Cards                     │   │    │
    │  │  │ • 7-Day Chart (Chart.js)           │   │    │
    │  │  │ • Incidents List                    │   │    │
    │  │  │ • Email Button                      │   │    │
    │  │  └────────────────────────────────────┘   │    │
    │  │                                            │    │
    │  └─────────────────────────────────────────────┘    │
    │                                                      │
    │  ┌─────────────────────────────────────────────┐    │
    │  │     Profile.jsx                            │    │
    │  │  ┌─────────────────────────────────────┐   │    │
    │  │  │  ⚙️ Analytics Settings              │   │    │
    │  │  │  • Email Toggle                    │   │    │
    │  │  │  • Frequency Selection             │   │    │
    │  │  │  • Time Configuration              │   │    │
    │  │  └────────────────────────────────────┘   │    │
    │  └─────────────────────────────────────────────┘    │
    │                                                      │
    └──────────────────────┬───────────────────────────────┘
                           │ HTTP Requests
                           │ (Bearer Token)
                           ▼
    ┌──────────────────────────────────────────────────────┐
    │              BACKEND (Node.js/Express)              │
    │                                                      │
    │  ┌────────────────────────────────────────────────┐ │
    │  │   analyticsRouter.js                          │ │
    │  │  • GET /beacon/:id                           │ │
    │  │  • POST /beacon/:id/send-email              │ │
    │  │  • GET/PUT /preferences                     │ │
    │  └────────────────────────────────────────────────┘ │
    │                      │                              │
    │  ┌───────────────────▼───────────────────────────┐  │
    │  │   analyticsController.js                     │  │
    │  │  • getBeaconAnalytics()                      │  │
    │  │  • sendAnalyticsEmailOnDemand()             │  │
    │  │  • getAnalyticsPreferences()                │  │
    │  │  • logBeaconStatus() ◄─┐                   │  │
    │  │  • logNotification()   │                   │  │
    │  │                        │                   │  │
    │  │  Uses aggregation pipes:                    │  │
    │  │  • statusCounts (UP/DOWN)                  │  │
    │  │  • avgDuration (response time)             │  │
    │  │  • notificationCount                       │  │
    │  │  • dailyStats (7-day breakdown)           │  │
    │  └────────────────────────────────────────────┘  │
    │                      │                            │
    │                      ├──────────────────┐         │
    │                      │                  │         │
    │        ┌─────────────▼──────┐  ┌───────▼──────┐  │
    │        │   scheduler.js     │  │ chartGenerator
    │        │   (Beacon Checks)  │  │ .js           │  │
    │        │                    │  │               │  │
    │        │ Calls:             │  │ Server-side   │  │
    │        │ checkWebsite()     │  │ Chart.js      │  │
    │        │       │            │  │ rendering     │  │
    │        │       ├─►  ┌─────────────────┐       │  │
    │        │       │   │ logBeaconStatus() │      │  │
    │        │       │   └────┬──────────────┘      │  │
    │        │       │        │ if changed          │  │
    │        │       │        ▼                     │  │
    │        │       │    logNotification()         │  │
    │        │       │                              │  │
    │        └───────▼──────────────────────────┘  │  │
    │                                              │  │
    │        ┌─────────────────────────────────┐   │  │
    │        │ analyticsReporter.js (Cron)    │   │  │
    │        │                                │   │  │
    │        │ Schedules:                     │   │  │
    │        │ • Daily @ 9 AM                │   │  │
    │        │ • Weekly @ 9 AM               │   │  │
    │        │ • Monthly @ 9 AM              │   │  │
    │        │                                │   │  │
    │        │ For each user:                 │   │  │
    │        │ 1. Check preferences          │   │  │
    │        │ 2. Fetch analytics data ──────┼───┘  │
    │        │ 3. Generate charts           │      │
    │        │ 4. Create email HTML         │      │
    │        │ 5. Send via Brevo API        │      │
    │        └─────────────────────────────────┘     │
    │                      │                         │
    │                      ▼                         │
    │        ┌─────────────────────────────────┐    │
    │        │    sendMail.js                  │    │
    │        │    sendAnalyticsEmail()         │    │
    │        └─────────────────────────────────┘    │
    │                                                │
    └────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
      ┌─────────┐   ┌──────────┐   ┌──────────────┐
      │ MongoDB │   │  Brevo   │   │ User Email   │
      │         │   │  API     │   │  Inbox       │
      │ Beacon  │   │          │   │              │
      │ Status  │   │Sends     │   │Receives      │
      │         │   │Email     │   │Report        │
      │Notif.   │   │          │   │              │
      │         │   │          │   │              │
      │Prefs.   │   │          │   │              │
      └─────────┘   └──────────┘   └──────────────┘
```

## Data Flow: Status Check to Email

```
┌─────────────────────────────────────────────────────────────────┐
│                    BEACON STATUS CHECK FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. SCHEDULER RUNS (every second)
   ├─ Check if beacon.nextExecution ≤ now
   └─ If yes, proceed:

2. CHECK WEBSITE
   ├─ checkWebsite(beacon.url)
   └─ Returns: { status, duration, statusCode, errorMessage }

3. UPDATE BEACON
   ├─ beacon.lastStatus = status
   ├─ beacon.lastDuration = duration
   ├─ beacon.lastExecution = now
   └─ beacon.nextExecution = now + interval

4. LOG STATUS ✨ (NEW)
   ├─ logBeaconStatus(beaconId, userId, status, duration, ...)
   └─ Creates BeaconStatus document

5. CHECK STATUS CHANGE
   ├─ If prevStatus !== status
   │  └─ Continue to step 6
   └─ Else, skip to step 7

6. LOG NOTIFICATION ✨ (NEW)
   ├─ If UP → DOWN: logNotification("status_down", title, message)
   ├─ If DOWN → UP: logNotification("status_up", title, message)
   └─ Creates Notification document

7. SEND REAL-TIME EMAIL
   ├─ If status === DOWN and not already sent:
   │  ├─ Get user email
   │  └─ Send beacon down alert
   └─ If status === UP and was DOWN:
      └─ Update alertSent flag

8. BROADCAST UPDATE
   ├─ io.to(userId).emit('beaconUpdate', beacon)
   └─ Frontend receives real-time update
```

## Data Flow: Email Report Generation

```
┌─────────────────────────────────────────────────────────────────┐
│              EMAIL REPORT GENERATION FLOW (On-Demand)            │
└─────────────────────────────────────────────────────────────────┘

USER CLICKS "📧 EMAIL REPORT"
            │
            ▼
FRONTEND CALLS: POST /analytics/beacon/:id/send-email
            │
            ▼
BACKEND: sendAnalyticsEmailOnDemand()
            │
            ├─ Verify beacon belongs to user ✓
            │
            ├─ FETCH 30-DAY ANALYTICS
            │  ├─ Aggregate BeaconStatus
            │  │  ├─ statusCounts (UP/DOWN/UNKNOWN)
            │  │  ├─ uptimePercentage = (UP / TOTAL) * 100
            │  │  └─ downCount
            │  │
            │  ├─ Calculate avgDuration
            │  │  └─ Average of all duration values
            │  │
            │  ├─ Count notifications
            │  │  └─ Notification documents in period
            │  │
            │  └─ Fetch dailyStats (7 days)
            │     ├─ Group by date
            │     ├─ Count UP/DOWN per day
            │     └─ Calculate daily uptime %
            │
            ├─ GENERATE CHART (if has data)
            │  ├─ Call generateUptimeChart(dailyStats)
            │  ├─ Create Chart.js config
            │  │  ├─ Line chart
            │  │  ├─ X-axis: dates
            │  │  └─ Y-axis: uptime %
            │  ├─ chartJSNodeCanvas.drawChart()
            │  └─ Convert to base64 PNG
            │
            ├─ CREATE EMAIL HTML
            │  ├─ generateAnalyticsEmailTemplate()
            │  ├─ Insert metrics into template:
            │  │  ├─ Uptime % (with color)
            │  │  ├─ Downtime count
            │  │  ├─ Notifications
            │  │  └─ Avg response time
            │  ├─ Embed chart image (base64)
            │  └─ Return formatted HTML
            │
            ├─ SEND EMAIL
            │  ├─ sendAnalyticsEmail(to, title, analytics, chart)
            │  ├─ Call sendMail() with HTML content
            │  └─ Brevo API sends email
            │
            └─ RETURN SUCCESS
               └─ Frontend shows confirmation
```

## Data Flow: Scheduled Reports

```
┌─────────────────────────────────────────────────────────────────┐
│                  SCHEDULED EMAIL REPORT FLOW                     │
└─────────────────────────────────────────────────────────────────┘

CRON TRIGGERS (daily 9 AM)
       │
       ▼
startAnalyticsReporter()
       │
       ├─ 0 9 * * * → Daily
       ├─ 0 9 * * 0 → Weekly (Sunday)
       └─ 0 9 1 * * → Monthly (1st)
       │
       ▼
FOR EACH USER WITH analyticsPreferences.emailReports = true
       │
       ├─ Check reportFrequency
       ├─ Check if today matches reportDay (for weekly)
       ├─ Check if today is 1st (for monthly)
       │
       ├─ IF MATCHES:
       │  │
       │  ├─ FOR EACH BEACON OF USER:
       │  │  │
       │  │  ├─ sendBeaconAnalyticsEmail()
       │  │  │  ├─ Query analytics (same as on-demand)
       │  │  │  ├─ Generate chart
       │  │  │  ├─ Create HTML email
       │  │  │  └─ Send email
       │  │  │
       │  │  └─ (repeat for each beacon)
       │  │
       │  ├─ UPDATE user.analyticsPreferences.lastReportSent
       │  └─ Log completion
       │
       └─ (repeat for each matching user)
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE RELATIONSHIPS                        │
└─────────────────────────────────────────────────────────────────┘

USER (users)
├─ _id: ObjectId
├─ name, email, password
├─ beacons: [ObjectId] ◄───────────┐
│                                  │
├─ analyticsPreferences            │
│  ├─ emailReports: Boolean        │
│  ├─ reportFrequency              │
│  ├─ reportDay                    │
│  ├─ reportTime                   │
│  └─ lastReportSent               │
│                                  │
└─ timestamps                      │
                                   │
BEACON (beacons) ◄────────────────┘
├─ _id: ObjectId
├─ title, url
├─ user: ObjectId ◄──────────┐
├─ lastStatus                │
├─ lastDuration             │
├─ lastExecution            │
├─ nextExecution            │
├─ alertSent                │
├─ checkInterval            │
└─ timestamps               │
                            │
BEACON_STATUS (beaconstatuses)
├─ _id: ObjectId
├─ beacon: ObjectId ◄──┘
├─ user: ObjectId ◄──────────────┐
├─ status: "UP"|"DOWN"|"UNKNOWN" │
├─ duration                      │
├─ statusCode                    │
├─ errorMessage                  │
└─ timestamp ◄────────┐          │
   (indexed)          │          │
                      │          │
NOTIFICATION (notifications)     │
├─ _id: ObjectId              │  │
├─ beacon: ObjectId           │  │
├─ user: ObjectId ◄───────────┼──┘
├─ type                       │
├─ title, message             │
├─ read: Boolean              │
└─ sentAt ◄───────────────────┘
   (indexed)
```

## Key Indexes

```sql
-- BeaconStatus indexes (for fast analytics queries)
db.beaconstatuses.createIndex({ beacon: 1, timestamp: -1 })
db.beaconstatuses.createIndex({ user: 1, timestamp: -1 })
db.beaconstatuses.createIndex({ beacon: 1, status: 1 })

-- Notification indexes
db.notifications.createIndex({ beacon: 1, sentAt: -1 })
db.notifications.createIndex({ user: 1, sentAt: -1 })
db.notifications.createIndex({ user: 1, read: 1 })
```

## API Request/Response Examples

```
REQUEST:
GET /analytics/beacon/64abc123def456
Authorization: Bearer <token>

RESPONSE:
{
  "beaconId": "64abc123def456",
  "beaconTitle": "My Website",
  "uptimePercentage": 99.72,
  "downCount": 2,
  "totalChecks": 720,
  "notificationCount": 4,
  "avgResponseTime": "145.67",
  "downtimeIncidents": [...],
  "dailyStats": [
    {
      "_id": { "year": 2024, "month": 5, "day": 14 },
      "upCount": 143,
      "downCount": 1,
      "totalCount": 144
    },
    ...
  ]
}
```

---

This architecture ensures:
- ✅ Real-time analytics collection
- ✅ Efficient database queries
- ✅ Beautiful email reports with charts
- ✅ Scalable scheduled reporting
- ✅ Isolated user data
