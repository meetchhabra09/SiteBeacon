# Beacon History Feature Documentation

## Overview
The Beacon History Feature tracks all user actions related to beacons (add, edit, delete) with timestamps and provides comprehensive filtering capabilities.

## New Files Created

### 1. `server/models/beaconHistoryModel.js`
**Purpose**: MongoDB schema for storing beacon history records

**Schema Fields**:
- `user` (ObjectId, required): Reference to the User who performed the action
- `beacon` (ObjectId): Reference to the Beacon (may be null for deleted beacons)
- `actionType` (String, enum: ["add", "edit", "delete"]): Type of action performed
- `beaconTitle` (String): Snapshot of beacon title at time of action
- `beaconUrl` (String): Snapshot of beacon URL at time of action
- `changedFields` (Object): For edit actions, captures what changed (old and new values)
- `createdAt` (Date): Timestamp of when the action occurred (indexed)

**Indexes**: 
- Compound index on `user` and `createdAt` for efficient filtering
- Index on `beaconTitle` for name searches

---

### 2. `server/controllers/historyController.js`
**Purpose**: Handles beacon history operations and filtering

**Exported Functions**:

#### `logBeaconAction(userId, beaconId, actionType, beaconTitle, beaconUrl, changedFields)`
- **Purpose**: Logs a beacon action to history
- **Parameters**:
  - `userId` (ObjectId): User performing the action
  - `beaconId` (ObjectId): ID of the beacon (can be null for deletion context)
  - `actionType` (String): "add", "edit", or "delete"
  - `beaconTitle` (String): Title of the beacon
  - `beaconUrl` (String): URL of the beacon
  - `changedFields` (Object, optional): For edits, object with changed field details
- **Note**: Called automatically from beacon endpoints, no need to call directly

#### `getBeaconHistory(req, res)` - GET /history
- **Purpose**: Retrieves beacon history with advanced filtering
- **Authentication**: Required (authUser middleware)
- **Query Parameters**:
  - `beaconName` (String, optional): Filter by beacon name (case-insensitive)
  - `actionType` (String, optional): Filter by action type ("add", "edit", "delete")
  - `fromDate` (String, optional): Filter from date (ISO format)
  - `toDate` (String, optional): Filter to date (ISO format)
  - `page` (Number, default: 1): Page number for pagination
  - `limit` (Number, default: 20, max: 100): Items per page

- **Response**:
```json
{
  "history": [
    {
      "_id": "...",
      "user": "...",
      "beacon": "...",
      "actionType": "add",
      "beaconTitle": "Example Site",
      "beaconUrl": "https://example.com",
      "changedFields": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### `getHistorySummary(req, res)` - GET /history/summary
- **Purpose**: Get aggregate statistics of beacon actions
- **Authentication**: Required (authUser middleware)
- **Response**:
```json
{
  "total": 150,
  "add": 50,
  "edit": 80,
  "delete": 20
}
```

---

### 3. `server/routes/historyRouter.js`
**Purpose**: Express router for history endpoints

**Routes**:
- `GET /` - Get beacon history (with filters)
- `GET /summary` - Get history summary statistics

---

## Modified Files

### `server/server.js`
**Changes Made**:
1. Added imports for `historyRouter` and `BeaconHistory` model
2. Added import for `logBeaconAction` from history controller
3. Registered history routes: `app.use("/history", historyRouter)`
4. Updated POST `/jobs` - logs "add" action when beacon is created
5. Updated PUT `/jobs/:id` - logs "edit" action with changed fields
6. Updated PATCH `/jobs/:id/interval` - logs "edit" action for interval changes
7. Updated DELETE `/jobs/:id` - logs "delete" action before deletion

---

## API Usage Examples

### Get All History (Paginated)
```bash
GET /history?page=1&limit=20
Authorization: Bearer <token>
```

### Filter by Beacon Name
```bash
GET /history?beaconName=Google
Authorization: Bearer <token>
```

### Filter by Date Range
```bash
GET /history?fromDate=2024-01-01&toDate=2024-01-31
Authorization: Bearer <token>
```

### Filter by Action Type
```bash
GET /history?actionType=edit
Authorization: Bearer <token>
```

### Combine Multiple Filters
```bash
GET /history?beaconName=GitHub&actionType=edit&fromDate=2024-01-01&page=1&limit=50
Authorization: Bearer <token>
```

### Get History Summary
```bash
GET /history/summary
Authorization: Bearer <token>
```

---

## Data Integrity Features

1. **Immutable History**: History records cannot be modified or deleted
2. **Snapshots**: Title and URL are captured at time of action to preserve history accuracy
3. **Change Tracking**: Edit actions capture what changed (old vs new values)
4. **Indexes**: Database indexes optimize common query patterns
5. **Soft Reference**: Beacon reference preserved even if beacon is deleted

---

## Features Implemented

✅ **Track beacon actions**: Add, Edit, Delete  
✅ **Filter by beacon name** (case-insensitive)  
✅ **Filter by date range** (from and to dates)  
✅ **Filter by action type**  
✅ **Pagination support** (default 20 items, max 100)  
✅ **Change tracking** for edit operations  
✅ **Summary statistics** of all actions  
✅ **Automatic logging** - no manual calls needed  

---

## Performance Considerations

- Database indexes on frequently queried fields (user, createdAt, beaconTitle)
- Compound index for user + date filtering
- Lean queries used for history retrieval (no unnecessary population)
- Pagination prevents large dataset transfers
- Async logging doesn't block beacon operations

---

## Future Enhancements (Optional)

- Export history to CSV/PDF
- Archive old history records
- Real-time history via WebSocket
- Search by status changes (e.g., from UP to DOWN)
- Audit trail with IP address and user agent
- Undo/Redo capability for certain actions
