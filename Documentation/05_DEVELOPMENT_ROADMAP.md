# GoBeyondFit - Development Roadmap & Next Steps

## Quick Summary

The GoBeyondFit project has been successfully initialized with:
- ✅ Complete NestJS backend structure
- ✅ Complete Next.js 14 frontend
- ✅ Prisma database schema
- ✅ Authentication system
- ✅ Exercise, Group, and Program modules
- ✅ Swagger API documentation
- ✅ React Query & Tailwind CSS setup

## Immediate Next Tasks (Priority Order)

### 🔴 High Priority - Core Functionality

#### 1. Email & Invitations (Backend)
**File**: `backend/src/invitations/`
```bash
# Create files:
- invitation.module.ts
- invitation.service.ts
- invitation.controller.ts
- dto/invitation.dto.ts
- email/email.service.ts
- email/templates/
```

**Key Features**:
- Send invitations with email
- Accept/reject flow
- Email templates with deep links
- Nodemailer integration

#### 2. Program Assignment (Backend)
**File**: `backend/src/assignments/`
- Create program-assignment.module.ts
- Track assignments with date
- Support bulk assignment to groups
- Assignment history tracking

#### 3. Access Control (Backend)
**File**: `backend/src/common/guards/`
- Create RoleGuard for RBAC
- Create OwnershipGuard for resource protection
- Add @UseGuards decorators to controllers

#### 4. Session Progress (Backend)
**File**: `backend/src/progress/`
- Implement SessionProgress CRUD
- Autosave functionality
- Video URL storage
- Progress validation

### 🟡 Medium Priority - Advanced Features

#### 5. Program Audit (Backend)
**File**: `backend/src/audit/`
- Track all program changes
- Store diffs as JSON
- User attribution
- Audit trail queries

#### 6. Badge System (Backend)
**File**: `backend/src/badges/`
- Badge criteria evaluation
- Event emitters for achievements
- Badge award logic
- User badge tracking

#### 7. Statistics & Analytics (Backend)
**File**: `backend/src/stats/`
- Max weight queries
- Volume calculations
- Progress tracking over time
- Performance aggregations

### 🟢 Lower Priority - Frontend

#### 8. Coach Dashboard
**File**: `frontend/app/coach/dashboard/page.tsx`
- Overview cards
- Quick stats
- Navigation to sub-features
- Student count display

#### 9. Student Dashboard
**File**: `frontend/app/student/dashboard/page.tsx`
- Assigned programs
- Upcoming sessions
- Progress overview
- Badges earned

#### 10. Frontend Feature Pages
- Exercise manager (`/coach/exercises/`)
- Group manager (`/coach/groups/`)
- Program builder (`/coach/programs/new`)
- Sessions calendar (`/student/sessions/`)
- Workout runner (`/student/workouts/:sessionId`)

## Implementation Priority Matrix

```
High Impact + Quick Implementation:
├── Email Service ⭐⭐⭐⭐⭐
├── Access Control Guards ⭐⭐⭐⭐⭐
├── Session Progress ⭐⭐⭐⭐
└── Program Assignment ⭐⭐⭐⭐

Medium Impact + Medium Implementation:
├── Program Audit ⭐⭐⭐
├── Badge System ⭐⭐⭐
├── Statistics API ⭐⭐⭐
└── Form Components ⭐⭐⭐

Nice-to-Have:
├── Dashboard Pages ⭐⭐
├── Video Upload ⭐⭐
└── Real-time Features ⭐
```

## Code Templates for Next Implementation

### Email Service Template
```typescript
// backend/src/common/services/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST'),
      port: configService.get('SMTP_PORT'),
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS'),
      },
    });
  }

  async sendInvitation(email: string, inviteLink: string) {
    return this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'You have been invited to join GoBeyondFit',
      html: `
        <h1>Join GoBeyondFit</h1>
        <p>You've been invited to join a fitness coaching group.</p>
        <a href="${inviteLink}">Accept Invitation</a>
      `,
    });
  }
}
```

### RBAC Guard Template
```typescript
// backend/src/common/guards/role.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}
```

### Dashboard Component Template (Frontend)
```typescript
// frontend/app/coach/dashboard/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function CoachDashboard() {
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/auth/students/:coachId')
  })

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Coach Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold">Students</h2>
          <p className="text-2xl font-bold text-blue-600">{students?.length || 0}</p>
        </div>
        {/* More stat cards */}
      </div>

      <nav className="flex gap-4">
        <Link href="/coach/exercises" className="px-4 py-2 bg-blue-600 text-white rounded">
          Manage Exercises
        </Link>
        <Link href="/coach/groups" className="px-4 py-2 bg-blue-600 text-white rounded">
          Manage Groups
        </Link>
        <Link href="/coach/programs" className="px-4 py-2 bg-blue-600 text-white rounded">
          Create Programs
        </Link>
      </nav>
    </div>
  )
}
```

## Testing Strategy for Remaining Features

### Unit Tests Priority
1. Email service
2. RBAC guards
3. Progress service
4. Badge service
5. Statistics service

### E2E Tests Priority
1. Complete invitation flow
2. Program assignment flow
3. Progress tracking flow
4. Badge awarding flow

### Frontend Tests Priority
1. Dashboard components
2. Form components
3. API integration
4. Authentication flow

## Database Seeding

Create initial data for testing:
```bash
# backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test users
  // Create global exercises
  // Create test programs
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
```

## Performance Considerations

- ✅ Paginate list endpoints
- ✅ Add database indexes for frequently queried fields
- ✅ Implement caching for global exercises
- ✅ Use React Query for client-side caching
- ✅ Optimize image uploads with compression

## Security Enhancements

- ✅ Add rate limiting
- ✅ Validate file uploads
- ✅ Add CORS configuration
- ✅ Add input sanitization
- ✅ Implement audit logging

## Monitoring & Logging

Consider adding:
- Winston for backend logging
- Sentry for error tracking
- Google Analytics for frontend
- Database query logging

## Development Tools

```bash
# Install recommended VS Code extensions:
- NestJS
- REST Client
- Prisma
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- Prettier
- ESLint

# Backend development:
npm run start:dev      # Watch mode
npm run debug          # Debug mode
npm run test:watch    # Test watch

# Frontend development:
npm run dev            # Development server
npm run build          # Production build
npm run lint           # ESLint
```

## Estimated Timeline

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| Phase 2 Completion | Invitations + Email | 4-6 hours |
| Phase 3 Completion | Assignments + Audit + Guards | 6-8 hours |
| Phase 4 Start | Progress + Sessions | 8-10 hours |
| Phase 5 Start | Badges + Stats | 6-8 hours |
| Frontend Basics | Dashboards + Forms | 10-12 hours |
| Frontend Features | All feature pages | 16-20 hours |
| Testing | Unit + E2E + Component | 12-16 hours |
| Deployment | Docker + CI/CD | 4-6 hours |
| **Total** | All phases | **66-90 hours** |

## Repository Best Practices

```bash
# Commit messages should follow:
feat: Add invitation email service
fix: Correct program assignment logic
refactor: Reorganize auth module
docs: Update API documentation
test: Add invitation flow tests
chore: Update dependencies

# Branch naming:
feature/invitation-system
fix/program-assignment
refactor/auth-guards
docs/api-documentation
```

## Useful Commands Reference

```bash
# Backend
cd backend

# Generate new resource
nest generate resource users

# Format code
npm run format

# Lint check
npm run lint

# Watch tests
npm run test:watch

# Database
npx prisma studio      # Visual DB editor
npx prisma migrate dev # Create migration
npx prisma db seed     # Seed database

# Frontend
cd frontend

# Add shadcn component
npx shadcn@latest add button

# Build for production
npm run build
npm run start  # Run production
```

## Support & Resources

- NestJS Docs: https://docs.nestjs.com
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- React Query: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com/docs

---

**Status**: ✅ Project foundation complete. Ready for feature implementation.

**Next Session**: Start with Email Service + Access Control Guards (1-2 hours) for quick wins.
