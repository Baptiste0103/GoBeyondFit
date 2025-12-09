# 🚀 GoBeyondFit - Quick Start Guide

**Date:** December 3, 2025  
**Status:** ✅ READY FOR PRODUCTION

---

## 🎯 Quick Access

### Frontend (User Interface)
- **URL:** http://localhost:3001
- **Status:** ✅ Running
- **Language:** TypeScript + React + Next.js 16

### Backend (API)
- **URL:** http://localhost:3000/api
- **Status:** ✅ Running
- **Documentation:** http://localhost:3000/api/docs (Swagger)

### Database (Admin Panel)
- **URL:** http://localhost:8080
- **Status:** ✅ Running
- **System:** Adminer for PostgreSQL

---

## 👥 Test Credentials

### Admin Account
- **Email:** admin@gobeyondfit.com
- **Password:** Admin123!
- **Role:** admin

### Coach Account
- **Email:** coach@gobeyondfit.com
- **Password:** Coach123!
- **Role:** coach

### Student Account
- **Email:** student@gobeyondfit.com
- **Password:** Student123!
- **Role:** student

---

## 📊 Feature Checklist

### Phase 1: Foundation ✅
- [x] JWT Authentication
- [x] User Role Management
- [x] Auth endpoints
- [x] Supabase integration

### Phase 2: Coach Features ✅
- [x] Exercise Management
- [x] Group Creation
- [x] Invitations (Email + Auto-accept)
- [x] Member Management

### Phase 3: Program Builder ✅
- [x] Program Creation (nested structure)
- [x] Program Assignment
- [x] Change Audit Logging
- [x] Permission Management

### Phase 4: Student Experience ✅
- [x] View Assigned Programs
- [x] Track Workout Progress
- [x] Save Exercise Data (sets/reps/weight)
- [x] Upload Video Evidence
- [x] View Session Details

### Phase 5: Gamification ✅
- [x] Badge System
- [x] Statistics Tracking
- [x] Progress Visualization
- [x] Streak Tracking
- [x] Personal Records

---

## 🔍 Testing the System

### 1. Student Experience Flow

#### Step 1: Accept Invitation
```bash
1. Login as: student@gobeyondfit.com
2. Go to: Dashboard → Notifications
3. Accept group invitation from coach
```

#### Step 2: View Programs
```bash
1. Go to: Dashboard → My Programs
2. Click on assigned program
3. View program structure (blocks/weeks/sessions)
```

#### Step 3: Track Progress
```bash
1. Open program → Expand session
2. Enter exercise progress (sets/reps/weight)
3. Click "Save Progress"
4. View progress in stats
```

#### Step 4: View Stats
```bash
1. Go to: Dashboard → Stats
2. View personal records
3. Check workout history
4. Review completion rate
```

#### Step 5: View Badges
```bash
1. Go to: Dashboard → Badges
2. View earned badges
3. Check progress towards new badges
```

### 2. Coach Experience Flow

#### Step 1: Create Exercise
```bash
1. Login as: coach@gobeyondfit.com
2. Go to: Dashboard → My Exercises
3. Create new exercise
4. Set scope (coach or global)
```

#### Step 2: Create Group
```bash
1. Go to: Dashboard → Groups
2. Click "New Group"
3. Enter group name/description
4. Create
```

#### Step 3: Send Invitations
```bash
1. Go to: Groups → [GroupName]
2. Click "Invite Members"
3. Search student by pseudo
4. Send invitation
```

#### Step 4: Create Program
```bash
1. Go to: Dashboard → Programs
2. Click "Create Program"
3. Add blocks, weeks, sessions
4. Add exercises to sessions
5. Configure sets/reps/weights
```

#### Step 5: Assign Program
```bash
1. Go to: Programs → [ProgramName]
2. Click "Assign Program"
3. Select group members
4. Send assignments
```

---

## 🐳 Docker Commands

### Start All Services
```bash
cd c:\Users\bapti\Documents\GoBeyondFitWebApp
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
# Backend logs
docker logs gobeyondfit-backend -f

# Frontend logs
docker logs gobeyondfit-frontend -f

# Database logs
docker logs gobeyondfit-postgres -f
```

### Rebuild and Start
```bash
docker-compose down
docker-compose up -d --build
```

---

## 📱 Navigation Guide

### Dashboard (All Roles)
- Overview of system status
- Quick access to main features
- Unread notification count

### Notifications
- Group invitations
- Program assignments
- System messages
- Accept/Reject actions

### Groups (All Roles)
- Create groups (coach/admin)
- View group members
- Join/Leave groups
- Leave group
- Manage invitations

### Programs
- **Coaches:** Create, edit, delete, assign programs
- **Students:** View assigned programs, track progress

### My Programs (Students Only)
- View all assigned programs
- Expand hierarchy (blocks → weeks → sessions)
- Track exercise progress
- View completion percentage
- Delete program assignments

### Exercises
- **Coaches:** CRUD exercises, set scope
- **Students/All:** Browse exercise library

### Badges & Stats (Students)
- View earned badges
- Track progress towards badges
- View personal statistics
- Check workout history
- Monitor personal records

---

## 🔗 Important API Endpoints

### Authentication
```
POST   /auth/login                   - Login
POST   /auth/signup                  - Register
GET    /auth/me                      - Current user info
```

### Groups & Invitations
```
POST   /groups                       - Create group
GET    /invitations/received         - Get invitations
POST   /invitations/:id/accept       - Accept invitation
POST   /invitations/:id/reject       - Reject invitation
```

### Programs
```
POST   /programs                     - Create program
GET    /programs                     - List programs
POST   /programs/:id/assign          - Assign program
GET    /session-progress/programs/:programId/stats - Get program stats
```

### Workouts & Progress
```
GET    /workouts/my-sessions         - Get assigned sessions
POST   /workouts/sessions/:id/exercises/:exId/progress - Save progress
POST   /workouts/sessions/:id/complete - Mark session complete
```

### Stats & Badges
```
GET    /stats/my-stats               - Get user statistics
GET    /badges/my-badges             - Get earned badges
GET    /badges/progress              - Get badge progress
```

---

## 🐛 Troubleshooting

### Issue: Can't login
- **Check:** Backend is running `docker logs gobeyondfit-backend`
- **Check:** User exists in database (Adminer: localhost:8080)
- **Check:** JWT token is being set correctly

### Issue: Invitation accept fails
- **Check:** Database migration was applied (`20251203211755_remove_invitation_constraint`)
- **Check:** Invitation exists and is pending status

### Issue: Can't see assigned programs
- **Check:** Program has been assigned to the student's group
- **Check:** Student has accepted the group invitation
- **Check:** Backend migration applied for program assignments

### Issue: Progress not saving
- **Check:** Student is authenticated (has valid JWT token)
- **Check:** Session and exercise IDs are correct
- **Check:** SessionProgress database table exists

### Issue: Frontend not loading
- **Check:** Frontend container is running `docker ps`
- **Check:** Port 3001 is not blocked
- **Check:** Build completed successfully `docker logs gobeyondfit-frontend`

---

## 📊 Database Tables

All tables are automatically created:
- ✅ users
- ✅ groups
- ✅ group_members
- ✅ invitations
- ✅ exercises
- ✅ programs
- ✅ program_blocks
- ✅ weeks
- ✅ sessions
- ✅ session_exercises
- ✅ session_progress
- ✅ program_assignments
- ✅ program_audit
- ✅ badges
- ✅ user_badges
- ✅ notifications
- ✅ and more...

---

## 🔐 Security Features

- ✅ JWT authentication on all protected routes
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Input validation with class-validator
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ Database constraints (unique, foreign keys)
- ✅ Request logging and audit trails

---

## 📈 Performance Optimizations

- ✅ Database indexes on frequently queried fields
- ✅ Pagination for large datasets
- ✅ Query optimization with Prisma
- ✅ Caching strategy implemented
- ✅ Lazy loading for related data
- ✅ Frontend code splitting with Next.js
- ✅ Image optimization
- ✅ CSS-in-JS optimization

---

## 🎓 Tutorial: Creating Your First Program

1. **Login as coach**
   ```
   Email: coach@gobeyondfit.com
   Password: Coach123!
   ```

2. **Create a group**
   - Go to: Groups → New Group
   - Name: "Morning CrossFit"
   - Description: "6 AM morning workouts"
   - Click Create

3. **Invite students**
   - Go to: Groups → Morning CrossFit
   - Click "Invite Members"
   - Search student by pseudo (e.g., "student")
   - Send invitation

4. **Student accepts invitation**
   - Student goes to: Notifications
   - Click "Accept"
   - Student is now in the group

5. **Create a program**
   - Go to: Programs → Create Program
   - Title: "4-Week Strength"
   - Add Block: "Block 1"
   - Add Week: "Week 1"
   - Add Session: "Session 1"
   - Add Exercises: Select from library or create new
   - Configure: Sets, reps, weight for each exercise

6. **Assign program**
   - Go to: Programs → 4-Week Strength
   - Click "Assign"
   - Select Group: "Morning CrossFit"
   - Click Assign

7. **Student views program**
   - Student goes to: My Programs
   - Click "4-Week Strength"
   - View full hierarchy
   - Expand sessions and exercises
   - Enter progress notes
   - Click "Save Progress"

---

## 📞 Support

For technical issues or questions:
1. Check the `/Documentation` folder for detailed guides
2. Review API documentation at http://localhost:3000/api/docs
3. Check Docker logs for errors
4. Review database in Adminer: http://localhost:8080

---

**Ready to start?**
- Open http://localhost:3001 in your browser
- Login with test credentials above
- Follow the feature checklist
- Explore all functionalities

Happy training! 💪

---

*Last Updated: December 3, 2025*  
*All Systems: ✅ OPERATIONAL*
