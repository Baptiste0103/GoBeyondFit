# 🏗️ GoBeyondFit Architecture

**Version:** 1.0.0  
**Last Updated:** December 15, 2025

---

## System Overview

GoBeyondFit is a **multi-tenant SaaS platform** for fitness coaching and workout management.

### Tech Stack

**Backend:**
- **NestJS** - TypeScript framework
- **Prisma ORM** - Database layer
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **TypeScript** - Type safety

**Frontend:**
- **Next.js 14** - React framework (App Router)
- **React 18** - UI library
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **TypeScript** - Type safety

**Infrastructure:**
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Docker Compose** - Local development

---

## Architecture Patterns

### 1. Multi-Tenant SaaS

**Every query MUST include userId:**

```typescript
// ✅ CORRECT - Multi-tenant safe
async findExercises(userId: number) {
  return this.prisma.exercise.findMany({
    where: { userId }
  });
}

// ❌ WRONG - Data leak!
async findExercises() {
  return this.prisma.exercise.findMany();
}
```

**Enforced by:**
- Pre-commit hooks
- Security Agent (Agent 01)
- E2E tests

---

### 2. Backend Architecture (NestJS)

```
backend/
├── src/
│   ├── auth/                 # JWT authentication
│   ├── users/                # User management
│   ├── exercises/            # Exercise library
│   ├── programs/             # Training programs
│   ├── workouts/             # Workout sessions
│   ├── sessions/             # Session tracking
│   ├── session-progress/     # Progress tracking
│   ├── common/               # Shared utilities
│   │   ├── decorators/       # Custom decorators
│   │   ├── guards/           # Auth guards
│   │   ├── filters/          # Exception filters
│   │   └── interceptors/     # Request interceptors
│   └── main.ts               # Application entry
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Schema migrations
└── test/                     # E2E tests
```

**Key Patterns:**
- **Controllers:** HTTP endpoints (`@Controller`, `@Get`, `@Post`)
- **Services:** Business logic (injected via DI)
- **Guards:** Authentication (`@UseGuards(JwtAuthGuard)`)
- **DTOs:** Request validation (`class-validator`)
- **Prisma:** Database queries (multi-tenant safe)

---

### 3. Frontend Architecture (Next.js)

```
frontend/
├── app/
│   ├── (auth)/               # Authentication pages
│   ├── dashboard/            # Main dashboard
│   ├── exercises/            # Exercise management
│   ├── programs/             # Program builder
│   ├── workouts/             # Workout sessions
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── sidebar-navigation.tsx
│   ├── header.tsx
│   └── ...
├── lib/
│   ├── api.ts                # API client
│   ├── auth.ts               # Auth utilities
│   └── utils.ts              # Helpers
└── public/                   # Static assets
```

**Key Patterns:**
- **Server Components:** Default (RSC)
- **Client Components:** `'use client'` (interactivity)
- **API Routes:** `app/api/` (backend proxy)
- **Auth:** JWT tokens in cookies
- **State:** React hooks + Server Actions

---

### 4. Database Schema (Prisma)

**Core Entities:**

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      Role     @default(CLIENT)
  
  exercises Exercise[]
  programs  Program[]
  sessions  Session[]
}

model Exercise {
  id     Int    @id @default(autoincrement())
  name   String
  userId Int
  user   User   @relation(fields: [userId], references: [id])
  
  @@index([userId])  // Performance optimization
}

model Program {
  id       Int    @id @default(autoincrement())
  name     String
  userId   Int
  user     User   @relation(fields: [userId], references: [id])
  workouts Workout[]
  
  @@index([userId])
}

model Workout {
  id         Int      @id @default(autoincrement())
  programId  Int
  program    Program  @relation(fields: [programId], references: [id])
  exercises  WorkoutExercise[]
}

model Session {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  startedAt DateTime @default(now())
  status    SessionStatus
  
  @@index([userId, status])
}
```

**Multi-Tenancy Enforcement:**
- All tenant data tables have `userId` foreign key
- All queries filtered by `userId`
- Database-level isolation via row-level security (future)

---

### 5. Authentication Flow

```
1. User Login
   ├─> POST /api/auth/login { email, password }
   └─> JWT token (7 days expiry)

2. Token Storage
   ├─> HTTP-only cookie (secure)
   └─> localStorage (backup)

3. API Requests
   ├─> Authorization: Bearer <token>
   ├─> JWT validation (@UseGuards(JwtAuthGuard))
   └─> Extract userId from token

4. Role-Based Access
   ├─> @Roles('ADMIN', 'COACH')
   └─> RolesGuard checks user.role
```

**Security Layers:**
1. JWT signature verification
2. Token expiry check
3. Role-based authorization
4. Multi-tenant isolation (userId filter)

---

### 6. Agent Orchestration System

**16 Specialized Agents:**

```
Agent 00 (Orchestrator) ──┐
                          ├──> Agent 01 (Security)
                          ├──> Agent 02 (Database)
                          ├──> Agent 03 (API Development)
                          ├──> Agent 04 (Performance)
                          ├──> Agent 05 (Testing)
                          ├──> Agent 06 (Frontend)
                          ├──> Agent 07 (Documentation)
                          ├──> Agent 08 (DevOps)
                          ├──> Agent 09 (Code Review)
                          ├──> Agent 10 (Error Handling)
                          ├──> Agent 11 (Data Migration)
                          ├──> Agent 12 (Integration)
                          ├──> Agent 13 (UI/UX Design)
                          ├──> Agent 14 (Analytics)
                          ├──> Agent 15 (Compliance)
                          └──> Agent 16 (Performance Monitor)
```

**See:** [06_AGENT_SYSTEM.md](06_AGENT_SYSTEM.md)

---

### 7. Validation Gates

**4-Gate CI/CD Pipeline:**

```
Gate #1: Static Analysis
├─> ESLint
├─> TypeScript compilation
└─> Prisma validation

Gate #2: Unit & Integration Tests
├─> Jest unit tests
├─> Service integration tests
└─> 80% coverage requirement

Gate #3: Security & Performance
├─> Security audit (npm audit)
├─> Performance benchmarks (<500ms)
├─> Pre-commit security hooks
└─> Multi-tenancy validation

Gate #4: End-to-End Tests
├─> E2E test suite (4 suites)
├─> Security E2E tests
├─> Performance E2E tests
└─> Workflow E2E tests
```

**Deployment Blocked:** If any gate fails ❌

---

## Performance Targets

- **API Response:** <500ms (p95)
- **Database Queries:** <200ms (avg)
- **Page Load:** <2s (FCP)
- **Test Coverage:** >80%
- **N+1 Queries:** Zero tolerance

---

## Security Requirements

✅ **MANDATORY for all features:**
1. Multi-tenancy (userId filter)
2. Authentication (@UseGuards)
3. Authorization (@Roles)
4. Input validation (DTOs)
5. SQL injection prevention (Prisma)
6. XSS prevention (React auto-escape)
7. CSRF protection (SameSite cookies)
8. Rate limiting (future)

**See:** [SECURITY_FIRST.md](SECURITY_FIRST.md)

---

## Scalability Considerations

**Current (MVP):**
- Single PostgreSQL instance
- Monolithic deployment
- Session-based auth

**Future Scaling:**
- PostgreSQL read replicas
- Redis caching layer
- Microservices extraction
- CDN for static assets
- Horizontal scaling (Kubernetes)

---

## Development Workflow

```
1. Create feature branch
2. Security check (SECURITY_FIRST.md)
3. Implement feature
4. Pre-commit hooks validate
5. Create PR
6. 4 validation gates run
7. Code review (Agent 09)
8. Merge to master
9. Deploy to production
```

**See:** [02_DEVELOPMENT_WORKFLOW.md](02_DEVELOPMENT_WORKFLOW.md)

---

## Next Steps

- **Database:** [03_DATABASE_SCHEMA.md](03_DATABASE_SCHEMA.md)
- **API:** [04_API_REFERENCE.md](04_API_REFERENCE.md)
- **Frontend:** [05_FRONTEND_ARCHITECTURE.md](05_FRONTEND_ARCHITECTURE.md)
- **Development:** [02_DEVELOPMENT_WORKFLOW.md](02_DEVELOPMENT_WORKFLOW.md)
