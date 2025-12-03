# 🚀 PHASE 5.2 - QUICK START COMMANDS

## Prerequisites
- Docker installed
- Node.js 18+ (for local development)
- PostgreSQL running (via Docker)

## Option 1: Full Docker Setup (Recommended)

### Start All Services
```bash
cd c:\Users\bapti\Documents\GoBeyondFitWebApp
docker-compose up -d
```

Wait for containers to be ready (~30 seconds), then:

```bash
# Check all containers running
docker-compose ps

# Backend should be on http://localhost:3001
# Frontend should be on http://localhost:3000
```

### Stop Services
```bash
docker-compose down
```

---

## Option 2: Local Development (Backend + Frontend)

### 1. Start Database (Docker only)
```bash
cd c:\Users\bapti\Documents\GoBeyondFitWebApp
docker-compose up -d postgres redis
```

### 2. Start Backend
```bash
cd c:\Users\bapti\Documents\GoBeyondFitWebApp\backend

# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate deploy

# Start development server
npm run start:dev

# Server starts at http://localhost:3001
```

### 3. Start Frontend (in new terminal)
```bash
cd c:\Users\bapti\Documents\GoBeyondFitWebApp\frontend

# Install dependencies
npm install

# Start development server
npm run dev

# App starts at http://localhost:3000
```

---

## Testing the Features

### 1. Login as Coach
```
Email: coach@test.com
Password: Test123!
```

### 2. Create Exercise
- Navigate to: **http://localhost:3000/exercises/create**
- Fill form and submit
- Should redirect to **http://localhost:3000/exercises/my**

### 3. View My Exercises
- URL: **http://localhost:3000/exercises/my**
- See all coach-created exercises
- Use Edit, Delete, Video buttons

### 4. Create Program
- URL: **http://localhost:3000/programs/new**
- Add blocks, weeks, sessions
- Add exercises to sessions
- Click "Save & Quit"

### 5. Edit Program
- Go to: **http://localhost:3000/programs**
- Click edit on a program
- URL: **http://localhost:3000/programs/builder/[id]**
- Modify and save

---

## API Endpoints to Test (with curl/Postman)

### Get Coach Exercises
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/exercises/my/created?page=1&limit=20
```

### Create Exercise
```bash
curl -X POST http://localhost:3001/api/exercises \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Push-ups",
    "description": "Upper body",
    "scope": "coach",
    "difficulty": "Beginner",
    "muscleGroups": ["Chest"],
    "instructions": ["Get on ground"],
    "sets": 3,
    "reps": 10
  }'
```

### Get Program Details
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/programs/builder/PROGRAM_ID/details
```

### Save Program
```bash
curl -X PUT http://localhost:3001/api/programs/builder/PROGRAM_ID/save \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "12-Week Program",
    "description": "Full body training",
    "blocks": [...],
    "isDraft": true
  }'
```

---

## Debugging

### View Backend Logs
```bash
docker-compose logs backend -f
```

### View Frontend Build Output
```bash
# Terminal where you ran: npm run dev
# Check console for Next.js messages
```

### Database Connection
```bash
# Connect to postgres
docker exec -it postgres psql -U postgres -d gobeyondfit

# View exercises table
SELECT * FROM "Exercise";

# View programs table
SELECT * FROM "Program";
```

### Clear Cache & Rebuild
```bash
# Frontend
cd frontend
npm run clean  # if script exists
rm -r .next
npm run dev

# Backend
cd backend
npm run clean  # if script exists
npm run build
npm run start:dev
```

---

## Common Issues & Fixes

### Issue: Port 3000/3001 already in use
```bash
# PowerShell - Find process using port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwnerModule

# Kill process (example for port 3000)
Stop-Process -Name node -Force
```

### Issue: CORS errors
- ✅ Already configured in backend
- Check `main.ts` has enableCors()

### Issue: Database connection failed
```bash
# Check postgres is running
docker-compose ps postgres

# If not running, start it
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

### Issue: Frontend can't reach backend
- Verify backend running: http://localhost:3001/api/health
- Check `.env.local` in frontend has correct API_URL
- Check CORS is enabled

---

## Useful Commands

### Reset Database
```bash
# Backup current data first!
docker-compose down -v  # Remove volumes
docker-compose up -d postgres
npm run prisma:migrate  # in backend folder
```

### Run Type Check (No Build)
```bash
# Frontend
cd frontend
npm run type-check

# Backend
cd backend
npm run build -- --noEmit
```

### View Database Schema
```bash
cd backend
npx prisma studio
# Opens GUI at http://localhost:5555
```

---

## Files Structure

```
GoBeyondFitWebApp/
├── backend/
│   ├── src/modules/
│   │   ├── exercises/           ← Exercise CRUD
│   │   ├── programs/            ← Program Builder
│   │   └── ...
│   ├── prisma/schema.prisma     ← Database schema
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── exercises/
│   │   │   ├── create/page.tsx
│   │   │   ├── my/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── programs/
│   │   │   ├── new/page.tsx
│   │   │   └── builder/[id]/page.tsx
│   │   └── ...
│   ├── components/
│   │   └── program-builder-advanced.tsx
│   └── package.json
│
└── docker-compose.yml
```

---

## Health Checks

### Backend Health
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok"}
```

### Frontend Health
```bash
# Open http://localhost:3000 in browser
# Should load without errors
```

### Database Health
```bash
docker exec postgres pg_isready -U postgres -d gobeyondfit
# Should return: accepting connections
```

---

**Version**: Phase 5.2  
**Last Updated**: 2024  
**Status**: ✅ Ready to Test
