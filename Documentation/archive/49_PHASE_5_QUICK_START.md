# Phase 5 Quick Start Guide

**Date**: December 1, 2025  
**Phase**: 5 - Advanced Exercise Library & Enhanced Program Management  
**Estimated Duration**: 13-18 hours  
**Target Completion**: December 7-9, 2025

---

## What is Phase 5?

Phase 5 builds on the solid Exercise Library from Phase 4 by adding:

1. **Exercise Ratings** - Users can rate exercises 1-5 stars
2. **Favorite Exercises** - Bookmark favorite exercises
3. **Exercise History** - Track recently viewed exercises
4. **Enhanced Program Builder** - Better UI with drag & drop
5. **Workout Runner** - Students can execute workouts
6. **Navigation Updates** - New menu items and dashboard widgets

---

## Current System Status

✅ **What we have**:
- 3,242 exercises in database with YouTube links
- Exercise Library search page (search + muscle group filter)
- Exercise detail pages with embedded videos
- Role-based access control
- Backend API working perfectly
- Docker all running

🔄 **What we're building**:
- Ratings system (backend + frontend)
- Favorites system (backend + frontend)
- Enhanced program builder UI
- Workout execution interface
- Workout history tracking
- Better navigation UI

---

## Architecture Overview

```
Phase 5 System Flow
═══════════════════════════════════════════════════════════

EXERCISE ENHANCEMENTS:
┌─────────────────────┐
│  Exercise Detail    │
│  ├─ Current Features│
│  │  ├─ Videos      │
│  │  └─ Details     │
│  ├─ NEW: Ratings   │
│  ├─ NEW: Favorites │
│  └─ NEW: Buttons   │
└─────────────────────┘

PROGRAM MANAGEMENT:
┌─────────────────────┐     ┌──────────────────┐
│ Program Builder     │────→│ Workout Runner   │
│ ├─ Drag & Drop     │     │ ├─ Current Ex    │
│ ├─ Add Exercises   │     │ ├─ Logging       │
│ └─ Sessions        │     │ ├─ Timer         │
└─────────────────────┘     │ └─ History       │
                            └──────────────────┘

USER EXPERIENCE:
┌──────────────────────────────────┐
│ Dashboard                        │
│ ├─ Recent Exercises             │
│ ├─ Favorite Exercises           │
│ ├─ Active Workouts              │
│ └─ Workout History              │
└──────────────────────────────────┘
```

---

## Task Priority & Timeline

### 🔴 PRIORITY 1 (Must Do First)

**Task 1: Exercise Ratings System** (2-3 hours)
- Backend: Create database table + API
- Frontend: Add rating component
- **Target**: December 1 Evening

**Task 2: Favorite Exercises** (1.5-2 hours)
- Backend: Create database table + API
- Frontend: Add favorite button + page
- **Target**: December 2 Morning

### 🔴 PRIORITY 2 (High Priority)

**Task 5: Workout Runner** (4-5 hours)
- Backend: Create workout tables + API
- Frontend: Build workout interface
- **Target**: December 3-4

**Task 4: Enhanced Program Builder** (3-4 hours)
- Frontend: Drag & drop program builder
- **Target**: December 4-5

### 🟡 PRIORITY 3 (Medium Priority)

**Task 3: Exercise History** (1.5-2 hours)
- Backend: Track viewed exercises
- Frontend: Show recently viewed
- **Target**: December 5

### 🟢 PRIORITY 4 (Polish)

**Task 6: Navigation Updates** (1-2 hours)
- Update sidebar and dashboard
- **Target**: December 6

---

## Step-by-Step Start Guide

### Step 1: Prepare Environment (5 minutes)

```bash
# Make sure you're in the right directory
cd C:\Users\bapti\Documents\GoBeyondFitWebApp

# Verify Docker is running
docker-compose ps

# Expected output:
# CONTAINER ID   STATUS
# (backend)      Up 2 hours
# (frontend)     Up 2 hours  
# (postgres)     Up 2 hours
```

### Step 2: Review Documentation (10 minutes)

📖 Read these in order:
1. This file (Phase 5 Quick Start)
2. `Documentation/46_PHASE_5_DEVELOPMENT_PLAN.md` (Full plan)
3. `Documentation/47_PHASE_5_TASK_TRACKER.md` (Track progress)

### Step 3: Understand Data Models (10 minutes)

Key tables to add:
```sql
-- We'll add these progressively
exercise_ratings (id, exerciseId, userId, rating, comment)
favorite_exercises (id, userId, exerciseId)
exercise_history (id, userId, exerciseId, viewedAt)
workout_sessions (id, userId, programId, startTime, endTime)
workout_exercise_logs (id, workoutSessionId, exerciseId, reps, weight)
```

### Step 4: Start Task 1 - Exercise Ratings

**Phase 5.1 - Backend Setup (45 min)**

1. Open backend code:
   ```bash
   code backend/
   ```

2. Update Prisma schema (`backend/prisma/schema.prisma`):
   ```prisma
   model ExerciseRating {
     id        String   @id @default(cuid())
     exercise  Exercise @relation(fields: [exerciseId], references: [id])
     exerciseId String
     user      User     @relation(fields: [userId], references: [id])
     userId    String
     rating    Int      @db.SmallInt // 1-5
     comment   String?
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   
     @@unique([exerciseId, userId])
     @@index([exerciseId])
     @@index([userId])
   }
   ```

3. Create migration:
   ```bash
   cd backend
   npm run prisma:migrate "add exercise ratings"
   ```

4. Create rating files:
   - `src/exercises/ratings.controller.ts`
   - `src/exercises/ratings.service.ts`

5. Add API endpoints (see plan for details)

**Phase 5.1 - Frontend Setup (45 min)**

1. Create rating component:
   - `frontend/components/rating-component.tsx`
   - Star display (1-5)
   - Submit form
   - Edit/delete buttons

2. Update exercise detail page:
   - `frontend/app/dashboard/exercises/[id]/page.tsx`
   - Add rating component
   - Connect to API

**Phase 5.1 - Testing (30 min)**

1. Test backend:
   ```bash
   curl -X POST http://localhost:3000/exercises/{id}/rate \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"rating": 5, "comment": "Great!"}'
   ```

2. Test frontend:
   - Go to `/dashboard/exercises/library`
   - Click exercise
   - Try rating

### Step 5: Continue with Task 2-6

Follow same pattern for each task:
1. Read section in `46_PHASE_5_DEVELOPMENT_PLAN.md`
2. Update `47_PHASE_5_TASK_TRACKER.md` with progress
3. Implement backend
4. Implement frontend
5. Test with Docker
6. Move to next task

---

## Code Examples to Reference

### Exercise Detail Page Current Code
```tsx
// frontend/app/dashboard/exercises/[id]/page.tsx
// Already has:
// - Video embedding
// - Exercise details display
// - Meta information

// You'll add:
// - Rating component
// - Favorite button
// - History logging
```

### Program Detail Page Current Code
```tsx
// frontend/app/dashboard/programs/[id]/page.tsx
// Already shows program info

// You'll enhance with:
// - Edit button
// - Drag & drop builder
// - Assign to groups
```

### API Pattern to Follow
```typescript
// Backend example pattern:
// 1. Controller handles HTTP
// 2. Service handles business logic
// 3. Prisma handles database

@Post(':id/rate')
@UseGuards(JwtAuthGuard)
async rateExercise(
  @Param('id') id: string,
  @Body() dto: RateExerciseDto,
  @Request() req
) {
  return this.ratingsService.rateExercise(id, req.user.id, dto)
}

// Service method:
async rateExercise(exerciseId: string, userId: string, dto: RateExerciseDto) {
  return this.prisma.exerciseRating.upsert({
    where: { exerciseId_userId: { exerciseId, userId } },
    update: { rating: dto.rating, comment: dto.comment },
    create: { exerciseId, userId, rating: dto.rating, comment: dto.comment }
  })
}
```

---

## Testing Checklist for Phase 5

### Task 1 Complete?
- [ ] Can submit rating (1-5 stars)
- [ ] Rating appears on page
- [ ] Can edit own rating
- [ ] Can delete own rating
- [ ] Other users see average rating
- [ ] User can't rate same exercise twice

### Task 2 Complete?
- [ ] Can favorite exercise
- [ ] Can unfavorite exercise
- [ ] Favorites page shows all favorites
- [ ] Favorite status persists
- [ ] Can't favorite twice

### Task 3 Complete?
- [ ] Recently viewed exercises show
- [ ] History page works
- [ ] Can clear history
- [ ] Old entries auto-delete

### Task 4 Complete?
- [ ] Can create program with builder
- [ ] Can drag & drop exercises
- [ ] Can reorder exercises
- [ ] Can edit exercise parameters
- [ ] Program saves correctly

### Task 5 Complete?
- [ ] Can start workout
- [ ] Can log exercise reps/weight
- [ ] Can complete workout
- [ ] Workout history shows
- [ ] Stats calculated correctly

### Task 6 Complete?
- [ ] Navigation sidebar updated
- [ ] Dashboard has new widgets
- [ ] All links work
- [ ] Responsive design OK

---

## Common Issues & Solutions

### Issue: Docker containers not running
```bash
# Restart all services
docker-compose down
docker-compose up -d

# Check status
docker-compose ps
```

### Issue: Database migrations fail
```bash
# Check migration status
npm run prisma:migrate status

# Reset database (CAREFUL - loses data)
npm run prisma:migrate reset
```

### Issue: TypeScript errors
```bash
# Rebuild
npm run build

# Check for errors
npm run lint
```

### Issue: Frontend not updating
```bash
# Clear Next.js cache
rm -rf .next

# Restart container
docker-compose restart frontend
```

---

## Performance Tips

1. **Database Queries**:
   - Always add proper indexes
   - Use pagination (limit 20)
   - Cache aggregations (ratings count)

2. **Frontend**:
   - Lazy load videos
   - Paginate lists
   - Use React.memo for components
   - Cache API responses

3. **API**:
   - Add response caching headers
   - Paginate responses
   - Use database indexes

---

## Resources & Reference

📚 **Documentation**:
- `Documentation/46_PHASE_5_DEVELOPMENT_PLAN.md` - Full technical plan
- `Documentation/47_PHASE_5_TASK_TRACKER.md` - Progress tracking
- `Documentation/42_PHASE_4_5_COMPLETION.md` - What's already done
- `Documentation/44_ARCHITECTURE_OVERVIEW.md` - System architecture

💾 **Code References**:
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/exercises/exercise.controller.ts` - API patterns
- `frontend/app/dashboard/exercises/library/page.tsx` - Search example
- `frontend/app/dashboard/exercises/[id]/page.tsx` - Detail example

🔗 **API Documentation**:
- Swagger docs: http://localhost:3000/api/docs (when running)
- Postman collection: `Documentation/postman-collection.json`

---

## Success Definition

✅ **Phase 5 is complete when**:

1. ✅ Exercise ratings system is working (users can rate, see ratings)
2. ✅ Favorite exercises feature is working (bookmark, view favorites)
3. ✅ Exercise history is tracked (see recently viewed)
4. ✅ Program builder has better UI (drag & drop, preview)
5. ✅ Workout runner is functional (start, log, complete workouts)
6. ✅ Navigation is updated (new menu items, dashboard widgets)
7. ✅ All tests pass (no TypeScript errors, Docker running)
8. ✅ Role-based access works (students vs coaches)
9. ✅ Performance is good (pages load fast, no lag)
10. ✅ Documentation is updated

---

## Timeline Recommendation

- **Day 1** (Dec 1): Task 1 (Ratings) - 2.5 hours
- **Day 2** (Dec 2): Task 2 (Favorites) - 1.5 hours  
- **Day 3** (Dec 3): Task 5 Pt 1 (Workout DB/API) - 2 hours
- **Day 4** (Dec 4): Task 5 Pt 2 (Workout Frontend) - 2.5 hours
- **Day 5** (Dec 5): Task 4 (Program Builder) - 3 hours
- **Day 6** (Dec 6): Task 3 (History) - 1.5 hours + testing
- **Day 7** (Dec 7): Task 6 (Navigation) + final testing - 2 hours
- **Day 8** (Dec 8): Buffer + polish + deployment

---

## Next Actions

1. ✅ Read this guide (you're here!)
2. ⏳ Read full `46_PHASE_5_DEVELOPMENT_PLAN.md`
3. ⏳ Review `backend/prisma/schema.prisma` current state
4. ⏳ Start Task 1: Exercise Ratings Backend
5. ⏳ Update `47_PHASE_5_TASK_TRACKER.md` as you progress

---

**Ready to Start Phase 5? Let's go!** 🚀

Last updated: December 1, 2025

