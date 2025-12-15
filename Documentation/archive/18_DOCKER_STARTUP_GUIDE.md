# Docker Startup Guide - Step by Step

## 🔴 Issues Fixed

### Issue #1: Docker Daemon Not Running ✅ FIXED
**Error**: `The system cannot find the file specified`  
**Cause**: Docker Desktop application wasn't running  
**Solution**: Start Docker Desktop (see below)

### Issue #2: Obsolete docker-compose version ✅ FIXED
**Warning**: `version: '3.8'` is deprecated  
**Solution**: Removed from docker-compose.yml

### Issue #3: Missing Supabase Keys ✅ FIXED
**Problem**: Placeholder service key values  
**Solution**: Updated .env.docker with actual Supabase credentials

---

## 🚀 How to Start

### Step 1️⃣: Start Docker Desktop

On Windows, you have two options:

**Option A: GUI (Recommended)**
1. Press `Win` key
2. Type: `Docker`
3. Click `Docker Desktop` application
4. Wait for it to start (you'll see a whale icon in taskbar)
5. Wait for "Docker is running" message

**Option B: PowerShell (Alternative)**
```powershell
Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
```

⏳ **Wait 30-60 seconds** for Docker to fully start before next step.

---

### Step 2️⃣: Verify Docker is Running

```powershell
docker ps
```

**Expected Output**: 
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```
(Should NOT show an error)

If you see an error like "Cannot connect to Docker daemon", wait another 30 seconds and try again.

---

### Step 3️⃣: Start the Application

Navigate to your project folder and run:

```powershell
cd C:\Users\bapti\Documents\GoBeyondFitWebApp
docker-compose up
```

⏳ **First time**: Takes 2-5 minutes to build and start everything

**Expected sequence**:
1. `Building backend...` (1-2 min)
2. `Building frontend...` (1-2 min)
3. `postgres is ready...`
4. `backend is running...`
5. `frontend is running...`

---

### Step 4️⃣: Access Your Application

Once you see `frontend is running`, open these URLs:

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend** | http://localhost:3001 | Main web app |
| **API Docs** | http://localhost:3000/api/docs | Swagger UI - test API |
| **Database** | http://localhost:8080 | Adminer - database admin |

---

## ✅ Verification Checklist

### Services Running Check
After `docker-compose up`, you should see all 4 services running:

```bash
✅ postgres: "database system is ready to accept connections"
✅ backend: "NestJS app listening on port 3000"
✅ frontend: "started server on 0.0.0.0:3001"
✅ adminer: running on port 8080
```

### Network Connectivity Check
1. Open http://localhost:3001 → Should see login page
2. Open http://localhost:3000/api/docs → Should see Swagger UI
3. Open http://localhost:8080 → Should see Adminer database interface

### Database Check
In Adminer (http://localhost:8080):
- Login with username: `gobeyondfit`
- Login with password: `gobeyondfit_secure_password`
- Should see `gobeyondfit_db` database
- Tables should be listed (users, exercises, groups, programs, invitations, etc.)

---

## 🛑 Stopping the Application

To stop everything gracefully:

```powershell
docker-compose down
```

To stop AND remove all data:

```powershell
docker-compose down -v
```

---

## 🐛 Troubleshooting

### Problem: "Docker is not running"
**Solution**: Start Docker Desktop and wait 60 seconds

### Problem: "Port 3000 already in use"
**Cause**: Another service is using port 3000  
**Solution**:
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Or just change the port in .env.docker
BACKEND_PORT=3001
FRONTEND_PORT=3002
```

### Problem: "Cannot connect to database"
**Solution**: 
1. Stop containers: `docker-compose down`
2. Remove volume: `docker volume rm gobeyondfit_postgres_data`
3. Start fresh: `docker-compose up`

### Problem: "Frontend shows blank page"
**Solution**:
1. Check browser console for errors (F12)
2. Check logs: `docker-compose logs frontend`
3. Verify API_URL is correct: Should be `http://localhost:3000`

### Problem: "Build fails"
**Solution**:
```powershell
# Clean rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

---

## 📊 Useful Docker Commands

```powershell
# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend

# Run a command in a container
docker-compose exec backend sh

# Restart a service
docker-compose restart backend

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Remove all stopped containers
docker container prune
```

---

## 💡 Tips

- **First startup**: Takes longer (building images)
- **Subsequent startups**: Much faster (uses cached images)
- **Development**: Code changes auto-reload (volumes are mounted)
- **Database persistence**: Data stays between restarts
- **Clean slate**: Use `docker-compose down -v` to reset everything

---

## ✨ What's Running

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| PostgreSQL | gobeyondfit-postgres | 5432 | Database (internal) |
| Backend API | gobeyondfit-backend | 3000 | NestJS API server |
| Frontend | gobeyondfit-frontend | 3001 | Next.js web app |
| Adminer | gobeyondfit-adminer | 8080 | Database management UI |

---

## 🎯 Next Steps

Once everything is running:

1. ✅ Open http://localhost:3001
2. ✅ Test login with your Supabase user
3. ✅ Explore API at http://localhost:3000/api/docs
4. ✅ Check database at http://localhost:8080
5. ✅ Start building features!

---

**Need help?** Check the logs: `docker-compose logs`

Good luck! 🚀
