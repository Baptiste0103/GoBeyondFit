# ✅ GoBeyondFit MVP - Verification Checklist

## Pre-Deployment Verification

Use this checklist before starting Docker to ensure everything is configured correctly.

### 1. Environment Setup

- [ ] `.env` file exists (copied from `.env.docker`)
- [ ] Supabase credentials are filled in:
  - [ ] `SUPABASE_URL` is set
  - [ ] `SUPABASE_ANON_KEY` is set
  - [ ] `SUPABASE_SERVICE_KEY` is set
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] JWT_SECRET is set (not the default value)
- [ ] SMTP configuration (optional, test account will be used if not set)

### 2. Docker Installation

- [ ] Docker Desktop is installed
- [ ] Docker daemon is running: `docker --version`
- [ ] Docker Compose is available: `docker-compose --version`
- [ ] Version is 3.8 or higher

### 3. Project Structure

- [ ] Backend files exist: `backend/src/main.ts`
- [ ] Frontend files exist: `frontend/app/page.tsx`
- [ ] Dockerfile exists: `backend/Dockerfile`
- [ ] docker-compose.yml exists in root
- [ ] Prisma schema exists: `backend/prisma/schema.prisma`

### 4. Port Availability

- [ ] Port 3000 is available (backend)
- [ ] Port 3001 is available (frontend)
- [ ] Port 5432 is available (database)
- [ ] Port 8080 is available (Adminer, optional)

Check: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)

---

## Docker Startup Verification

### Step 1: Start Services

```bash
# Build and start
docker-compose up

# Or in background
docker-compose up -d
```

- [ ] No build errors in output
- [ ] All services started successfully
- [ ] No port conflicts reported

### Step 2: Check Service Status

```bash
docker-compose ps
```

Expected output:
```
NAME                  STATUS
gobeyondfit-postgres  Up (healthy)
gobeyondfit-backend   Up (healthy)
gobeyondfit-frontend  Up
gobeyondfit-adminer   Up (if dev profile)
```

- [ ] All services show "Up" status
- [ ] postgres shows "healthy"
- [ ] backend shows "healthy"
- [ ] No services show "Restarting" or "Exit"

### Step 3: Service Health Checks

#### Backend Health

```bash
curl http://localhost:3000/api/docs
```

- [ ] Returns HTML Swagger UI page (status 200)
- [ ] No connection refused errors

#### Frontend Health

```bash
curl http://localhost:3001/
```

- [ ] Returns HTML page (status 200)
- [ ] No connection refused errors

#### Database Health

```bash
docker-compose logs postgres
```

- [ ] No error messages
- [ ] Shows "ready to accept connections"
- [ ] No repeated restart messages

---

## Application Access Verification

### 1. API Documentation

Visit: **http://localhost:3000/api/docs**

- [ ] Swagger UI loads without errors
- [ ] Can see all endpoints listed
- [ ] Auth section shows 7 endpoints
- [ ] Exercises section shows 6 endpoints
- [ ] Groups section shows 10 endpoints
- [ ] Programs section shows 8 endpoints
- [ ] Invitations section shows 8 endpoints

### 2. Frontend Application

Visit: **http://localhost:3001/**

- [ ] Page loads successfully
- [ ] No console errors (F12 → Console tab)
- [ ] "GoBeyondFit" title visible
- [ ] Navigation links visible
- [ ] Login/Signup buttons present

### 3. Database Interface (Optional)

Visit: **http://localhost:8080/**

- [ ] Adminer loads
- [ ] System: PostgreSQL
- [ ] Server: postgres
- [ ] Username: gobeyondfit
- [ ] Database: gobeyondfit_db
- [ ] Click "Login" to verify database connection
- [ ] Should show all 14 entities

---

## Functionality Verification

### 1. Authentication Flow

1. [ ] Navigate to http://localhost:3001/auth/signup
2. [ ] Create account with test email
3. [ ] Select role (coach or student)
4. [ ] Submit form
5. [ ] (Supabase signup processing)
6. [ ] Navigate to http://localhost:3001/auth/login
7. [ ] Login with created account
8. [ ] Should redirect to home page

### 2. API Endpoint Testing (via Swagger)

1. [ ] Open http://localhost:3000/api/docs
2. [ ] Click "Authorize" button
3. [ ] Paste JWT token from login
4. [ ] Click "Authorize"

#### Test Create Exercise
1. [ ] Expand "Exercises" → "POST /exercises"
2. [ ] Click "Try it out"
3. [ ] Fill in example data:
   ```json
   {
     "name": "Push Ups",
     "type": "standard",
     "scope": "coach"
   }
   ```
4. [ ] Click "Execute"
5. [ ] Should return 201 with exercise data

#### Test Get Exercises
1. [ ] Expand "Exercises" → "GET /exercises"
2. [ ] Click "Execute"
3. [ ] Should return 200 with exercises array

#### Test Create Group
1. [ ] Expand "Groups" → "POST /groups"
2. [ ] Fill data and execute
3. [ ] Should return 201 with group data

#### Test Send Invitation
1. [ ] Expand "Invitations" → "POST /invitations"
2. [ ] Fill in groupId and toUserId
3. [ ] Click "Execute"
4. [ ] Should return 201 (email sent in background)

### 3. Error Handling

1. [ ] Send invalid request to API (missing required field)
2. [ ] Should return 400 with error message
3. [ ] Send request without token
4. [ ] Should return 401 "Unauthorized"
5. [ ] Send request to non-existent endpoint
6. [ ] Should return 404

### 4. Database Verification

```bash
# Open Prisma Studio
docker-compose exec backend npx prisma studio
```

- [ ] Opens on http://localhost:5555
- [ ] Shows all 14 entities
- [ ] Can browse data
- [ ] Can see created exercises, groups, etc.

---

## Logs Verification

### Check for Errors

```bash
# View all logs
docker-compose logs

# View specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

- [ ] No ERROR messages
- [ ] No CRITICAL messages
- [ ] Database shows connection logs
- [ ] Backend shows "Application listening on port 3000"
- [ ] Frontend shows "ready on http://0.0.0.0:3001"

### Common Warning Messages (OK to Ignore)

These warnings are normal in development:
- [ ] "DeprecationWarning" - Ignore
- [ ] "ExperimentalWarning" - Ignore
- [ ] "MaxListenersExceededWarning" - Ignore

---

## Cleanup & Shutdown

When finished testing:

```bash
# Stop all services gracefully
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# Stop specific service
docker-compose stop backend

# Restart specific service
docker-compose restart frontend
```

- [ ] No errors on shutdown
- [ ] All containers stopped
- [ ] Can restart without issues

---

## Troubleshooting Guide

### Issue: Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

OR change port in `.env`:
```env
BACKEND_PORT=3002
FRONTEND_PORT=3003
```

### Issue: Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down -v
docker-compose up --build

# Check image
docker images
```

### Issue: Database Connection Error

```bash
# Verify postgres is running
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Wait for healthcheck
docker-compose ps
```

### Issue: Frontend Shows Blank Page

```bash
# Clear browser cache
# Or open in private/incognito mode

# Check frontend logs
docker-compose logs frontend

# Check browser console (F12)
```

### Issue: API Returns 500 Error

```bash
# Check backend logs
docker-compose logs backend

# Look for error stack trace

# Common fixes:
# 1. Restart backend: docker-compose restart backend
# 2. Check database: docker-compose logs postgres
# 3. Check environment variables: cat .env
```

---

## Performance Checks

### Memory Usage

```bash
docker stats
```

Expected reasonable values:
- [ ] Backend: < 500MB
- [ ] Frontend: < 200MB
- [ ] Postgres: < 300MB

### Startup Time

- [ ] Postgres healthy: < 10 seconds
- [ ] Backend health: < 20 seconds
- [ ] Frontend ready: < 30 seconds

### Response Time

Test endpoint response times:
- [ ] GET /exercises: < 100ms
- [ ] GET /groups: < 100ms
- [ ] POST /invitations: < 200ms

```bash
# Use curl with timing
curl -w "@curl-format.txt" http://localhost:3000/api/docs
```

---

## Security Verification

- [ ] JWT tokens required on protected endpoints
- [ ] No sensitive data in error messages
- [ ] Environment variables not logged
- [ ] Database accessible only from backend
- [ ] CORS configured properly
- [ ] No SQL injection vulnerabilities (using Prisma)
- [ ] Passwords properly validated (Supabase)

---

## Production Readiness Checklist

- [ ] All environment variables configured
- [ ] Error handling working properly
- [ ] Authorization working on all endpoints
- [ ] Email service configured (or using test account)
- [ ] Database persistence verified
- [ ] Health checks passing
- [ ] No sensitive data in logs
- [ ] Docker images optimized
- [ ] Documentation complete
- [ ] Backup strategy in place

---

## Final Sign-Off

### Development Ready ✅

- [ ] Application starts without errors
- [ ] All services healthy
- [ ] API responding correctly
- [ ] Frontend loads properly
- [ ] Database working

### Production Ready ✅

- [ ] All tests passing
- [ ] Error handling comprehensive
- [ ] Security best practices followed
- [ ] Performance acceptable
- [ ] Monitoring in place
- [ ] Backup configured
- [ ] Deployment documented

---

## Next Steps

1. ✅ Verify this checklist passes
2. ⏳ Continue with Phase 2 development (Program Assignment)
3. ⏳ Add frontend dashboards
4. ⏳ Implement remaining features
5. ⏳ Deploy to production

---

**Verification Date**: _______________  
**Verified By**: _______________  
**Status**: ⬜ Not Started | 🟡 In Progress | 🟢 Complete

**Notes**:
```
________________________________
________________________________
________________________________
```

---

**Last Updated**: November 28, 2025  
**Version**: 1.0.0
