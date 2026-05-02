# TeamFlow Deployment Guide - Railway

## Quick Deploy (5 minutes)

### Prerequisites
- Railway account (free): https://railway.app
- GitHub repo connected (already done ✓)
- MongoDB Atlas (already configured ✓)

### Step 1: Connect to Railway
1. Go to https://railway.app/dashboard
2. Click **New Project**
3. Select **Deploy from GitHub**
4. Authorize and select `Rahul-Cloud1/teamview`

### Step 2: Create Backend Service
1. **New Service** → **GitHub Repo**
2. Select repository
3. Set:
   - **Service Name:** `teamflow-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`

### Step 3: Add Environment Variables
In Backend Service → **Variables**:
```
MONGODB_URI=mongodb+srv://rahul22csu385_db_user:zjIXKRTpcjMe1N7Y@cluster0.robomct.mongodb.net/teamflow?retryWrites=true&w=majority
JWT_SECRET=teamflow-secure-secret-key-2026
PORT=4000
NODE_ENV=production
```

### Step 4: Create Frontend Service
Similar to backend:
1. **New Service** → **GitHub Repo**
2. **Root Directory:** `frontend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm run preview`

### Step 5: Link Services
In Frontend → **Variables** → Add:
```
VITE_API_URL=https://your-backend-service-url.railway.app
```

### Step 6: Deploy
Click **Deploy** on both services. Railway will:
- Build Docker images
- Run tests
- Deploy to production
- Provide public URLs

### Step 7: Get Live URLs
- Backend: `https://<service-name>.railway.app`
- Frontend: `https://<service-name>.railway.app`

---

## Troubleshooting

**Service won't start?**
- Check build logs: Railway Dashboard → Service → Logs
- Verify PORT is set in env vars
- Ensure all npm scripts exist in package.json

**MongoDB connection fails?**
- Verify IP whitelist in MongoDB Atlas: https://cloud.mongodb.com
- Check MONGODB_URI format and credentials

**Frontend can't call backend?**
- Update `VITE_API_URL` in frontend env vars
- Ensure CORS is enabled on backend

---

## Testing the Live App
1. Visit frontend URL
2. Sign up with email/password
3. Create project
4. Create and assign tasks
5. Track task status

---

## Documentation
- Frontend Code: [frontend/src/](../frontend/src/)
- Backend Code: [backend/src/](../backend/src/)
- Main README: [README.md](../README.md)
