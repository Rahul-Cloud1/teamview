# TeamFlow — Team Task Manager

A full-stack web application for creating projects, assigning tasks, and tracking progress with role-based access control.

## Features

✅ **Authentication** — Signup/Login with JWT tokens  
✅ **Projects & Teams** — Create projects and manage team members  
✅ **Task Management** — Create, assign, and track task status  
✅ **Dashboard** — Overview of tasks, status, and overdue items  
✅ **Role-Based Access** — Admin and Member roles with permissions  
✅ **REST API** — Full backend API with MongoDB  

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

## Railway Deployment

1. **Create a Railway account** and link your GitHub repo
2. **Create two services:**
   - **Backend:** Node.js service pointing to `backend/` with build command `npm install`
   - **Frontend:** Node.js service pointing to `frontend/` with build command `npm install && npm run build`
3. **Set environment variables:**
   - Add MongoDB URL (Railway plugin or MongoDB Atlas)
   - Set `JWT_SECRET`
4. **Deploy** — Railway auto-deploys on push
