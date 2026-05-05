# TeamFlow — Team Task Manager

A full-stack web application for creating projects, assigning tasks, and tracking progress with role-based access control.

## 🚀 Live Demo

- **Frontend:** [https://teamview-production.up.railway.app/](https://teamview-production.up.railway.app/)
- **Backend API:** [https://backend-team-view-production.up.railway.app/](https://backend-team-view-production.up.railway.app/)

## Features

✅ **Authentication** — Signup/Login with JWT tokens  
✅ **Projects & Teams** — Create projects and manage team members  
✅ **Task Management** — Create, assign, and track task status  
✅ **Dashboard** — Overview of tasks, status, and overdue items  
✅ **Role-Based Access** — Admin and Member roles with permissions  
✅ **REST API** — Full backend API with MongoDB  
✅ **Production Ready** — Deployed and running on Railway  

## Tech Stack

**Backend:** Node.js + Express + MongoDB + Mongoose  
**Frontend:** React 18 + Vite + React Router + Axios  
**Auth:** JWT + bcryptjs  
**Deployment:** Railway  

## Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm run dev
```

The server runs on `http://localhost:4000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` with proxy to backend API.

## API Endpoints

### Auth
- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Log in

### Projects
- `POST /api/projects` — Create project
- `GET /api/projects` — List projects (filtered by membership for Members, all for Admins)
- `GET /api/projects/:id` — Get project details
- `POST /api/projects/:id/members` — Add member to project (Admin only)

### Tasks
- `POST /api/tasks` — Create task
- `GET /api/tasks` — List tasks (with filters: `project`, `status`, `overdue`)
- `GET /api/tasks/:id` — Get task details
- `PATCH /api/tasks/:id` — Update task (status, assignee, etc.)
- `DELETE /api/tasks/:id` — Delete task

## Environment Variables

`.env` example:

```
MONGODB_URI=mongodb://localhost:27017/teamflow
JWT_SECRET=your-secret-key-here
PORT=4000
NODE_ENV=development
```

## Deployment Status

✅ **Production Deployed** — Application is live on Railway  
- Frontend deployed and accessible at [https://teamview-production.up.railway.app/](https://teamview-production.up.railway.app/)
- Backend API deployed and accessible at [https://backend-team-view-production.up.railway.app/](https://backend-team-view-production.up.railway.app/)
- Auto-deployment enabled on GitHub push
- MongoDB Atlas integration configured

For detailed deployment configuration, see [RAILWAY.md](./RAILWAY.md)

## Railway Deployment

This project is deployed on [Railway.app](https://railway.app/) with auto-deployment enabled:

1. **Two services deployed:**
   - **Backend:** Node.js service with MongoDB connection
   - **Frontend:** React/Vite application with production build

2. **Environment configuration:**
   - MongoDB URI connected via Railway plugin
   - JWT_SECRET configured securely
   - CORS enabled for cross-origin requests

3. **Auto-deployment:**
   - Automatic redeployment on push to main branch
   - Zero-downtime deployments with Railway's deployment strategy
