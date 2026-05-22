# Beacon History Feature - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT / FRONTEND                          │
│                    (React / Vue / Angular)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS SERVER                            │
│                        (server.js)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         BEACON ENDPOINTS                               │   │
│  │  POST   /jobs          → logBeaconAction("add")        │   │
│  │  PUT    /jobs/:id      → logBeaconAction("edit")       │   │
│  │  PATCH  /jobs/:id      → logBeaconAction("edit")       │   │
│  │  DELETE /jobs/:id      → logBeaconAction("delete")     │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │      HISTORY CONTROLLER                                │   │
│  │  (controllers/historyController.js)                    │   │
│  │                                                         │   │
│  │  • logBeaconAction()                                  │   │
│  │  • getBeaconHistory()                                 │   │
│  │  • getHistorySummary()                                │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │      HISTORY ROUTER                                    │    │
│  │  (routes/historyRouter.js)                            │    │
│  │                                                        │    │
│  │  GET  /history         → getBeaconHistory()          │    │
│  │  GET  /history/summary → getHistorySummary()         │    │
│  └────────────────────────────────────────────────────────┘    │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              │ Database Queries
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                    MONGODB DATABASE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Collection: beaconhistories                         │       │
│  │  (models/beaconHistoryModel.js)                      │       │
│  │                                                      │       │
│  │  Indexes:                                           │       │
│  │  • { user: 1, createdAt: -1 }  [Compound Index]    │       │
│  │  • { beaconTitle: 1 }          [Name Search]       │       │
│  │  • { createdAt: 1 }            [Date Filtering]    │       │
│  │                                                      │       │
│  │  Document Structure:                                │       │
│  │  {                                                   │       │
│  │    _id: ObjectId,                                   │       │
│  │    user: ObjectId (ref: User),                      │       │
│  │    beacon: ObjectId (ref: Beacon),                  │       │
│  │    actionType: "add|edit|delete",                   │       │
│  │    beaconTitle: String,                             │       │
│  │    beaconUrl: String,                               │       │
│  │    changedFields: Object || null,                   │       │
│  │    createdAt: Date                                  │       │
│  │  }                                                   │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### When User Creates a Beacon

```
User POSTs /jobs
      │
      ▼
authUser middleware verifies JWT
      │
      ▼
Create Beacon document in DB
      │
      ▼
Call logBeaconAction(userId, beaconId, "add", ...)
      │
      ▼
Create BeaconHistory record
      │
      ▼
Return success response to client
```

### When User Edits a Beacon

```
User PUTs /jobs/:id
      │
      ▼
Fetch existing beacon
      │
      ▼
Detect changed fields (title, url, interval)
      │
      ▼
Build changedFields object
      │
      ▼
Update beacon document
      │
      ▼
Call logBeaconAction(..., "edit", changedFields)
      │
      ▼
Create BeaconHistory record with changes
      │
      ▼
Return success response
```

### When User Queries History

```
User GETs /history?beaconName=X&fromDate=Y&toDate=Z
      │
      ▼
authUser middleware verifies JWT
      │
      ▼
Build MongoDB filter:
  • user: userId
  • beaconTitle: { $regex, $options: "i" }
  • createdAt: { $gte, $lte }
      │
      ▼
Execute query with compound index
      │
      ▼
Apply sorting (descending by createdAt)
      │
      ▼
Apply pagination (skip & limit)
      │
      ▼
Return history with pagination metadata
```

---

## Query Performance Optimization

### Indexes Used

```
┌─────────────────────────────────────┐
│    Filter Scenario                  │
├─────────────────────────────────────┤
│ (user, createdAt)   → Compound     │
│   Fast for: User + Date filtering  │
│                                     │
│ (beaconTitle)       → Index        │
│   Fast for: Name searches          │
│                                     │
│ (createdAt)         → Index        │
│   Fast for: Date range queries     │
└─────────────────────────────────────┘
```

### Query Example

```javascript
// Without index:
db.beaconhistories.find({ 
  user: userId, 
  createdAt: { $gte: fromDate, $lte: toDate }
})
// Scanning entire collection ❌ Slow

// With compound index (user, createdAt):
// MongoDB uses index to find matching user documents
// Then quickly filters by date range ✅ Fast
```

---

## Feature Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    BEACON OPERATIONS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /jobs                 DELETE /jobs/:id                │
│     │                              │                        │
│     └──► logBeaconAction() ◄───────┘                        │
│         ("add")                    ("delete")               │
│                                                              │
│  PUT /jobs/:id              PATCH /jobs/:id/interval        │
│     │                              │                        │
│     └──► logBeaconAction() ◄───────┘                        │
│         ("edit")                   ("edit")                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │
         │ All actions logged
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              BEACON HISTORY COLLECTION                      │
│           (Immutable audit trail maintained)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Supports:                                                  │
│  • GET /history (filtered & paginated)                     │
│  • GET /history/summary (statistics)                       │
│  • User isolation (JWT enforced)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Flow

```
┌──────────────────────────┐
│   HTTP Request with JWT  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  authUser Middleware     │
│  • Verify JWT signature  │
│  • Extract userId        │
│  • Attach to req.user    │
└────────────┬─────────────┘
             │
         ┌───┴───┐
         │       │
      Valid   Invalid
         │       │
         ▼       ▼
    Proceed   Reject (401)
             Return error
         │
         ▼
┌──────────────────────────┐
│  Controller Function     │
│  • Use req.user._id      │
│  • Filter by userId      │
│  • Return only own data  │
└──────────────────────────┘
```

---

## Filtering Logic

```
GET /history?beaconName=GitHub&actionType=edit&fromDate=2024-01-01

                            │
                            ▼
┌─────────────────────────────────────────┐
│  Parse Query Parameters                 │
│  • beaconName = "GitHub"                │
│  • actionType = "edit"                  │
│  • fromDate = "2024-01-01"              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Build MongoDB Filter Object            │
│  {                                      │
│    user: userId,                        │
│    beaconTitle: {                       │
│      $regex: "GitHub",                  │
│      $options: "i"  (case-insensitive)  │
│    },                                   │
│    actionType: "edit",                  │
│    createdAt: { $gte: fromDate }        │
│  }                                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Execute Query with Indexes             │
│  • Use compound index (user, createdAt) │
│  • Use name search index                │
│  • Sort by createdAt (descending)       │
│  • Skip and limit for pagination        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Return Filtered Results with Stats     │
│  {                                      │
│    history: [...],                      │
│    pagination: {                        │
│      page, limit, total, pages          │
│    }                                    │
│  }                                      │
└─────────────────────────────────────────┘
```

---

## Change Tracking Example

### Before Edit
```json
{
  "title": "Google",
  "url": "https://google.com",
  "checkInterval": 10
}
```

### Edit Request
```
PUT /jobs/:id
{
  "title": "Google Search",
  "url": "https://search.google.com",
  "checkInterval": 10
}
```

### History Record Created
```json
{
  "actionType": "edit",
  "beaconTitle": "Google Search",
  "beaconUrl": "https://search.google.com",
  "changedFields": {
    "title": {
      "old": "Google",
      "new": "Google Search"
    },
    "url": {
      "old": "https://google.com",
      "new": "https://search.google.com"
    }
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Pagination Example

### Request
```
GET /history?page=2&limit=25
```

### Response
```json
{
  "history": [25 items from records 26-50],
  "pagination": {
    "page": 2,
    "limit": 25,
    "total": 1500,
    "pages": 60
  }
}
```

### Calculation
```
• Skip = (page - 1) * limit = (2 - 1) * 25 = 25
• Total pages = Math.ceil(1500 / 25) = 60
• Returned range: Records 26-50
```

---

## Summary Statistics

### Aggregation Pipeline

```
[
  { $match: { user: userId } },
  {
    $group: {
      _id: "$actionType",
      count: { $sum: 1 }
    }
  }
]
```

### Example Result
```json
[
  { "_id": "add", "count": 50 },
  { "_id": "edit", "count": 80 },
  { "_id": "delete", "count": 20 }
]
```

### Transformed Response
```json
{
  "total": 150,
  "add": 50,
  "edit": 80,
  "delete": 20
}
```

---

**This architecture ensures secure, performant, and comprehensive beacon history tracking!**
