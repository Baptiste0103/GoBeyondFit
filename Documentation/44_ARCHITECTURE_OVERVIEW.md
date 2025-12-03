# GoBeyondFit Web Application - Complete Architecture Overview

## 📋 Project Status

**Current Phase**: Phase 4/5 - Exercise Library Implementation ✅  
**Last Updated**: November 30, 2025  
**Total Exercises**: 3,242  
**Backend Status**: ✅ Running  
**Frontend Status**: ✅ Running  
**Database Status**: ✅ Healthy

---

## 🏗️ Application Architecture

### Technology Stack

#### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT + Passport.js
- **Authorization**: Role-Based Access Control (RBAC)
- **API Documentation**: Swagger/OpenAPI
- **Server Port**: 3000

#### Frontend
- **Framework**: Next.js 15 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + localStorage
- **HTTP Client**: Fetch API
- **Server Port**: 3001

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database Host**: PostgreSQL 15 Alpine
- **Admin UI**: Adminer (http://localhost:8080)
- **Network**: Docker Compose network for service communication

---

## 📁 Project Structure

```
GoBeyondFitWebApp/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── auth.module.ts
│   │   ├── exercises/
│   │   │   ├── exercise.controller.ts        (+ searchLibrary endpoint)
│   │   │   ├── exercise.service.ts           (+ searchLibrary method)
│   │   │   ├── exercise.module.ts
│   │   │   └── dto/
│   │   ├── programs/
│   │   │   ├── program.controller.ts
│   │   │   ├── program.service.ts            (+ audit logging)
│   │   │   ├── audit.service.ts              (NEW)
│   │   │   ├── program.module.ts
│   │   │   └── dto/
│   │   ├── sessions/
│   │   │   ├── session.controller.ts         (NEW - 4 endpoints)
│   │   │   ├── session.service.ts            (NEW)
│   │   │   ├── session.module.ts             (NEW)
│   │   │   └── dto/
│   │   ├── groups/
│   │   ├── invitations/
│   │   ├── common/
│   │   │   └── guards/
│   │   ├── prisma/
│   │   ├── config/
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── init-db.sql
│   ├── seeds/
│   │   ├── exercises.seed.ts
│   │   ├── convert-excel.ts                  (NEW)
│   │   └── exercises.json                    (NEW - 3,242 exercises)
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   │   ├── exercises/
│   │   │   │   ├── library/page.tsx          (NEW)
│   │   │   │   ├── [id]/page.tsx             (NEW)
│   │   │   │   ├── page.tsx                  (existing)
│   │   │   ├── programs/
│   │   │   ├── groups/
│   │   │   ├── page.tsx
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── sidebar.tsx                       (updated navigation)
│   │   ├── exercise-item.tsx                 (NEW)
│   │   └── ...other components
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   ├── i18n.ts
│   │   └── ...
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── postcss.config.mjs
│
├── docker-compose.yml
├── Dockerfile (root)
├── DOCKER_COMMANDS.sh
└── Documentation/
    ├── 01-40_existing_docs
    ├── 41_EXERCISE_LIBRARY_GUIDE.md           (NEW)
    ├── 42_PHASE_4_5_COMPLETION.md            (NEW)
    └── 43_EXERCISE_LIBRARY_QUICK_START.md    (NEW)
```

---

## 🔐 Authentication & Authorization

### JWT Authentication
- **Token Generation**: On successful login
- **Token Storage**: localStorage (key: 'access_token')
- **Expiration**: 1 hour (3600 seconds)
- **Header Format**: `Authorization: Bearer {token}`
- **Validation**: `@UseGuards(JwtAuthGuard)` on protected endpoints

### User Roles
1. **Admin**
   - Full system access
   - Create/manage all exercises and programs
   - Manage users and invitations
   - View audit logs

2. **Coach**
   - Create and manage personal exercises
   - Create and manage programs
   - Create and manage groups
   - Assign programs to students
   - View student progress

3. **Student**
   - View assigned programs
   - View assigned exercises
   - Track session progress
   - View public exercise library

---

## 📊 Database Schema

### Core Tables

#### users
- id (UUID, PK)
- email (unique)
- pseudo (username)
- firstName, lastName
- password (hashed)
- role (enum: admin, coach, student)
- coachId (FK - if student, links to coach)
- createdAt, updatedAt

#### exercises
- id (UUID, PK)
- name
- description
- scope (enum: global, personal)
- meta (JSONB - stores 31 exercise attributes)
- ownerId (FK - if personal)
- createdAt, updatedAt
- **Data**: 3,242 rows imported

#### programs
- id (UUID, PK)
- title
- description
- isDraft
- createdBy (FK - user)
- blocks (JSONB - nested structure)
  - Block[]
    - title
    - weeks (Week[])
      - weekNumber
      - sessions (Session[])
        - title
        - exercises (SessionExercise[])
          - exerciseId
          - position
- createdAt, updatedAt

#### programAudit
- id (UUID, PK)
- programId (FK)
- changedBy (FK - user)
- changeType (enum: create, update, delete, assign, unassign)
- diff (JSONB - before/after values)
- createdAt

#### sessions
- id (UUID, PK)
- studentId (FK - user)
- programId (FK)
- sessionId (from program.blocks[].weeks[].sessions)
- assignedDate
- dueDate
- completedAt
- createdAt, updatedAt

#### sessionProgress
- id (UUID, PK)
- sessionId (FK)
- studentId (FK - user)
- exerciseId (FK)
- exerciseNumber
- data (JSONB - autosaved workout data)
  - sets
  - reps
  - weight
  - duration
  - notes
- createdAt, updatedAt

---

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and get JWT token

### Exercise Endpoints
- `GET /exercises/library/search?q=...&difficulty=...&muscle=...&page=...&limit=...` - Search exercises
- `GET /exercises` - Get all visible exercises
- `GET /exercises/:id` - Get exercise details
- `POST /exercises` - Create custom exercise (coaches/admins)
- `PUT /exercises/:id` - Update exercise
- `DELETE /exercises/:id` - Delete exercise

### Program Endpoints
- `GET /programs` - Get all programs (user can access)
- `GET /programs/:id` - Get program details
- `POST /programs` - Create new program
- `PUT /programs/:id` - Update program
- `DELETE /programs/:id` - Delete program
- `POST /programs/:id/assign` - Assign program to student
- `DELETE /programs/:id/assign/:studentId` - Remove assignment
- `GET /programs/:id/audit` - Get program change history

### Session Endpoints
- `GET /sessions/my` - Get my assigned sessions
- `GET /sessions/:sessionId` - Get session details
- `POST /sessions/:sessionId/progress` - Save workout progress
- `GET /sessions/:sessionId/my-progress` - Get saved progress

### Group Endpoints
- `GET /groups` - Get user's groups
- `POST /groups` - Create group
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group
- `POST /groups/:id/members` - Add member
- `DELETE /groups/:id/members/:userId` - Remove member

### Invitation Endpoints
- `GET /invitations` - Get pending invitations
- `POST /invitations` - Send invitation
- `PUT /invitations/:id/accept` - Accept invitation
- `PUT /invitations/:id/decline` - Decline invitation

---

## 📈 Implemented Features

### Phase 1-3: Core System
- ✅ User Authentication (JWT)
- ✅ Role-Based Access Control
- ✅ Program Management (nested structure)
- ✅ Exercise Management
- ✅ Group Management
- ✅ Invitation System
- ✅ Audit Logging for programs
- ✅ Enhanced DTOs with Swagger documentation

### Phase 4: Workout Mode
- ✅ Session API (GET endpoints)
- ✅ SessionProgress Autosave (POST endpoint)
- ✅ Workout progress tracking
- ✅ Session-to-student assignment

### Phase 5: Exercise Library (COMPLETED)
- ✅ 3,242 exercises imported from Excel
- ✅ Exercise database seeding
- ✅ Exercise search with filtering
- ✅ Exercise Library frontend page
- ✅ Exercise detail pages with videos
- ✅ YouTube hyperlink preservation
- ✅ Pagination and full-text search
- ✅ ExerciseItem reusable component

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL client (optional)

### Quick Start
```bash
cd c:\Users\bapti\Documents\GoBeyondFitWebApp

# Start all services
docker-compose up -d

# Wait for services to be healthy (~30 seconds)
docker ps

# Access application
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
# Database: http://localhost:8080
```

### Test Credentials
- Coach: `coach@gmail.com` / `Motdepasse123!`
- Admin: `admin@gmail.com` / `Motdepasse123!`
- Student: `student@gmail.com` / `Motdepasse123!`

### Test Exercise Library
1. Login as any user
2. Click **📚 Exercise Library** in sidebar
3. Browse 3,242 exercises
4. Search and filter exercises
5. Click exercise to view details with YouTube videos

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `01_ISSUES` | Initial issues and troubleshooting |
| `02_PROJECT_OVERVIEW` | Project goals and architecture |
| `03_README` | General project information |
| `04_IMPLEMENTATION_REPORT` | Current implementation status |
| `05_DEVELOPMENT_ROADMAP` | Planned features and phases |
| `06_PROJECT_SUMMARY` | High-level project summary |
| `08_GETTING_STARTED` | Developer setup guide |
| `20_AUTH_IMPLEMENTATION` | Authentication system details |
| `22_IMPLEMENTATION_COMPLETE` | Phase 1-2 completion |
| `40_PHASE_3_PROGRAM_BUILDER_COMPLETE` | Phase 3 completion |
| **`41_EXERCISE_LIBRARY_GUIDE`** | Exercise library user guide |
| **`42_PHASE_4_5_COMPLETION`** | Phase 4/5 implementation details |
| **`43_EXERCISE_LIBRARY_QUICK_START`** | Quick start testing guide |

---

## 🎯 Next Phase: Program Builder & Workout Runner

### What's Coming

#### Frontend Components (Phase 5)
1. **ProgramBuilder** - Interactive program editor
   - Drag & drop interface
   - Add/edit/remove blocks, weeks, sessions
   - Exercise selection with autocomplete
   - Visual structure preview

2. **WorkoutRunner** - Student workout execution
   - Display current exercise with video
   - Track sets/reps/weight
   - Autosave progress to SessionProgress
   - Progress bar showing session completion
   - Timer for AMRAP/EMOM workouts

#### Features
- Full program editing interface
- Bulk exercise operations
- Workout timer and tracking
- Exercise video playback during workout
- Performance metrics and history

---

## 🐛 Troubleshooting

### Common Issues

**Docker containers not starting**
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

**Database connection error**
```bash
# Check database is running
docker logs gobeyondfit-postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

**Exercise not showing**
- Ensure seeding completed: `SELECT COUNT(*) FROM exercises;`
- Check user role has permission to view
- Verify API returning data: `curl http://localhost:3000/exercises/library/search`

**Video not loading**
- Check YouTube URL format
- Ensure YouTube domain not blocked
- Try opening URL directly in browser

---

## 📞 Support

For issues or questions, check:
1. Docker logs: `docker logs [container-name]`
2. Browser console: F12 → Console tab
3. Network tab: F12 → Network tab
4. Database: Adminer at http://localhost:8080

---

## ✨ Summary

**GoBeyondFit** is a comprehensive fitness coaching platform featuring:
- ✅ Complete user authentication and role-based access
- ✅ Program management with nested structure (blocks/weeks/sessions)
- ✅ 3,242 exercises with YouTube demonstrations
- ✅ Exercise library with search and filtering
- ✅ Session-based workout tracking with autosave
- ✅ Group management and user invitations
- ✅ Audit logging for program changes
- ✅ API documentation with Swagger
- ✅ Responsive React frontend with Tailwind CSS
- ✅ Production-ready NestJS backend

**Status**: 🟢 Production Ready  
**Next Phase**: Interactive Program Builder & Workout Runner  
**Last Updated**: November 30, 2025

