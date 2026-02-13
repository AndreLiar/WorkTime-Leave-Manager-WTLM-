# Deployment Testing Guide

## 🌐 After Deployment - How to Test

Once the CD pipeline completes and your app is deployed to Render, here's how to test it:

---

## 1️⃣ Get Your Render App URL

After CD completes, you'll see your app URL in the workflow logs:
```
🌐 Your app is live at: https://your-app-name.onrender.com
```

**OR** Find it in your Render Dashboard:
- Go to: https://dashboard.render.com/
- Click on your service
- Copy the URL at the top (e.g., `https://worktime-leave-manager.onrender.com`)

---

## 2️⃣ Quick Health Check (Browser)

Open your browser and visit:
```
https://your-app-name.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-13T14:18:43.110Z",
  "uptime": 123.456
}
```

---

## 3️⃣ Test with cURL (Command Line)

### Check App Info
```bash
curl https://your-app-name.onrender.com/
```

### Create a Leave Request
```bash
curl -X POST https://your-app-name.onrender.com/leave-requests \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "leaveType": "vacation",
    "startDate": "2026-03-01T00:00:00Z",
    "endDate": "2026-03-07T00:00:00Z",
    "reason": "Family vacation"
  }'
```

### Get All Leave Requests
```bash
curl https://your-app-name.onrender.com/leave-requests
```

### Get Statistics
```bash
curl https://your-app-name.onrender.com/leave-requests/statistics
```

---

## 4️⃣ Test with Postman (Visual Testing)

### Option A: Use the Collection File
1. Open Postman
2. Click **Import**
3. Select the file: `test/postman/leave-request-api.postman_collection.json`
4. Update the `baseUrl` variable to your Render URL
5. Click "Run Collection" to test all 12 scenarios

### Option B: Manual Testing
1. Create a new request in Postman
2. Set URL to: `https://your-app-name.onrender.com/leave-requests`
3. Choose method: POST
4. Set Headers: `Content-Type: application/json`
5. Add Body (raw JSON):
```json
{
  "employeeId": "EMP001",
  "leaveType": "vacation",
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-03-07T00:00:00Z",
  "reason": "Family vacation"
}
```
6. Click **Send**

---

## 5️⃣ Run Newman Tests Against Production

From your local machine:

```bash
# Install Newman globally if you haven't
npm install -g newman

# Run the test collection against your deployed app
newman run test/postman/leave-request-api.postman_collection.json \
  --env-var "baseUrl=https://your-app-name.onrender.com"
```

**Or** run with the npm script:
```bash
# Update the collection baseUrl first, then:
newman run test/postman/leave-request-api.postman_collection.json
```

---

## 6️⃣ Test All Endpoints

### Available Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | App information |
| GET | `/health` | Health check |
| POST | `/leave-requests` | Create leave request |
| GET | `/leave-requests` | List all requests |
| GET | `/leave-requests?employeeId=EMP001` | Filter by employee |
| GET | `/leave-requests/:id` | Get specific request |
| GET | `/leave-requests/statistics` | Get statistics |
| PATCH | `/leave-requests/:id/approve` | Approve request |
| PATCH | `/leave-requests/:id/reject` | Reject request |
| DELETE | `/leave-requests/:id` | Delete request |

---

## 7️⃣ Example Test Flow

### Complete Test Scenario:

```bash
# 1. Check health
curl https://your-app.onrender.com/health

# 2. Create a leave request (save the ID from response)
curl -X POST https://your-app.onrender.com/leave-requests \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "leaveType": "vacation",
    "startDate": "2026-03-01T00:00:00Z",
    "endDate": "2026-03-07T00:00:00Z",
    "reason": "Spring break"
  }'

# Response will include: "id": "LR000001"

# 3. Get all requests
curl https://your-app.onrender.com/leave-requests

# 4. Get specific request
curl https://your-app.onrender.com/leave-requests/LR000001

# 5. Approve the request
curl -X PATCH https://your-app.onrender.com/leave-requests/LR000001/approve

# 6. Check statistics
curl https://your-app.onrender.com/leave-requests/statistics

# 7. Filter by employee
curl https://your-app.onrender.com/leave-requests?employeeId=EMP001
```

---

## 8️⃣ Monitor Your App

### Check Logs in Render Dashboard:
1. Go to https://dashboard.render.com/
2. Click on your service
3. Click on **Logs** tab
4. See real-time logs of requests and responses

### Check Database:
- SQLite database is persistent on Render
- Data survives across deployments
- Located at `/data/wtlm.db` on the server

---

## 9️⃣ Troubleshooting

### App Not Responding?
```bash
# Check if the service is up
curl -I https://your-app.onrender.com/health

# Expected: HTTP/1.1 200 OK
```

### Free Tier Sleep Mode?
- Render free tier apps sleep after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
- Subsequent requests will be fast

### Check Deployment Status:
```bash
# View recent deployments
gh run list --workflow=cd.yml --limit 5
```

---

## 🎯 Quick Test Script

Save this as `test-deployed-api.sh`:

```bash
#!/bin/bash

# Replace with your actual Render URL
BASE_URL="https://your-app-name.onrender.com"

echo "🧪 Testing Deployed API..."
echo ""

echo "1️⃣ Health Check:"
curl -s "$BASE_URL/health" | jq
echo ""

echo "2️⃣ App Info:"
curl -s "$BASE_URL/" | jq
echo ""

echo "3️⃣ Creating Leave Request:"
RESPONSE=$(curl -s -X POST "$BASE_URL/leave-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "leaveType": "vacation",
    "startDate": "2026-03-01T00:00:00Z",
    "endDate": "2026-03-07T00:00:00Z",
    "reason": "Testing"
  }')
echo "$RESPONSE" | jq

REQUEST_ID=$(echo "$RESPONSE" | jq -r '.id')
echo ""

echo "4️⃣ Getting All Requests:"
curl -s "$BASE_URL/leave-requests" | jq
echo ""

echo "5️⃣ Statistics:"
curl -s "$BASE_URL/leave-requests/statistics" | jq
echo ""

echo "✅ All tests completed!"
```

Make it executable:
```bash
chmod +x test-deployed-api.sh
./test-deployed-api.sh
```

---

## 📊 Expected Results

### Successful Deployment:
✅ Health endpoint returns 200 OK  
✅ Can create leave requests  
✅ Data persists between requests  
✅ All CRUD operations work  
✅ Statistics calculate correctly  

### Performance:
- First request (cold start): ~30-60s on free tier
- Subsequent requests: <500ms
- API response times: <100ms (when warm)

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com/
- **Your App URL**: Check Render dashboard or CD logs
- **GitHub Actions**: https://github.com/YOUR_USERNAME/WorkTime-Leave-Manager-WTLM-/actions
- **Postman Collection**: `test/postman/leave-request-api.postman_collection.json`

---

## 💡 Pro Tips

1. **Bookmark your app URL** for easy access
2. **Import the Postman collection** for quick testing
3. **Check Render logs** if something doesn't work
4. **First request takes time** on free tier (cold start)
5. **Use Newman** to automate regression testing after deployments

Happy Testing! 🚀
