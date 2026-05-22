# Beacon History Feature - Test Scenarios

## 🧪 Comprehensive Test Cases

### Test 1: Create Beacon and Verify History
**Objective**: Verify "add" action is logged when beacon is created

```bash
# 1. Create a new beacon
POST /jobs
Authorization: Bearer <token>
{
  "title": "Google Status",
  "url": "https://www.google.com",
  "checkInterval": 10
}

# Expected: Beacon created successfully

# 2. Query history
GET /history
Authorization: Bearer <token>

# Expected Response:
{
  "history": [
    {
      "actionType": "add",
      "beaconTitle": "Google Status",
      "beaconUrl": "https://www.google.com",
      "changedFields": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": { "total": 1, "pages": 1 }
}
```

---

### Test 2: Edit Beacon and Verify Change Tracking
**Objective**: Verify "edit" action logs changes (old vs new values)

```bash
# 1. Edit the beacon (change title)
PUT /jobs/<beacon_id>
Authorization: Bearer <token>
{
  "title": "Google Health Check",
  "url": "https://www.google.com",
  "checkInterval": 10
}

# Expected: Beacon updated successfully

# 2. Query history with beacon name filter
GET /history?beaconName=Google
Authorization: Bearer <token>

# Expected Response:
{
  "history": [
    {
      "actionType": "edit",
      "beaconTitle": "Google Health Check",
      "beaconUrl": "https://www.google.com",
      "changedFields": {
        "title": {
          "old": "Google Status",
          "new": "Google Health Check"
        }
      },
      "createdAt": "2024-01-15T10:35:00.000Z"
    },
    {
      "actionType": "add",
      "beaconTitle": "Google Status",
      "beaconUrl": "https://www.google.com",
      "changedFields": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Test 3: Update Check Interval and Verify Logging
**Objective**: Verify interval changes are logged as "edit" actions

```bash
# 1. Update check interval
PATCH /jobs/<beacon_id>/interval
Authorization: Bearer <token>
{
  "checkInterval": 20
}

# Expected: Check interval updated successfully

# 2. Query history for this beacon
GET /history?beaconName=Google&actionType=edit
Authorization: Bearer <token>

# Expected: Edit action with checkInterval change
{
  "changedFields": {
    "checkInterval": {
      "old": 10,
      "new": 20
    }
  }
}
```

---

### Test 4: Delete Beacon and Verify History
**Objective**: Verify "delete" action is logged

```bash
# 1. Delete a beacon
DELETE /jobs/<beacon_id>
Authorization: Bearer <token>

# Expected: Beacon deleted successfully

# 2. Query history
GET /history
Authorization: Bearer <token>

# Expected: Delete action appears in history
{
  "actionType": "delete",
  "beaconTitle": "Google Health Check",
  "beaconUrl": "https://www.google.com",
  "changedFields": null,
  "createdAt": "2024-01-15T10:40:00.000Z"
}

# Note: Beacon is gone from /jobs, but action is preserved in history
```

---

### Test 5: Filter by Action Type
**Objective**: Verify filtering by specific action types works

```bash
# 1. Get only "add" actions
GET /history?actionType=add
Authorization: Bearer <token>

# Expected: Only "add" actions returned

# 2. Get only "edit" actions
GET /history?actionType=edit
Authorization: Bearer <token>

# Expected: Only "edit" actions returned

# 3. Get only "delete" actions
GET /history?actionType=delete
Authorization: Bearer <token>

# Expected: Only "delete" actions returned
```

---

### Test 6: Filter by Date Range
**Objective**: Verify date range filtering works

```bash
# 1. Get history from specific date range
GET /history?fromDate=2024-01-01&toDate=2024-01-31
Authorization: Bearer <token>

# Expected: Only actions from January 2024

# 2. Get history from a specific date onwards
GET /history?fromDate=2024-01-15
Authorization: Bearer <token>

# Expected: All actions from Jan 15 onwards

# 3. Get history up to a specific date
GET /history?toDate=2024-01-20
Authorization: Bearer <token>

# Expected: All actions up to Jan 20
```

---

### Test 7: Case-Insensitive Beacon Name Search
**Objective**: Verify beacon name filtering is case-insensitive

```bash
# Create beacons with different cases
POST /jobs
{ "title": "GitHub Monitor", "url": "https://github.com" }

POST /jobs
{ "title": "google search", "url": "https://google.com" }

# 1. Search with uppercase
GET /history?beaconName=GITHUB
Authorization: Bearer <token>

# Expected: Finds "GitHub Monitor"

# 2. Search with lowercase
GET /history?beaconName=google
Authorization: Bearer <token>

# Expected: Finds "google search"

# 3. Search with mixed case
GET /history?beaconName=GiThUb
Authorization: Bearer <token>

# Expected: Finds "GitHub Monitor"
```

---

### Test 8: Pagination
**Objective**: Verify pagination works correctly

```bash
# Create multiple beacons (e.g., 50)
for i in {1..50}; do
  POST /jobs
  { "title": "Beacon $i", "url": "https://example.com/$i" }
done

# 1. Get first page (default 20 items)
GET /history?page=1&limit=20
Authorization: Bearer <token>

# Expected Response:
{
  "history": [...20 items...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}

# 2. Get second page
GET /history?page=2&limit=20
Authorization: Bearer <token>

# Expected: Items 21-40

# 3. Get custom page size
GET /history?page=1&limit=50
Authorization: Bearer <token>

# Expected: All 50 items in one page
```

---

### Test 9: History Summary Statistics
**Objective**: Verify summary endpoint returns correct counts

```bash
# After performing various actions, get summary
GET /history/summary
Authorization: Bearer <token>

# Expected Response:
{
  "total": 45,
  "add": 25,
  "edit": 15,
  "delete": 5
}
```

---

### Test 10: Combined Filters
**Objective**: Verify multiple filters work together

```bash
# Get GitHub edits from January 2024
GET /history?beaconName=GitHub&actionType=edit&fromDate=2024-01-01&toDate=2024-01-31&page=1&limit=50
Authorization: Bearer <token>

# Expected: Only GitHub edit actions from January 2024
```

---

### Test 11: User Isolation
**Objective**: Verify users only see their own history

```bash
# 1. User A creates a beacon
POST /jobs
Authorization: Bearer <token_user_a>
{ "title": "User A Beacon", "url": "https://example.com/a" }

# 2. User B queries history
GET /history
Authorization: Bearer <token_user_b>

# Expected: User B's history (no "User A Beacon" visible)

# 3. User A queries history
GET /history
Authorization: Bearer <token_user_a>

# Expected: Includes "User A Beacon"
```

---

### Test 12: Invalid Date Handling
**Objective**: Verify invalid dates are handled gracefully

```bash
# 1. Invalid date format
GET /history?fromDate=2024-13-45
Authorization: Bearer <token>

# Expected: Invalid date is ignored, returns all records

# 2. Valid ISO format
GET /history?fromDate=2024-01-15T10:30:00.000Z
Authorization: Bearer <token>

# Expected: Works correctly
```

---

### Test 13: Pagination Limits
**Objective**: Verify pagination constraints are enforced

```bash
# 1. Try to exceed max limit
GET /history?page=1&limit=200
Authorization: Bearer <token>

# Expected: Limit clamped to 100

# 2. Try negative page
GET /history?page=-5
Authorization: Bearer <token>

# Expected: Page defaults to 1

# 3. Try page 0
GET /history?page=0
Authorization: Bearer <token>

# Expected: Page defaults to 1
```

---

### Test 14: Partial Beacon Name Matching
**Objective**: Verify partial name searches work

```bash
# Create beacons
POST /jobs { "title": "GitHub Monitor", "url": "https://github.com" }
POST /jobs { "title": "GitHub API", "url": "https://api.github.com" }
POST /jobs { "title": "GitLab Dashboard", "url": "https://gitlab.com" }

# Search for "hub"
GET /history?beaconName=hub
Authorization: Bearer <token>

# Expected: Returns both "GitHub Monitor" and "GitHub API" and "GitLab Dashboard"
```

---

### Test 15: Multiple Field Changes in Single Edit
**Objective**: Verify all changes are tracked when multiple fields are edited

```bash
# 1. Edit multiple fields at once
PUT /jobs/<beacon_id>
Authorization: Bearer <token>
{
  "title": "New Title",
  "url": "https://new-url.com",
  "checkInterval": 20
}

# 2. Query history
GET /history?actionType=edit
Authorization: Bearer <token>

# Expected: changedFields includes all changes:
{
  "changedFields": {
    "title": { "old": "Old Title", "new": "New Title" },
    "url": { "old": "https://old-url.com", "new": "https://new-url.com" },
    "checkInterval": { "old": 10, "new": 20 }
  }
}
```

---

## ✅ Expected Outcomes

All tests should pass with:
- ✅ Correct action types logged
- ✅ Accurate change tracking
- ✅ Proper filtering functionality
- ✅ Correct pagination behavior
- ✅ User data isolation
- ✅ Timestamp accuracy
- ✅ Case-insensitive searches
- ✅ Robust error handling

---

## 🐛 Troubleshooting

### History not appearing
- Ensure authentication token is valid
- Check MongoDB connection
- Verify BeaconHistory collection exists

### Filters not working
- Verify query parameter names are correct
- Check date format (use ISO format)
- Ensure beaconName is URL-encoded if needed

### Wrong user seeing history
- Verify middleware is enforcing user isolation
- Check token claims for correct userId

---

## 📊 Success Criteria

✅ All 15 test scenarios pass  
✅ History logged for all beacon operations  
✅ Filters work individually and combined  
✅ Pagination enforces limits correctly  
✅ Date filtering works with ISO format  
✅ User isolation is enforced  
✅ Change tracking captures all modifications  
✅ Summary statistics are accurate  
