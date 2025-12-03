# Phase 5: Advanced Exercise Library Features & Enhanced Program Management

**Phase Status**: 🚀 **IN PROGRESS**  
**Date Started**: December 1, 2025  
**Target Completion**: December 15, 2025

---

## Phase 5 Overview

Building on the solid Exercise Library foundation (Phase 4), Phase 5 focuses on:
1. Enhanced Exercise Library features (ratings, favorites, history)
2. Improved Program management and assignment
3. Interactive Workout Runner for students
4. Performance tracking and analytics

---

## Current System State

### ✅ Completed (Phase 4)
- 3,242 exercises in database with YouTube links
- Exercise Library search page with filters (search, muscle group)
- Exercise detail pages with embedded videos
- Backend `/exercises/library/search` API endpoint
- Role-based access control on all exercise endpoints
- Exercise component reusable across application

### 🔄 Existing (Needs Enhancement)
- Program listing page (`/dashboard/programs`)
- Program detail page (`/dashboard/programs/[id]`)
- Program creation/editing (backend API exists)
- Group management page

### ⏳ Phase 5 Focus
- Exercise ratings and reviews
- Favorite exercises (bookmarking)
- Recent exercises history
- Enhanced program builder UI
- Workout runner/tracker
- Performance history

---

## Task Breakdown

### Task 1: Exercise Ratings System (Backend + Frontend)
**Estimated Time**: 2-3 hours

#### Backend Changes
```
Database:
  - Add exercise_ratings table
    * id, exerciseId, userId, rating (1-5), comment, createdAt
    * Indexes on exerciseId, userId
  
  - Add rating aggregation to Exercise meta
    * Average rating
    * Total ratings count
    * User's own rating

API Endpoints:
  - POST /exercises/{id}/rate - Submit rating
  - GET /exercises/{id}/ratings - Get exercise ratings
  - DELETE /exercises/{id}/ratings/{ratingId} - Delete own rating
  - PUT /exercises/{id}/ratings/{ratingId} - Update own rating
```

#### Frontend Changes
```
Exercise Detail Page:
  - Add rating display (stars: 1-5)
  - Show average rating and count
  - Add rating submission form
  - Display recent reviews
  - Edit/delete own rating

Exercise Card:
  - Show average rating as small badge
  - "⭐ 4.5 (128 ratings)" display
```

#### Implementation Files
- Backend: `src/exercises/ratings.controller.ts` (new)
- Backend: `src/exercises/ratings.service.ts` (new)
- Backend: `prisma/schema.prisma` (update)
- Frontend: `app/dashboard/exercises/[id]/page.tsx` (update)
- Frontend: `components/rating-component.tsx` (new)

---

### Task 2: Favorite Exercises (Bookmarking)
**Estimated Time**: 1.5-2 hours

#### Backend Changes
```
Database:
  - Add favorite_exercises table
    * id, userId, exerciseId, createdAt
    * Unique constraint: (userId, exerciseId)
    * Indexes on userId, exerciseId

API Endpoints:
  - POST /exercises/{id}/favorite - Add to favorites
  - DELETE /exercises/{id}/favorite - Remove from favorites
  - GET /users/favorites/exercises - Get user's favorite exercises
  - GET /exercises/{id}/is-favorite - Check if favorited
```

#### Frontend Changes
```
Exercise Detail Page:
  - Heart icon button to favorite/unfavorite
  - Visual feedback (filled vs outline)
  - Animate heart on toggle

Exercise Card:
  - Small heart icon in corner
  - Show "⭤ Favorited" badge

New Page: My Favorite Exercises
  - URL: /dashboard/exercises/favorites
  - Grid of user's favorited exercises
  - Can remove from favorites
  - Search and filter options
```

#### Implementation Files
- Backend: `src/favorites/favorites.controller.ts` (new)
- Backend: `src/favorites/favorites.service.ts` (new)
- Backend: `prisma/schema.prisma` (update)
- Frontend: `app/dashboard/exercises/favorites/page.tsx` (new)
- Frontend: `components/favorite-button.tsx` (new)

---

### Task 3: Exercise History & Recent Exercises
**Estimated Time**: 1.5-2 hours

#### Backend Changes
```
Database:
  - Add exercise_history table
    * id, userId, exerciseId, viewedAt
    * Indexes on userId, createdAt
    * Keep last 50 views per user (auto-cleanup)

API Endpoints:
  - GET /users/history/exercises - Get recent exercises
  - POST /exercises/{id}/view - Log exercise view
  - DELETE /users/history/exercises - Clear history
```

#### Frontend Changes
```
Exercise Detail Page:
  - Auto-log view on page load

Exercise Library Page:
  - Add "Recently Viewed" section at top
  - Show 6-8 most recent exercises
  - Collapsible section

Dashboard:
  - Add "Recent Exercises" widget
  - Show 3-4 last viewed exercises
  - Link to full history page

New Page: Exercise History
  - URL: /dashboard/exercises/history
  - Timeline view of recently viewed exercises
  - Ability to clear history
  - Filter by date
```

#### Implementation Files
- Backend: `src/history/history.controller.ts` (new)
- Backend: `src/history/history.service.ts` (new)
- Backend: `prisma/schema.prisma` (update)
- Frontend: `app/dashboard/exercises/history/page.tsx` (new)
- Frontend: `components/recent-exercises.tsx` (new)

---

### Task 4: Enhanced Program Builder UI
**Estimated Time**: 3-4 hours

#### Frontend Changes
```
Program Creation Page: /dashboard/programs/create
  - Left panel: Search exercises
    * Search box with Exercise Library integration
    * Category filters (muscle group)
    * Favorites filter
    * Recent exercises section
  
  - Right panel: Program structure
    * Drag & drop exercises to program
    * Organize into sessions/weeks
    * Set reps, sets, rest periods per exercise
    * Edit exercise parameters
    * Remove exercises
  
  - Exercise Card in builder:
    * Show thumbnail/icon
    * Difficulty badge
    * Target muscle
    * Quick preview button
    * Drag handle
    * Difficulty preview icon
  
  - Sessions Management:
    * Add/remove sessions
    * Name sessions (e.g., "Week 1 - Upper Body")
    * Reorder sessions
  
  - Program Info:
    * Name
    * Description
    * Duration
    * Target level
    * Save button

Program Edit Page: /dashboard/programs/[id]/edit
  - Same as creation
  - Load existing exercises
  - Update functionality

Program Detail Page: /dashboard/programs/[id]
  - Enhanced display
    * List all sessions with exercises
    * Show exercise details on hover
    * Download program (PDF)
    * Assign to group button
    * Edit button (if owner)
    * Delete button (if owner)
    * Share program link
```

#### Implementation Files
- Frontend: `app/dashboard/programs/create/page.tsx` (new/enhanced)
- Frontend: `app/dashboard/programs/[id]/edit/page.tsx` (new)
- Frontend: `components/program-builder.tsx` (new)
- Frontend: `components/exercise-selector.tsx` (new)
- Frontend: `components/session-editor.tsx` (new)
- Frontend: `lib/hooks/useProgramBuilder.ts` (new)

---

### Task 5: Workout Runner for Students
**Estimated Time**: 4-5 hours

#### Backend Changes
```
Database:
  - Add workout_sessions table
    * id, userId, programId, sessionDate, startTime, endTime
    * Completed status
    * Notes field
  
  - Add workout_exercise_log table
    * id, workoutSessionId, exerciseId, reps, weight, notes
    * Timestamp of completion
    * Rating/difficulty feedback

API Endpoints:
  - POST /workouts/start - Start workout
  - POST /workouts/{id}/exercise-log - Log exercise completion
  - POST /workouts/{id}/complete - Finish workout
  - GET /workouts/history - Get past workouts
  - GET /workouts/{id}/stats - Get workout stats
```

#### Frontend Changes
```
New Page: Workout Runner
  - URL: /dashboard/workouts/{id}
  - Full screen workout interface
  
  Features:
    * Current exercise display
      - Name, muscle group, thumbnail
      - Video preview (thumbnail)
      - Watch video button (opens detail page)
      - Timer (if applicable)
    
    * Exercise logging
      - Reps field
      - Weight field (optional)
      - Notes field
      - Mark as complete button
    
    * Navigation
      - Previous exercise button
      - Next exercise button
      - Skip exercise button
      - Save and exit button
      - Progress bar (exercise X of Y)
    
    * Workout controls
      - Pause/resume workout
      - Rest timer
      - Exercise timer
      - Voice guidance (future)
    
    * Post-workout
      - Summary of completed exercises
      - Stats (total volume, duration)
      - Save to history
      - Share workout results

New Page: Workout History
  - URL: /dashboard/workouts/history
  - List past workouts with dates
  - Click to view details
  - Stats dashboard
    * Total workouts
    * Total volume lifted
    * Consistency graph
    * Muscle group breakdown
```

#### Implementation Files
- Backend: `src/workouts/workouts.controller.ts` (new)
- Backend: `src/workouts/workouts.service.ts` (new)
- Backend: `prisma/schema.prisma` (update)
- Frontend: `app/dashboard/workouts/[id]/page.tsx` (new)
- Frontend: `app/dashboard/workouts/history/page.tsx` (new)
- Frontend: `components/workout-runner.tsx` (new)
- Frontend: `components/exercise-logger.tsx` (new)
- Frontend: `lib/hooks/useWorkoutRunner.ts` (new)

---

### Task 6: Navigation & UI Updates
**Estimated Time**: 1-2 hours

#### Sidebar Updates
```
Dashboard
├── 💪 My Exercises (coaches only)
├── 📚 Exercise Library
│   ├── Search & Browse
│   ├── ⭤ Favorites
│   └── 🕐 Recent
├── 👥 Groups
├── 📋 Programs
│   ├── Create New
│   ├── My Programs
│   └── Assigned to Me
└── 🏋️ Workouts (students)
    ├── Active Workouts
    ├── Complete Workout
    └── 📊 History
```

#### Dashboard Widget Updates
```
Coach Dashboard:
  - Program assignments status
  - Recent exercise additions
  - Group stats
  - Student progress overview

Student Dashboard:
  - Assigned workouts (if any)
  - Recent exercises
  - Workout history
  - Performance stats
```

---

## Implementation Priority

### Priority 1 (High - Start First)
1. **Task 1**: Exercise Ratings System
   - Backend database and API
   - Frontend rating display and submission
   - Estimated: 2-3 hours

### Priority 2 (High - Do Next)
2. **Task 2**: Favorite Exercises
   - Backend favorite management
   - Frontend favorite button and favorites page
   - Estimated: 1.5-2 hours

### Priority 3 (Medium - Do After)
3. **Task 4**: Enhanced Program Builder UI
   - Much better UX for program creation
   - Drag & drop exercise selection
   - Estimated: 3-4 hours

### Priority 4 (Medium - Do in Parallel)
4. **Task 3**: Exercise History
   - Recently viewed exercises
   - History page
   - Estimated: 1.5-2 hours

### Priority 5 (High - Important Feature)
5. **Task 5**: Workout Runner
   - Student workout experience
   - Exercise logging
   - Workout tracking
   - Estimated: 4-5 hours

### Priority 6 (Low - Polish)
6. **Task 6**: Navigation & UI Updates
   - Update sidebar and dashboard
   - Polish overall UI
   - Estimated: 1-2 hours

---

## Development Checklist

### Phase 5.1: Exercise Ratings (Day 1-2)
- [ ] Backend: Create exercise_ratings table
- [ ] Backend: Create ratings controller and service
- [ ] Backend: Add API endpoints for ratings
- [ ] Frontend: Add rating component to exercise detail
- [ ] Frontend: Add rating badge to exercise card
- [ ] Test: Verify ratings can be submitted and retrieved
- [ ] Test: Verify user can only edit/delete own ratings

### Phase 5.2: Favorite Exercises (Day 2-3)
- [ ] Backend: Create favorite_exercises table
- [ ] Backend: Create favorites controller and service
- [ ] Backend: Add API endpoints for favorites
- [ ] Frontend: Add favorite button to exercise detail
- [ ] Frontend: Create favorites page
- [ ] Frontend: Add favorite indicator to exercise card
- [ ] Test: Verify favorites work correctly
- [ ] Test: Verify favorites persisted in database

### Phase 5.3: Exercise History (Day 3-4)
- [ ] Backend: Create exercise_history table
- [ ] Backend: Create history controller and service
- [ ] Backend: Add auto-logging to exercise views
- [ ] Frontend: Add recently viewed section
- [ ] Frontend: Create exercise history page
- [ ] Frontend: Add history widget to dashboard
- [ ] Test: Verify history is logged correctly
- [ ] Test: Verify pagination on history page

### Phase 5.4: Program Builder (Day 4-6)
- [ ] Frontend: Create program builder component
- [ ] Frontend: Add exercise selector to builder
- [ ] Frontend: Implement drag & drop
- [ ] Frontend: Create session management UI
- [ ] Frontend: Add program preview
- [ ] Frontend: Connect to backend API
- [ ] Frontend: Create program edit page
- [ ] Test: Verify programs can be created
- [ ] Test: Verify exercises can be reordered
- [ ] Test: Verify programs save correctly

### Phase 5.5: Workout Runner (Day 6-8)
- [ ] Backend: Create workout tables
- [ ] Backend: Create workouts controller and service
- [ ] Backend: Add workout API endpoints
- [ ] Frontend: Create workout runner component
- [ ] Frontend: Add exercise logger
- [ ] Frontend: Create workout history page
- [ ] Frontend: Add workout timer/controls
- [ ] Test: Verify workout can be started
- [ ] Test: Verify exercises can be logged
- [ ] Test: Verify workout history saves
- [ ] Test: Verify stats calculation

### Phase 5.6: Polish & Integration (Day 8-9)
- [ ] Update navigation sidebar
- [ ] Update dashboard with new widgets
- [ ] Test entire flow end-to-end
- [ ] Fix any bugs found
- [ ] Optimize performance
- [ ] Final testing with Docker

---

## Technical Requirements

### Backend Database Migrations
```sql
-- Exercise Ratings
CREATE TABLE exercise_ratings (
  id UUID PRIMARY KEY,
  exerciseId UUID NOT NULL REFERENCES exercises(id),
  userId UUID NOT NULL REFERENCES users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(exerciseId, userId)
);

-- Favorite Exercises
CREATE TABLE favorite_exercises (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL REFERENCES users(id),
  exerciseId UUID NOT NULL REFERENCES exercises(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, exerciseId)
);

-- Exercise History
CREATE TABLE exercise_history (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL REFERENCES users(id),
  exerciseId UUID NOT NULL REFERENCES exercises(id),
  viewedAt TIMESTAMP DEFAULT NOW()
);

-- Workout Sessions
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL REFERENCES users(id),
  programId UUID REFERENCES programs(id),
  startTime TIMESTAMP DEFAULT NOW(),
  endTime TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Workout Exercise Logs
CREATE TABLE workout_exercise_logs (
  id UUID PRIMARY KEY,
  workoutSessionId UUID NOT NULL REFERENCES workout_sessions(id),
  exerciseId UUID NOT NULL REFERENCES exercises(id),
  reps INT,
  weight DECIMAL,
  notes TEXT,
  completedAt TIMESTAMP DEFAULT NOW()
);
```

### Frontend Dependencies (if needed)
```json
{
  "react-beautiful-dnd": "^13.1.1",
  "recharts": "^2.10.0",
  "date-fns": "^2.30.0"
}
```

### API Response Examples

#### GET /exercises/{id} (updated)
```json
{
  "id": "...",
  "name": "Barbell Squat",
  "meta": { ... },
  "ratings": {
    "average": 4.7,
    "count": 128,
    "userRating": 5
  },
  "isFavorited": true,
  "viewCount": 342
}
```

#### POST /exercises/{id}/rate
```json
{
  "rating": 5,
  "comment": "Great exercise for building leg strength!"
}
```

#### GET /workouts/history
```json
{
  "data": [
    {
      "id": "...",
      "programId": "...",
      "startTime": "2025-12-01T10:00:00Z",
      "endTime": "2025-12-01T10:45:00Z",
      "completed": true,
      "exerciseCount": 5,
      "totalVolume": 12500
    }
  ]
}
```

---

## Testing Strategy

### Unit Tests
- Rating calculation logic
- Favorite management
- History cleanup logic
- Workout stats calculation

### Integration Tests
- API endpoint CRUD operations
- User isolation (can't see other users' data)
- Permission checks
- Pagination

### E2E Tests
1. Coach creates program with exercises
2. Coach assigns program to group
3. Student sees assigned program
4. Student starts workout
5. Student logs exercises
6. Student completes workout
7. Student views workout history
8. Coach sees student progress

### Manual Testing
- Test all CRUD operations
- Test with different user roles
- Test permission boundaries
- Test edge cases (empty results, max values, etc)
- Performance test with large datasets

---

## Performance Considerations

### Database Optimization
- Index on (userId, exerciseId) for favorites
- Index on (userId, viewedAt) for history
- Regular cleanup of old history records (keep last 50)
- Aggregate ratings into exercise meta for performance

### Frontend Optimization
- Lazy load videos in list views
- Paginate workout history
- Cache ratings and favorites
- Debounce rating submissions

### Caching Strategy
- Cache exercise ratings for 1 hour
- Cache favorites in localStorage
- Cache user's recent exercises
- Invalidate on user action

---

## Known Limitations & Future Improvements

### Phase 5 Out of Scope (Phase 6+)
- [ ] Social features (share workouts, compare results)
- [ ] Machine learning recommendations
- [ ] Video form correction (AI analysis)
- [ ] Audio guidance during workouts
- [ ] Native mobile app
- [ ] Offline workout mode
- [ ] Advanced analytics dashboard
- [ ] Exercise variations suggestions

---

## Success Criteria

✅ **Phase 5 is complete when**:
1. Users can rate exercises 1-5 with comments
2. Users can favorite/bookmark exercises
3. Users can see recently viewed exercises
4. Program builder has drag & drop UI
5. Students can run workouts from programs
6. Workout history is tracked and displayed
7. All navigation is updated
8. Dashboard shows relevant widgets
9. All features work with role-based access
10. All tests pass

---

## Next Steps (Day 1 Morning)

1. **Pull latest code**
   ```bash
   git pull origin main
   docker-compose up -d
   ```

2. **Create database migrations**
   - Update Prisma schema
   - Run migrations

3. **Start Task 1: Exercise Ratings**
   - Create backend API endpoints
   - Create frontend rating component
   - Test integration

4. **Document progress**
   - Update this file with completed tasks
   - Track time spent per task

---

## Resources

- Exercise Library Implementation: `Documentation/41_EXERCISE_LIBRARY_GUIDE.md`
- Phase 4 Completion: `Documentation/42_PHASE_4_5_COMPLETION.md`
- Architecture Overview: `Documentation/44_ARCHITECTURE_OVERVIEW.md`
- Database Schema: `backend/prisma/schema.prisma`

---

**Last Updated**: December 1, 2025  
**Status**: Ready to Start Phase 5.1  
**Assigned to**: Development Team

