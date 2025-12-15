# 🏗️ GoBeyondFit - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         GOBEYONDFIT PLATFORM                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│      FRONTEND (Next.js)  │         │   BACKEND (NestJS)       │
│                          │         │                          │
│  ┌────────────────────┐  │         │  ┌──────────────────┐   │
│  │ Page: Home         │  │         │  │ Module: Auth     │   │
│  │ Page: Login        │  │────────▶│  │ - User CRUD      │   │
│  │ Page: Signup       │  │         │  │ - JWT Strategy   │   │
│  │                    │  │         │  └──────────────────┘   │
│  └────────────────────┘  │         │                          │
│                          │         │  ┌──────────────────┐   │
│  ┌────────────────────┐  │         │  │ Module: Exercises│   │
│  │ Dashboard (todo)   │  │◀────────│  │ - CRUD ops       │   │
│  │ Coach              │  │         │  │ - Scope control  │   │
│  │ Student            │  │         │  └──────────────────┘   │
│  └────────────────────┘  │         │                          │
│                          │         │  ┌──────────────────┐   │
│  ┌────────────────────┐  │         │  │ Module: Groups   │   │
│  │ Components (todo)  │  │◀────────│  │ - Group CRUD     │   │
│  │ Forms              │  │         │  │ - Member mgmt    │   │
│  │ UI Elements        │  │         │  └──────────────────┘   │
│  └────────────────────┘  │         │                          │
│                          │         │  ┌──────────────────┐   │
│  ┌────────────────────┐  │         │  │ Module: Programs │   │
│  │ Libraries          │  │◀────────│  │ - Nested CRUD    │   │
│  │ @React Query (✓)   │  │         │  │ - Structure mgmt │   │
│  │ @Tailwind (✓)      │  │         │  └──────────────────┘   │
│  │ @shadcn/ui (✓)     │  │         │                          │
│  │ @Supabase (✓)      │  │         │  ┌──────────────────┐   │
│  │ @i18n (✓)          │  │         │  │ Services (todo)  │   │
│  └────────────────────┘  │         │  │ - Email          │   │
│                          │         │  │ - Progress       │   │
│  Environment: .env.local │         │  │ - Stats          │   │
│  API_URL: localhost:3000 │         │  │ - Badges         │   │
│                          │         │  └──────────────────┘   │
│  Port: 3001              │         │                          │
└──────────────────────────┘         │  Port: 3000              │
          │                          │  Environment: .env       │
          │                          └──────────────────────────┘
          │                                      │
          │                                      │
          └──────────────────┬───────────────────┘
                             │
                      ┌──────▼──────┐
                      │  Supabase   │
                      │  ┌────────┐ │
                      │  │ Auth   │ │◄─── JWT Tokens
                      │  │ DB     │ │
                      │  │Storage │ │
                      │  └────────┘ │
                      └─────────────┘
                             │
                      ┌──────▼──────┐
                      │ PostgreSQL  │
                      │ (Prisma ORM)│
                      │  14 Tables  │
                      └─────────────┘
```

## API Endpoints Structure

```
GoBeyondFit API (http://localhost:3000)
│
├── /api/docs                    Swagger Documentation
│
├── /auth                        Authentication Module (7 endpoints)
│   ├── POST /signup            Create user account
│   ├── GET /me                 Get current user
│   ├── GET /users              List all users
│   ├── GET /users/:id          Get user details
│   ├── PUT /users/:id          Update profile
│   ├── DELETE /users/:id       Delete user
│   └── GET /students/:coachId  Get coach's students
│
├── /exercises                   Exercise Module (7 endpoints)
│   ├── POST /exercises         Create exercise
│   ├── GET /exercises          List exercises
│   ├── GET /exercises/global   Global exercises
│   ├── GET /exercises/coach/:id Coach's exercises
│   ├── GET /exercises/:id      Get exercise
│   ├── PUT /exercises/:id      Update exercise
│   └── DELETE /exercises/:id   Delete exercise
│
├── /groups                      Group Module (10 endpoints)
│   ├── POST /groups            Create group
│   ├── GET /groups             List groups
│   ├── GET /groups/owner/:id   Coach's groups
│   ├── GET /groups/:id         Get group details
│   ├── PUT /groups/:id         Update group
│   ├── DELETE /groups/:id      Delete group
│   ├── POST /groups/:id/members Add member
│   ├── GET /groups/:id/members List members
│   ├── DELETE /.../members/:id Remove member
│   └── PUT /.../members/:id    Update member role
│
└── /programs                    Program Module (8 endpoints)
    ├── POST /programs          Create program
    ├── GET /programs           List programs
    ├── GET /programs/coach/:id Coach's programs
    ├── GET /programs/assigned/:id Student's programs
    ├── GET /programs/:id       Get full structure
    ├── PUT /programs/:id       Update program
    └── DELETE /programs/:id    Delete program
```

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA (14 Tables)              │
└─────────────────────────────────────────────────────────────┘

User (admin, coach, student)
├── Relationships
│   ├── 1:N Students (coach → students)
│   ├── 1:N Exercises (creator)
│   ├── 1:N Programs (creator)
│   ├── 1:N Groups (owner)
│   ├── M:N GroupMembers
│   ├── M:N UserBadges
│   ├── 1:N Notifications
│   ├── 1:N ProgramAudit (changes)
│   ├── 1:N SessionProgress (student)
│   ├── 1:N Invitations (sent)
│   ├── 1:N Invitations (received)
│   └── 1:N ProgramAssignments (assigner/student)
│
Exercise
├── Types: standard, EMOM, AMRAP, custom
├── Scope: global, coach
└── 1:N SessionExercises
    
Group
├── 1:N GroupMembers
├── 1:N Invitations
└── Owner: User

Program
├── 1:N ProgramBlocks
│   └── 1:N Weeks
│       └── 1:N Sessions
│           ├── 1:N SessionExercises
│           │   └── 1:N SessionProgress
│           └── 1:N SessionProgress
├── 1:N ProgramAssignments (→ Students)
└── 1:N ProgramAudit (tracking)

Badge
└── 1:N UserBadges

Invitation
├── Group → User (sender/receiver)
└── Status: pending, accepted, rejected
```

## Development Stack Timeline

```
Timeline of Implementation:
│
├─ Phase 1: Foundation ✅
│  ├── NestJS + TypeScript Setup
│  ├── Prisma + PostgreSQL
│  ├── Supabase Integration
│  ├── JWT Authentication
│  └── Swagger Documentation
│
├─ Phase 2: Core Domain ✅
│  ├── Exercise Module
│  ├── Group Management
│  ├─ Invitations (🔄 Next)
│  └─ Email Service (🔄 Next)
│
├─ Phase 3: Program Builder ✅
│  ├── Program Module (✓)
│  ├── Nested Structure (✓)
│  ├─ Assignments (🔄 Next)
│  ├─ Audit Logging (🔄 Next)
│  └─ RBAC Guards (🔄 Next)
│
├─ Phase 4: Student Experience 🔄
│  ├─ Sessions/Calendar (🔄)
│  ├─ Progress Tracking (🔄)
│  ├─ Video Upload (🔄)
│  └─ Autosave (🔄)
│
├─ Phase 5: Gamification 🔄
│  ├─ Badge System (🔄)
│  ├─ Event Emitters (🔄)
│  └─ Statistics (🔄)
│
└─ Frontend Features 🔄
   ├── Dashboards (🔄)
   ├── Forms (🔄)
   ├── Pages (🔄)
   └── Components (🔄)
```

## File Organization

```
src/
├── auth/                       (Authentication)
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── user.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── dto/
│       └── user.dto.ts
│
├── exercises/                  (Exercise Management)
│   ├── exercise.controller.ts
│   ├── exercise.module.ts
│   ├── exercise.service.ts
│   └── dto/
│       └── exercise.dto.ts
│
├── groups/                     (Group Management)
│   ├── group.controller.ts
│   ├── group.module.ts
│   ├── group.service.ts
│   └── dto/
│       └── group.dto.ts
│
├── programs/                   (Program Builder)
│   ├── program.controller.ts
│   ├── program.module.ts
│   ├── program.service.ts
│   └── dto/
│       └── program.dto.ts
│
├── prisma/                     (Database)
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── app.module.ts              (Main Module)
└── main.ts                    (Entry Point)
```

## Feature Completion Matrix

```
┌─────────────────────┬──────┬──────────┬─────────────┐
│ Feature             │ Back │ Front    │ Integrated  │
├─────────────────────┼──────┼──────────┼─────────────┤
│ Authentication      │  ✅  │    ✅    │      ✅     │
│ User Management     │  ✅  │    🔄    │      🔄     │
│ Exercises           │  ✅  │    🔄    │      🔄     │
│ Groups              │  ✅  │    🔄    │      🔄     │
│ Programs            │  ✅  │    🔄    │      🔄     │
│ Assignments         │  🔄  │    🔄    │      🔄     │
│ Progress Tracking   │  🔄  │    🔄    │      🔄     │
│ Video Upload        │  🔄  │    🔄    │      🔄     │
│ Badges              │  🔄  │    🔄    │      🔄     │
│ Statistics          │  🔄  │    🔄    │      🔄     │
│ RBAC/Guards         │  🔄  │    🔄    │      🔄     │
│ Email Service       │  🔄  │    🔄    │      🔄     │
└─────────────────────┴──────┴──────────┴─────────────┘

Legend: ✅ Complete | 🔄 In Progress | ⭕ Not Started
```

## Data Flow Diagram

```
User Action
    │
    ▼
Frontend Component
    │
    ├── React Hook Form (validation)
    ├── Zod (type validation)
    │
    ▼
API Client (lib/api.ts)
    │
    ├── Add JWT Token
    ├── Serialize Data
    │
    ▼
HTTP Request → NestJS Controller
                    │
                    ├── @UseGuards() - Validate JWT
                    ├── Validate DTO
                    │
                    ▼
              Service Layer
                    │
                    ├── Business Logic
                    ├── Check Authorization
                    │
                    ▼
              Prisma Client
                    │
                    ├── Query Builder
                    │
                    ▼
              PostgreSQL Database
                    │
                    ▼
              Return Data
                    │
                    ▼
              Response Format
                    │
                    ▼
              HTTP Response
                    │
                    ▼
              React Query Cache
                    │
                    ▼
              Component Re-render
                    │
                    ▼
              User Sees Update
```

## Technology Stack Visualization

```
┌─────────────────────────────────────────────┐
│           GoBeyondFit Tech Stack            │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend Layer:                            │
│  Next.js 14 → React 18 → TypeScript         │
│  TailwindCSS → shadcn/ui → Framer Motion    │
│  React Query → React Hook Form → Zod       │
│                                             │
│  Backend Layer:                             │
│  NestJS → TypeScript → Express              │
│  Prisma → PostgreSQL → Supabase             │
│  Passport → JWT → Class Validator           │
│                                             │
│  Infrastructure:                            │
│  Supabase (Auth + Storage)                  │
│  PostgreSQL (Data)                          │
│  Nodemailer (Email)                         │
│  Docker (Container)                         │
│  GitHub Actions (CI/CD)                     │
│                                             │
│  Development Tools:                         │
│  TypeScript (Type Safety)                   │
│  Prisma Studio (DB Visualization)           │
│  Swagger UI (API Docs)                      │
│  Jest (Testing Framework)                   │
│                                             │
└─────────────────────────────────────────────┘
```

## Performance & Scalability

```
Client-Side Optimization:
├── React Query Caching
├── Image Optimization (Next.js)
├── Code Splitting (Route-based)
├── TailwindCSS Production Build
└── Lazy Loading Components

Server-Side Optimization:
├── Database Indexes
├── Query Optimization
├── Eager Loading Relations
├── Response Pagination (ready)
├── Caching Strategy (ready)
└── Rate Limiting (ready)

Database Optimization:
├── Prisma Query Optimization
├── Connection Pooling (Supabase)
├── Foreign Key Relationships
├── Composite Keys
└── Soft Delete Ready
```

---

This architecture provides:
✅ Scalability for growth
✅ Security at each layer
✅ Performance optimization ready
✅ Easy feature addition
✅ Clean separation of concerns
✅ Type safety throughout
✅ Production-ready structure

**Status**: ✅ Architecture complete and ready for development
