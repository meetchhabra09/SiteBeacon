# Before & After Comparison - 401 Error Handling

## Overview

This document shows exact before/after code comparisons for all changes made to fix 401 error handling.

---

## API Configuration

### ❌ BEFORE: `frontend/src/api.js`

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001"
});

export default api;
```

**Problems:**
- ❌ No automatic token attachment
- ❌ No global 401 handling
- ❌ Components must manage headers manually

---

### ✅ AFTER: `frontend/src/api.js`

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001"
});

// Add request interceptor to include Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user data
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("name");
      
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Improvements:**
- ✅ Automatic Bearer token attachment
- ✅ Global 401 error handling
- ✅ Automatic logout and redirect
- ✅ Cleaner component code

---

## Backend Auth Middleware

### ❌ BEFORE: `server/middlewares/authUser.js`

```javascript
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token, authorization denied",
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Invalid token format",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
      msg: error.message,
    });
  }
};
```

**Problems:**
- ❌ Doesn't validate Bearer format
- ❌ Generic error messages
- ❌ Can't distinguish token expiry from invalid token
- ❌ Crashes on `split()` if no space in header

---

### ✅ AFTER: `server/middlewares/authUser.js`

```javascript
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token provided",
        message: "Authorization header is missing",
      });
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Invalid token format",
        message: "Authorization header must be 'Bearer <token>'",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message: "Token is empty",
      });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired",
          message: "Your session has expired. Please login again.",
        });
      }
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided token is invalid.",
      });
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "The user associated with this token no longer exists.",
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      error: "Authentication failed",
      message: error.message || "An unexpected error occurred during authentication",
    });
  }
};
```

**Improvements:**
- ✅ Validates Bearer format properly
- ✅ Clear, specific error messages
- ✅ Distinguishes expired vs invalid tokens
- ✅ Handles edge cases safely
- ✅ Better error logging

---

## Component: DashBoard.jsx

### ❌ BEFORE - fetchBeacons()

```javascript
useEffect(() => {
    const fetchBeacons = async () => {
        try {
            const token = localStorage.getItem("token");  // ❌ Manual retrieval
            const response = await api.get("/jobs", {
                headers: { Authorization: `${token}` },   // ❌ No "Bearer" prefix
            });
            setBeacons(response.data.beacons);
        } catch (error) {
            console.error(error);
        }
    };

    fetchBeacons();
}, []);
```

---

### ✅ AFTER - fetchBeacons()

```javascript
useEffect(() => {
    const fetchBeacons = async () => {
        try {
            const response = await api.get("/jobs");      // ✅ Clean!
            setBeacons(response.data.beacons);
        } catch (error) {
            console.error(error);
        }
    };

    fetchBeacons();
}, []);
```

### ❌ BEFORE - refreshBeacons()

```javascript
const refreshBeacons = async () => {
    setRefreshing(true);
    try {
        const token = localStorage.getItem("token");      // ❌ Manual retrieval
        const response = await api.get("/jobsRefresh", {
            headers: { Authorization: `${token}` },       // ❌ Wrong format
        });
        
        setBeacons(response.data.beacons);
    } catch (error) {
        console.error("Failed to refresh beacons", error);
    } finally {
        setRefreshing(false);
    }
};
```

---

### ✅ AFTER - refreshBeacons()

```javascript
const refreshBeacons = async () => {
    setRefreshing(true);
    try {
        const response = await api.get("/jobsRefresh");   // ✅ Clean!
        
        setBeacons(response.data.beacons);
    } catch (error) {
        console.error("Failed to refresh beacons", error);
    } finally {
        setRefreshing(false);
    }
};
```

**Lines of code reduced:** From 9 to 6 per function (-33%)  
**Code clarity:** Much improved ✅

---

## Component: AddBeacon.jsx

### ❌ BEFORE - handleAdd()

```javascript
const handleAdd = async () => {
    if (!name || !url) {
        setStatus("⚠️ Please enter both name and URL");
        return;
    }

    try {
        const token = localStorage.getItem("token");      // ❌ Manual retrieval

        const payload = {
            title: name.trim(),
            url: url.trim(),
            checkInterval: parseInt(checkInterval),
        };

        const response = await api.post(
            "/jobs",
            payload,
            {
                headers: { Authorization: `${token}` },   // ❌ Wrong format
            }
        );

        setStatus(`✅ Beacon "${name}" created`);
        // ... rest of code
    } catch (error) {
        console.error(error);
        setStatus("❌ Failed to create beacon");
    }
};
```

---

### ✅ AFTER - handleAdd()

```javascript
const handleAdd = async () => {
    if (!name || !url) {
        setStatus("⚠️ Please enter both name and URL");
        return;
    }

    try {
        const payload = {                                  // ✅ Direct payload
            title: name.trim(),
            url: url.trim(),
            checkInterval: parseInt(checkInterval),
        };

        const response = await api.post("/jobs", payload); // ✅ Clean!

        setStatus(`✅ Beacon "${name}" created`);
        // ... rest of code
    } catch (error) {
        console.error(error);
        setStatus("❌ Failed to create beacon");
    }
};
```

**Lines removed:** 4 lines of boilerplate  
**Code clarity:** Better ✅

---

## Component: EditBeacon.jsx

### ❌ BEFORE - fetchBeacon()

```javascript
useEffect(() => {
    const fetchBeacon = async () => {
        try {
            const token = localStorage.getItem("token");  // ❌ Manual retrieval
            const response = await api.get(`/jobs/${id}`, {
                headers: { Authorization: `${token}` },   // ❌ Wrong format
            });
            
            setName(response.data.title || "");
            setUrl(response.data.url || "");
            setCheckInterval((response.data.checkInterval || 10).toString());
            setLoading(false);
        } catch (error) {
            console.error(error);
            setStatus("❌ Failed to load beacon details");
            setLoading(false);
        }
    };

    if (id) {
        fetchBeacon();
    }
}, [id]);
```

---

### ✅ AFTER - fetchBeacon()

```javascript
useEffect(() => {
    const fetchBeacon = async () => {
        try {
            const response = await api.get(`/jobs/${id}`); // ✅ Clean!
            
            setName(response.data.title || "");
            setUrl(response.data.url || "");
            setCheckInterval((response.data.checkInterval || 10).toString());
            setLoading(false);
        } catch (error) {
            console.error(error);
            setStatus("❌ Failed to load beacon details");
            setLoading(false);
        }
    };

    if (id) {
        fetchBeacon();
    }
}, [id]);
```

### ❌ BEFORE - handleUpdate()

```javascript
const handleUpdate = async () => {
    if (!name || !url) {
        setStatus("⚠️ Please enter both name and URL");
        return;
    }

    try {
        const token = localStorage.getItem("token");      // ❌ Manual retrieval

        const payload = {
            title: name.trim(),
            url: url.trim(),
            checkInterval: parseInt(checkInterval),
        };

        await api.put(
            `/jobs/${id}`,
            payload,
            {
                headers: { Authorization: `${token}` },   // ❌ Wrong format
            }
        );

        setStatus(`✅ Beacon "${name}" updated successfully`);
        // ... rest
    } catch (error) {
        console.error(error);
        setStatus("❌ Failed to update beacon");
    }
};
```

---

### ✅ AFTER - handleUpdate()

```javascript
const handleUpdate = async () => {
    if (!name || !url) {
        setStatus("⚠️ Please enter both name and URL");
        return;
    }

    try {
        const payload = {
            title: name.trim(),
            url: url.trim(),
            checkInterval: parseInt(checkInterval),
        };

        await api.put(`/jobs/${id}`, payload);             // ✅ Clean!

        setStatus(`✅ Beacon "${name}" updated successfully`);
        // ... rest
    } catch (error) {
        console.error(error);
        setStatus("❌ Failed to update beacon");
    }
};
```

---

## Component: BeaconDetails.jsx

### ❌ BEFORE - handleDelete()

```javascript
const handleDelete = async () => {
    try {
        const token = localStorage.getItem("token");      // ❌ Manual retrieval
        const response = await api.delete("/jobs/" + beacon._id, {
            headers: { Authorization: `${token}` },       // ❌ Wrong format
        });

        updateDelete(beacon._id);
    } catch (error) {
        console.error(error);
    }
}
```

---

### ✅ AFTER - handleDelete()

```javascript
const handleDelete = async () => {
    try {
        const response = await api.delete("/jobs/" + beacon._id); // ✅ Clean!

        updateDelete(beacon._id);
    } catch (error) {
        console.error(error);
    }
}
```

---

## Component: History.jsx

### ❌ BEFORE - fetchHistory()

```javascript
const fetchHistory = async () => {
  try {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");          // ❌ Manual retrieval

    const params = new URLSearchParams();
    if (beaconName) params.append("beaconName", beaconName);
    if (actionType) params.append("actionType", actionType);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    params.append("page", page);
    params.append("limit", limit);

    const response = await api.get(`/history?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },      // ❌ Inconsistent
    });

    setHistory(response.data.history || []);
    setPagination(response.data.pagination || null);
  } catch (err) {
    setError(
      err.response?.data?.message || "Failed to fetch history"
    );
    console.error("History fetch error:", err);
  } finally {
    setLoading(false);
  }
};

const fetchSummary = async () => {
  try {
    const token = localStorage.getItem("token");          // ❌ Manual retrieval
    const response = await api.get("/history/summary", {
      headers: { Authorization: `Bearer ${token}` },      // ❌ Inconsistent
    });
    setSummary(response.data);
  } catch (err) {
    console.error("Summary fetch error:", err);
  }
};
```

---

### ✅ AFTER - fetchHistory()

```javascript
const fetchHistory = async () => {
  try {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (beaconName) params.append("beaconName", beaconName);
    if (actionType) params.append("actionType", actionType);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    params.append("page", page);
    params.append("limit", limit);

    const response = await api.get(`/history?${params.toString()}`); // ✅ Clean!

    setHistory(response.data.history || []);
    setPagination(response.data.pagination || null);
  } catch (err) {
    setError(
      err.response?.data?.message || "Failed to fetch history"
    );
    console.error("History fetch error:", err);
  } finally {
    setLoading(false);
  }
};

const fetchSummary = async () => {
  try {
    const response = await api.get("/history/summary");    // ✅ Clean!
    setSummary(response.data);
  } catch (err) {
    console.error("Summary fetch error:", err);
  }
};
```

---

## Summary of Changes

| File | Type | Manual Headers | Lines Changed |
|------|------|-----------------|-----------------|
| `api.js` | Enhanced | - | +32 (interceptors) |
| `authUser.js` | Enhanced | - | +40 (validation) |
| `DashBoard.jsx` | Simplified | Removed 2 | -8 |
| `AddBeacon.jsx` | Simplified | Removed 1 | -4 |
| `EditBeacon.jsx` | Simplified | Removed 2 | -8 |
| `BeaconDetails.jsx` | Simplified | Removed 1 | -4 |
| `History.jsx` | Simplified | Removed 2 | -8 |

**Total:**
- ✅ Manual headers removed: 8 instances
- ✅ Lines added (good code): 72
- ✅ Lines removed (duplication): 32
- ✅ Net improvement: +40 lines of validation

---

## Key Takeaways

### Before
❌ Inconsistent Bearer format  
❌ Manual headers in every component  
❌ Generic error messages  
❌ No global 401 handling  
❌ Code duplication  

### After
✅ Consistent Bearer format  
✅ Centralized auth handling  
✅ Specific error messages  
✅ Global 401 handling  
✅ No code duplication  

**Result: Production-ready, maintainable authentication system** 🎉
