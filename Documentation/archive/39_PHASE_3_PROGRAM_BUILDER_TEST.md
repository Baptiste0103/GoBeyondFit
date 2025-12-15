# Phase 3 Program Builder - Test Guide

## 🎯 Quick Test Checklist

### 1. Login as Coach
- **URL**: http://localhost:3001/auth/login
- **Credentials**: 
  - Email: `coach@gobeyondfit.com`
  - Password: `coach123`
- **Expected**: Should see sidebar with:
  - ✅ Dashboard
  - ✅ Exercises
  - ✅ Groups
  - ✅ Programs (NEW!)

### 2. Navigate to Programs
- **URL**: http://localhost:3001/dashboard/programs
- **Expected**: 
  - "Create Program" button visible
  - Empty state message OR list of existing programs
  - Grid layout with program cards

### 3. Create a Program
1. Click "+ Create Program"
2. Fill form:
   - **Title**: `12-Week Strength Program`
   - **Description**: `A comprehensive strength building program`
   - **Status**: Keep as Draft ✓
3. Click "Create"
4. **Expected**: Program appears in list

### 4. Edit Program Structure
1. Click "Edit" on the created program
2. **URL**: http://localhost:3001/dashboard/programs/[id]
3. **Expected**: 
   - Program details form
   - "Program Structure" section
   - "+ Add Block" button

### 5. Build Nested Structure
1. Click "+ Add Block"
   - **Expected**: New block appears with input field
2. Update Block title: `Block 1: Foundation`
3. Click "+ Add Week" in the block
   - **Expected**: Week 1 appears
4. Click "+ Add Session" in the week
   - **Expected**: Session appears
5. Click "Save Program"
   - **Expected**: Success message or confirmation

### 6. Verify Backend API
Test via Swagger or curl:

```bash
# Get all programs (Coach sees own)
curl -X GET http://localhost:3000/programs \
  -H "Authorization: Bearer <token>"

# Get program details
curl -X GET http://localhost:3000/programs/<program-id> \
  -H "Authorization: Bearer <token>"

# Create program with nested structure
curl -X POST http://localhost:3000/programs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Program",
    "description": "Test",
    "isDraft": true,
    "blocks": [
      {
        "title": "Block 1",
        "position": 0,
        "weeks": [
          {
            "weekNumber": 1,
            "sessions": [
              {
                "title": "Session 1",
                "exercises": []
              }
            ]
          }
        ]
      }
    ]
  }'
```

### 7. Test as Student
- **Login**: `student@gobeyondfit.com` / `student123`
- **Expected**:
  - ❌ Programs menu NOT visible in sidebar
  - Only Dashboard, Groups visible
  - Cannot access `/dashboard/programs`

### 8. Test as Admin
- **Login**: `admin@gobeyondfit.com` / `admin123`
- **Expected**:
  - ✅ All menus visible including Programs
  - Can see ALL programs (not just own)
  - Can edit/delete any program

## 📊 Features Implemented

### Backend (✅ Complete)
- [x] Program CRUD endpoints
- [x] Nested structure support (Blocks → Weeks → Sessions → Exercises)
- [x] Role-based access control
- [x] Permission checks (coach ownership)
- [x] JWT authentication on all endpoints
- [x] Swagger documentation

### Frontend (✅ Complete)
- [x] Programs list page
- [x] Create program form
- [x] Edit program detail page
- [x] Nested structure editor (visual)
- [x] Role-based navigation (Programs hidden from students)
- [x] Save functionality
- [x] Error handling

## 🐛 Troubleshooting

### "Backend unreachable"
- Check: `docker-compose ps`
- Restart: `docker-compose restart backend`

### "403 Forbidden on DELETE program"
- Check: You're logged in as the coach who created it
- Or: You're logged in as admin

### "Programs page is blank but data exists in DB"
- Check: Token is valid (refresh login)
- Check: Browser console for errors
- Check: `docker logs gobeyondfit-frontend`

### "Can't edit program - nothing saves"
- Check: JWT token valid in request headers
- Check: Backend logs: `docker logs gobeyondfit-backend`

## 📝 Database Verification

```bash
# Connect to database
docker-compose exec postgres psql -U gobeyondfit -d gobeyondfit_db

# Check programs
SELECT * FROM "Program" LIMIT 5;

# Check blocks
SELECT * FROM "Block" LIMIT 5;

# Check weeks
SELECT * FROM "Week" LIMIT 5;

# Check sessions
SELECT * FROM "Session" LIMIT 5;

# Exit
\q
```

## 🚀 Next Steps

1. ✅ Phase 3a: Program Builder Backend
2. ✅ Phase 3b: Program Builder Frontend
3. ⏳ Phase 3c: Program Audit Logging
4. ⏳ Phase 4a: Student Sessions API
5. ⏳ Phase 4b: Session Progress & Autosave
6. ⏳ Phase 5a: Badges & Gamification
7. ⏳ Phase 5b: Statistics & Analytics

## 📞 Support

If issues occur:
1. Check `docker-compose logs` for each service
2. Verify `.env` has correct DATABASE_URL
3. Verify ports 3000 (backend), 3001 (frontend), 5432 (postgres) available
4. Clear browser cache and refresh
5. Restart containers: `docker-compose restart`
