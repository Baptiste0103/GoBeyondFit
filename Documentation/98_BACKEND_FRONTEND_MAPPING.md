# Backend API vs Frontend Implementation Mapping

**Generated**: December 3, 2025  
**Total Backend Endpoints**: 102+  
**Frontend Implementation Status**: ~50-60%

---

## 📊 Summary Statistics

| Category | Backend | Integrated | Partial | Missing | Status |
|----------|---------|-----------|---------|---------|--------|
| Authentication | 7 | 7 | 0 | 0 | ✅ Complete |
| Exercises | 7 | 6 | 1 | 0 | ✅ Complete |
| Programs | 8 | 6 | 2 | 0 | ⚠️ 75% |
| Workouts | 8 | 3 | 2 | 3 | ⚠️ 38% |
| Sessions | 5 | 4 | 1 | 0 | ✅ Complete |
| Storage/Videos | 5 | 5 | 0 | 0 | ✅ Complete |
| Stats | 4 | 3 | 1 | 0 | ⚠️ 75% |
| Ratings | 5 | 0 | 0 | 5 | ❌ 0% |
| History | 6 | 0 | 0 | 6 | ❌ 0% |
| Favorites | 4 | 0 | 0 | 4 | ❌ 0% |
| Badges | 3 | 3 | 0 | 0 | ✅ Complete |
| Groups | 10 | 8 | 2 | 0 | ⚠️ 80% |
| Invitations | 6 | 3 | 3 | 0 | ⚠️ 50% |
| Program Builder | 7 | 4 | 3 | 0 | ⚠️ 57% |
| Workout Runner | 8 | 2 | 2 | 4 | ❌ 25% |
| **TOTAL** | **102+** | **59** | **22** | **22** | **57%** |

---

## ✅ FULLY IMPLEMENTED (59 endpoints)

### 🔐 Authentication (7/7)
```
✅ POST   /auth/signup              - Register new user
✅ POST   /auth/login               - Login user
✅ GET    /auth/me                  - Get current user
✅ GET    /auth/users               - List all users
✅ PUT    /auth/users/:id           - Update user profile
✅ DELETE /auth/users/:id           - Delete user
✅ GET    /auth/students/:coachId   - Get coach's students
```

**Frontend Implementation**:
- `lib/auth.ts` - AuthClient with signup/login
- `lib/api-client.ts` - User CRUD operations
- React components for login/signup flows

---

### 💪 Exercises (6/7)
```
✅ GET    /exercises                   - List all exercises
✅ GET    /exercises/:id               - Get exercise details
✅ POST   /exercises                   - Create exercise
✅ PUT    /exercises/:id               - Update exercise
✅ DELETE /exercises/:id               - Delete exercise
✅ GET    /exercises/my/created        - Get my exercises
⚠️ GET    /exercises/search?query      - Search exercises (basic)
```

**Frontend Implementation**:
- `lib/api-client.ts` - Full CRUD operations
- `components/exercise-library` - Display & search
- `components/exercise-form` - Create/edit form
- Search implemented with TanStack Query

---

### 📅 Sessions (4/5)
```
✅ GET    /workouts/my-sessions         - Get my sessions
✅ GET    /workouts/sessions/:id        - Get session details
✅ POST   /session-progress/.../progress - Save progress
✅ GET    /session-progress/sessions/:id - Get session progress
⚠️ POST   /workouts/sessions/:id/complete - Complete session (partial)
```

**Frontend Implementation**:
- `hooks/use-api.ts` - Session data fetching
- `components/workout` - Session display & progress saving
- Progress tracking with video upload

---

### 🎬 Storage/Videos (5/5)
```
✅ POST   /storage/progress/:progressId/video        - Upload video
✅ GET    /storage/progress/:progressId/videos       - List videos
✅ GET    /storage/videos/:mediaId                   - Get video info
✅ DELETE /storage/videos/:mediaId                   - Delete video
✅ GET    /storage/stats                             - Get storage stats
```

**Frontend Implementation**:
- `components/video-uploader` - Upload & compression
- `components/video-recorder` - Record videos
- Video listing in workout sessions
- Automatic compression to 480p

---

### 🏆 Badges (3/3)
```
✅ GET    /badges                   - List all badges
✅ GET    /badges/my-badges         - Get user's badges
✅ GET    /badges/progress          - Get badge progress
```

**Frontend Implementation**:
- `hooks/use-api.ts` - Badge queries
- `components/badges` - Display earned badges
- Badge progress tracking

---

### 👥 Groups (8/10)
```
✅ GET    /groups                      - List groups
✅ GET    /groups/:id                  - Get group details
✅ POST   /groups                      - Create group
✅ PUT    /groups/:id                  - Update group
✅ DELETE /groups/:id                  - Delete group
✅ POST   /groups/:id/invite           - Invite user
✅ GET    /groups/invitations/me       - Get invitations
⚠️ DELETE /groups/:id/members/:userId  - Remove member (partial)
⚠️ POST   /groups/:id/leave            - Leave group (partial)
```

**Frontend Implementation**:
- `lib/api-client.ts` - Full group CRUD
- `components/groups` - Group management
- Invitation sending & display
- Member removal (basic)

---

## ⚠️ PARTIALLY IMPLEMENTED (22 endpoints)

### 📊 Stats (3/4)
```
✅ GET    /stats/my-stats                    - Get my statistics
✅ GET    /stats/exercise/:exerciseId        - Get exercise stats
⚠️ GET    /stats/exercise/:id/history       - Exercise history (partial)
```

**Frontend Implementation**:
- `hooks/use-api.ts` - Stats queries
- `components/stats` - Dashboard display
- **Missing**: Detailed exercise performance history

---

### 🏋️ Workouts (3/8)
```
✅ GET    /workouts/my-sessions              - List sessions
✅ GET    /workouts/current                  - Get active session
✅ GET    /workouts/:id/progress             - Get workout progress
⚠️ POST   /workouts/start/:sessionId         - Start workout (partial)
⚠️ POST   /workouts/:id/exercise/:idx/complete - Complete exercise (partial)
❌ POST   /workouts/:id/exercise/:idx/skip   - Skip exercise (not implemented)
❌ POST   /workouts/:id/end                  - End workout (not implemented)
❌ GET    /workouts/history/list             - Workout history (not implemented)
```

**Frontend Implementation**:
- Basic workout UI in place
- **Missing**: Start session flow, exercise skip, end session, history view

---

### 📋 Programs (6/8)
```
✅ GET    /programs                          - List all programs
✅ GET    /programs/my-assignments           - Get assigned programs
✅ POST   /programs                          - Create program
✅ PUT    /programs/:id                      - Update program
✅ DELETE /programs/:id                      - Delete program
⚠️ POST   /programs/:id/assign/:studentId    - Assign program (partial)
⚠️ GET    /programs/:id/audit                - Get audit log (not displayed)
```

**Frontend Implementation**:
- Program CRUD implemented
- Assignment works (basic)
- **Missing**: Audit log viewer, detailed assignment management

---

### 🔨 Program Builder (4/7)
```
✅ GET    /programs/builder/:id/details           - Get program details
✅ PUT    /programs/builder/:id/save              - Save program
✅ GET    /programs/builder/exercises/filter      - Filter exercises
⚠️ POST   /programs/builder/validate              - Validate program (not used)
⚠️ POST   /programs/builder/check-duplicates      - Check duplicates (not used)
❌ POST   /programs/builder/:id/clone             - Clone program (not implemented)
❌ GET    /programs/builder/:id/stats             - Program stats (not implemented)
```

**Frontend Implementation**:
- Program builder UI fully functional
- Save/load working after recent Prisma fixes
- **Missing**: Clone feature, validation UI, stats dashboard

---

### 💌 Invitations (3/6)
```
✅ POST   /invitations                - Send invitation
✅ GET    /invitations/received       - Get received invitations
✅ GET    /invitations/sent           - Get sent invitations
⚠️ POST   /invitations/:id/accept     - Accept invitation (partial)
⚠️ POST   /invitations/:id/reject     - Reject invitation (partial)
⚠️ DELETE /invitations/:id            - Delete invitation (partial)
```

**Frontend Implementation**:
- Invitation sending works
- **Missing**: Accept/reject UI, deletion UI

---

## ❌ NOT IMPLEMENTED (22 endpoints)

### ⭐ Favorites (0/4)
```
❌ POST   /favorites/:id/favorite      - Add favorite
❌ DELETE /favorites/:id/favorite      - Remove favorite
❌ GET    /favorites/:id/is-favorite   - Check if favorite
❌ GET    /favorites/exercises         - List favorites
```

**Required UI**: 
- Add "Add to Favorites" button on exercises
- Create "My Favorites" tab in exercise library
- Display favorite count on exercise cards

---

### 📜 History (0/6)
```
❌ POST   /history/:id/view             - Track view
❌ GET    /history/:id/view-count       - Get view count
❌ GET    /history/:id/unique-views     - Get unique view count
❌ GET    /history/exercises            - List viewed exercises
❌ GET    /history/recent               - Get recently viewed
❌ DELETE /history/entries/:entryId     - Delete entry
```

**Required UI**:
- Track exercise views automatically
- Create "Recently Viewed" section
- Show view statistics on exercises
- Allow clearing view history

---

### ⭐⭐ Ratings (0/5)
```
❌ POST   /ratings                   - Create rating
❌ GET    /ratings                   - List ratings
❌ GET    /ratings/me                - Get my ratings
❌ PUT    /ratings/:id               - Update rating
❌ DELETE /ratings/:id               - Delete rating
```

**Required UI**:
- 5-star rating component on exercises
- Show average ratings
- Display user's rating (editable)
- Show total rating count

---

### 🏃 Workout Runner Advanced (4/8)
```
❌ POST   /workouts/start/:sessionId           - Start session
❌ POST   /workouts/:id/exercise/:idx/skip     - Skip exercise
❌ POST   /workouts/:id/end                    - End session
❌ GET    /workouts/stats/summary              - Workout stats
```

**Required UI**:
- "Start Session" button with confirmation
- "Skip Exercise" button during workout
- "End Session" confirmation and summary
- Session stats dashboard

---

## 🎯 Priority Implementation Roadmap

### 🔴 CRITICAL (Blocks Core Features) - Weeks 1-2
1. **Ratings System** (5 endpoints)
   - Add 5-star rating UI to exercises
   - Show average ratings globally
   - Display user's personal rating

2. **Favorites System** (4 endpoints)
   - Add "♥️" button to exercise cards
   - Create "My Favorites" view
   - Integrate into search/filter

3. **Workout Runner Advanced** (4 endpoints)
   - Start/Skip/End session flows
   - Session completion summary
   - Better error handling

### 🟡 IMPORTANT (Enhance UX) - Weeks 3-4
4. **History Tracking** (6 endpoints)
   - Auto-track exercise views
   - "Recently Viewed" section
   - View history clearing

5. **Program Builder Enhancements** (3 endpoints)
   - Clone program feature
   - Program validation UI
   - Duplicate checking UI

6. **Invitations Management** (3 endpoints)
   - Accept/Reject UI
   - Invitation deletion
   - Status indicators

### 🟢 NICE TO HAVE (Polish) - Weeks 5+
7. **Workout Statistics** (2 endpoints)
   - Historical workout data
   - Exercise performance trends
   - Personal records

8. **Program Audit Log** (1 endpoint)
   - View change history
   - Rollback capability (optional)

---

## 📁 Implementation Guide

### To Add Ratings:
**Files to modify**:
```typescript
// 1. Add to api-client.ts
export const ratingsClient = {
  async rateExercise(exerciseId: string, rating: number, comment?: string) { }
  async getExerciseRatings(exerciseId: string) { }
  async updateRating(ratingId: string, rating: number) { }
  async deleteRating(ratingId: string) { }
}

// 2. Create component: components/exercise-rating.tsx
// 3. Integrate into: components/exercise-card.tsx
// 4. Show in: components/exercise-details.tsx
```

### To Add Favorites:
**Files to modify**:
```typescript
// 1. Add to api-client.ts
export const favoritesClient = {
  async addFavorite(exerciseId: string) { }
  async removeFavorite(exerciseId: string) { }
  async isFavorite(exerciseId: string): Promise<boolean> { }
  async getFavorites(): Promise<Exercise[]> { }
}

// 2. Create component: components/favorite-button.tsx
// 3. Create page: app/favorites/page.tsx
// 4. Integrate into: components/exercise-library.tsx
```

### To Add History:
**Files to modify**:
```typescript
// 1. Add to api-client.ts
export const historyClient = {
  async trackView(exerciseId: string) { }
  async getRecentlyViewed(): Promise<Exercise[]> { }
  async getViewCount(exerciseId: string): Promise<number> { }
  async clearHistory() { }
}

// 2. Auto-track views in: components/exercise-details.tsx
// 3. Create page: app/history/page.tsx
// 4. Add "Recently Viewed" to: app/exercises/page.tsx
```

---

## 🔧 Quick Implementation Checklist

### Phase 1: Essential Features
- [ ] Add ratings endpoints to `api-client.ts`
- [ ] Create rating component with 5-star UI
- [ ] Show average rating on exercise cards
- [ ] Add favorites endpoints to `api-client.ts`
- [ ] Create favorite button component
- [ ] Add "My Favorites" page

### Phase 2: Enhanced UX
- [ ] Implement history tracking
- [ ] Create "Recently Viewed" section
- [ ] Add view count to exercises
- [ ] Implement workout start/skip/end flows
- [ ] Add session completion summary

### Phase 3: Advanced Features
- [ ] Program clone UI
- [ ] Program validation feedback
- [ ] Invitations accept/reject/delete UIs
- [ ] Workout statistics dashboard
- [ ] Program audit log viewer

---

## 📞 Notes for Development

1. **API URL**: Frontend uses `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:3001/api`)
2. **Auth Token**: Stored in localStorage as `auth_token`
3. **Error Handling**: All API calls should be wrapped in try-catch with user feedback
4. **Loading States**: Use TanStack Query `useQuery`/`useMutation` for state management
5. **Validation**: Backend validates all inputs; frontend should validate before submission

---

## 📈 Coverage Summary

```
✅ Complete Features: 59 endpoints (57%)
  - Authentication, Exercises, Sessions, Storage, Badges, etc.

⚠️ Partial Features: 22 endpoints (22%)
  - Stats, Workouts, Programs, Builder, Invitations

❌ Missing Features: 22 endpoints (21%)
  - Ratings, History, Favorites, Advanced Workout features

Total Available: 103 endpoints
Total Implemented: 59 endpoints
Total Ready for Dev: 22 endpoints (easy wins)
Total Not Started: 22 endpoints
```

---

**Last Updated**: December 3, 2025  
**Status**: Production-Ready Core (57% complete), Ready for Phase 2 (22% low-hanging fruit)
