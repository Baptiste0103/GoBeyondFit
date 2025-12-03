# 🗺️ PHASE 5.2 - APPLICATION ROUTES MAP

## Frontend Routes (Next.js)

### 📝 Exercise Management Routes

```
/exercises/create
├─ Method: GET (display form)
├─ POST (submit form)
├─ Purpose: Create new exercise
├─ Component: frontend/app/exercises/create/page.tsx
├─ API Call: POST /api/exercises
└─ Redirect On Success: /exercises/my

/exercises/my
├─ Method: GET
├─ Purpose: Display all coach-created exercises
├─ Component: frontend/app/exercises/my/page.tsx
├─ Features:
│  ├─ Grid layout (12 per page)
│  ├─ Search with debounce
│  ├─ Pagination (previous/next + page buttons)
│  ├─ Edit button → /exercises/[id]/edit
│  ├─ Delete button (with confirmation)
│  └─ Video button (if URL exists)
├─ API Call: GET /exercises/my/created?page=X&limit=20&search=query
└─ Loading/Error States: ✅

/exercises/[id]/edit
├─ Method: GET (load form)
├─ PUT (submit changes)
├─ Purpose: Edit exercise details
├─ Component: frontend/app/exercises/[id]/edit/page.tsx
├─ Features:
│  ├─ Pre-fill form with exercise data
│  ├─ Edit all fields (name, description, difficulty, etc.)
│  ├─ Back button to /exercises/my
│  ├─ Cancel button
│  └─ Save changes button
├─ API Calls:
│  ├─ GET /api/exercises/:id (load)
│  └─ PUT /api/exercises/:id (save)
└─ Redirect On Success: /exercises/my
```

### 🏋️ Program Management Routes

```
/programs/new
├─ Method: GET
├─ Purpose: Create new training program
├─ Component: frontend/app/programs/new/page.tsx
├─ Displays: <ProgramBuilderV2 /> (no initialProgramId)
├─ Features:
│  ├─ Title & description inputs
│  ├─ Add/edit blocks (training phases)
│  ├─ Add/edit weeks within blocks
│  ├─ Add/edit sessions within weeks
│  ├─ Add/remove exercises per session
│  ├─ Search exercises while building
│  ├─ Save button (save & stay)
│  ├─ Save & Quit button (save & redirect to /programs)
│  └─ Cancel button
├─ API Calls:
│  ├─ PUT /api/programs/builder/:id/save (first create via other route)
│  ├─ GET /api/programs/builder/exercises/filter (search)
│  └─ GET /api/programs/builder/:id/details (if loading)
└─ Data Structure: Blocks → Weeks → Sessions → Exercises

/programs/builder/[id]
├─ Method: GET
├─ Purpose: Edit existing training program
├─ Component: frontend/app/programs/builder/[id]/page.tsx
├─ Displays: <ProgramBuilderV2 initialProgramId={id} />
├─ Features:
│  ├─ Load program data from database
│  ├─ Display existing blocks/weeks/sessions/exercises
│  ├─ Modify structure (add/remove items)
│  ├─ Add new exercises to existing sessions
│  ├─ Same save options as /programs/new
│  └─ Changes persist across sessions
├─ API Calls:
│  ├─ GET /api/programs/builder/:id/details (load on mount)
│  ├─ GET /api/programs/builder/exercises/filter (search)
│  └─ PUT /api/programs/builder/:id/save (when saving)
└─ Data Structure: Full structure loaded and editable

/programs
├─ Method: GET
├─ Purpose: List user's programs
├─ Note: Route already exists
├─ Actions:
│  ├─ View program details
│  ├─ Edit → routes to /programs/builder/[id]
│  ├─ Delete program
│  └─ Create new → routes to /programs/new
└─ Redirect Target: Save & Quit brings users here
```

---

## Backend API Routes (NestJS)

### 🏃 Exercise API Endpoints

```
POST /api/exercises
├─ Purpose: Create new exercise
├─ Body: {
│   name: string,
│   description: string,
│   difficulty: string,
│   muscleGroups: string[],
│   instructions: string[],
│   videoUrl?: string,
│   sets?: number,
│   reps?: number,
│   scope: 'coach' | 'user'
│ }
├─ Auth: Required (Bearer token)
├─ Response: { id, name, description, meta, ownerId, ... }
├─ Used By: exercises/create/page.tsx
└─ Status: ✅ Already existed

GET /api/exercises/my/created
├─ Purpose: Get all coach-created exercises
├─ Query Params: {
│   page: number (default: 1),
│   limit: number (default: 20),
│   search?: string
│ }
├─ Auth: Required (Bearer token)
├─ Response: {
│   data: [{id, name, description, meta, ownerId, ...}],
│   total: number,
│   page: number,
│   limit: number,
│   totalPages: number
│ }
├─ Used By: exercises/my/page.tsx
├─ Filters: ownerId === userId
└─ Status: ✅ NEW (Phase 5.2)

PUT /api/exercises/:id
├─ Purpose: Update exercise details
├─ Body: Same as POST (except scope)
├─ Auth: Required (Bearer token)
├─ Response: Updated exercise object
├─ Used By: exercises/[id]/edit/page.tsx
├─ Validation: User must be exercise owner
└─ Status: ✅ Already existed

DELETE /api/exercises/:id
├─ Purpose: Delete exercise
├─ Auth: Required (Bearer token)
├─ Response: { message: "deleted" }
├─ Used By: exercises/my/page.tsx
├─ Validation: User must be exercise owner
└─ Status: ✅ Already existed

GET /api/exercises/:id
├─ Purpose: Get single exercise by ID
├─ Auth: Required (Bearer token)
├─ Response: Exercise object with meta
├─ Used By: exercises/[id]/edit/page.tsx (load data)
└─ Status: ✅ Already existed
```

### 📊 Program Builder API Endpoints

```
GET /api/programs/builder/exercises/filter
├─ Purpose: Search exercises for builder
├─ Query Params: {
│   search?: string,
│   difficulty?: string,
│   muscleGroup?: string,
│   page?: number,
│   limit?: number
│ }
├─ Auth: Required (Bearer token)
├─ Response: { data: [{id, name, ...}], total, ... }
├─ Used By: program-builder-advanced.tsx (loadExercises)
└─ Status: ✅ Already existed

GET /api/programs/builder/:programId/details
├─ Purpose: Load complete program with structure
├─ Params: programId (program ID)
├─ Auth: Required (Bearer token)
├─ Response: {
│   id: string,
│   title: string,
│   description: string,
│   isDraft: boolean,
│   blocks: [{
│     id: string,
│     title: string,
│     weeks: [{
│       id: string,
│       weekNumber: number,
│       sessions: [{
│         id: string,
│         title: string,
│         exercises: [{id, name, ...}]
│       }]
│     }]
│   }],
│   ownerId: string,
│   coachId: string,
│   createdAt: Date,
│   updatedAt: Date
│ }
├─ Used By: program-builder-advanced.tsx (loadProgram on mount)
├─ Permission Check: coachId === userId
└─ Status: ✅ NEW (Phase 5.2)

PUT /api/programs/builder/:programId/save
├─ Purpose: Save program structure (blocks/weeks/sessions/exercises)
├─ Params: programId (program ID)
├─ Body: {
│   title: string,
│   description: string,
│   blocks: [...], // Full nested structure
│   isDraft: boolean
│ }
├─ Auth: Required (Bearer token)
├─ Response: { id, title, description, blocks, ... }
├─ Used By: program-builder-advanced.tsx (saveProgram, saveAndQuit)
├─ Permission Check: coachId === userId
├─ Behavior:
│  ├─ If new program: Creates it first
│  └─ If existing: Updates structure
└─ Status: ✅ NEW (Phase 5.2)

GET /api/programs
├─ Purpose: List user's programs
├─ Auth: Required (Bearer token)
├─ Response: { data: [{id, title, ...}], ... }
├─ Used By: programs/page.tsx (already exists)
└─ Status: ✅ Already existed
```

---

## Data Flow Diagrams

### Exercise Creation Flow
```
/exercises/create (Form)
    ↓
  Fill Form (name, description, difficulty, muscleGroups[], instructions[], sets, reps)
    ↓
  Validate on Client
    ↓
  POST /api/exercises { ...data, scope: 'coach' }
    ↓
  Backend: Create exercise with meta JSON
    ↓
  Return Exercise ID
    ↓
  Redirect to /exercises/my
    ↓
  ✅ Display in grid
```

### Exercise Edit Flow
```
/exercises/my (Grid)
    ↓
  Click Edit button
    ↓
  Navigate to /exercises/[id]/edit
    ↓
  GET /api/exercises/:id
    ↓
  Load form with data
    ↓
  User edits fields
    ↓
  PUT /api/exercises/:id { ...updated_data }
    ↓
  Backend: Update exercise
    ↓
  Redirect to /exercises/my
    ↓
  ✅ Display changes in grid
```

### Program Creation & Save Flow
```
/programs/new (No ID)
    ↓
  ProgramBuilderV2 initializes
    ↓
  User enters title, description
    ↓
  Click "Add Block" → Add Week → Add Session
    ↓
  Click "Add" on session
    ↓
  Search panel appears
    ↓
  GET /api/programs/builder/exercises/filter
    ↓
  Select exercise to add
    ↓
  Exercise added to session state
    ↓
  Click "Save" button
    ↓
  POST Create program first (if needed)
    ↓
  PUT /api/programs/builder/:id/save { title, description, blocks[] }
    ↓
  Backend: Store JSON in program.data field
    ↓
  ✅ Program saved, stay in builder
    ↓
  User can continue editing or:
    ↓
  Click "Save & Quit"
    ↓
  PUT /api/programs/builder/:id/save
    ↓
  router.push('/programs')
    ↓
  ✅ Redirect to programs list
```

### Program Edit Flow
```
/programs (List)
    ↓
  Click Edit on existing program
    ↓
  Navigate to /programs/builder/[id]
    ↓
  ProgramBuilderV2 initializes WITH initialProgramId
    ↓
  useEffect triggered
    ↓
  GET /api/programs/builder/:id/details
    ↓
  Load: title, description, blocks, weeks, sessions, exercises
    ↓
  Populate form with existing structure
    ↓
  ✅ User sees complete program
    ↓
  User can modify structure
    ↓
  Click "Save"
    ↓
  PUT /api/programs/builder/:id/save
    ↓
  Backend: Update program.data with new structure
    ↓
  ✅ Changes persisted
    ↓
  User can navigate away or Save & Quit
```

---

## Route Access Control

### Public Routes
```
/login
/signup
/forgot-password
```

### Authenticated Routes (requires JWT token)
```
/exercises/create          ← Coach only
/exercises/my              ← Coach only
/exercises/[id]/edit       ← Coach only (can only edit own)
/exercises/[id]            ← All authenticated
/programs/new              ← Coach only
/programs/builder/[id]     ← Coach only (can only edit own)
/programs                  ← All authenticated
```

### API Authentication
```
All /api endpoints require:
Header: Authorization: Bearer <JWT_TOKEN>

Backend validates:
├─ Token is valid & not expired
├─ User exists in database
├─ For protected routes: User owns resource (ownerId or coachId === userId)
└─ Returns 401 if token invalid, 403 if unauthorized
```

---

## State Management Architecture

### Component Level (React Hooks)
```
program-builder-advanced.tsx
├─ useState:
│  ├─ programId (string) - ID of program being edited
│  ├─ title (string) - Program title
│  ├─ description (string) - Program description
│  ├─ blocks (Block[]) - Nested structure
│  ├─ availableExercises (Exercise[]) - Search results
│  ├─ selectedSessionId (string) - Which session's add panel open
│  ├─ searchQuery (string) - Exercise search text
│  ├─ isSaving (boolean) - Save button disabled during request
│  └─ validationErrors (string[]) - Form validation errors
│
├─ useEffect:
│  └─ On mount: Load program if initialProgramId provided
│
└─ useCallback:
   ├─ loadProgram(pid) - Async fetch program details
   ├─ loadExercises() - Async search exercises
   ├─ addBlock() - Add new block to structure
   ├─ removeBlock(id) - Remove block
   ├─ addWeek(blockId) - Add week to block
   ├─ addSession(blockId, weekId) - Add session to week
   ├─ addExerciseToSession(...) - Add exercise
   ├─ removeExercise(...) - Remove exercise
   ├─ saveProgram() - Async save to API
   └─ saveAndQuit() - Save and redirect
```

### API State (Backend Database)
```
Exercise table
├─ id (UUID)
├─ name (string)
├─ description (text)
├─ ownerId (UUID) → User who created
├─ meta (JSON) - Contains:
│  ├─ difficulty (string)
│  ├─ muscleGroups (string[])
│  ├─ instructions (string[])
│  ├─ videoUrl (string)
│  ├─ sets (number)
│  └─ reps (number)
└─ timestamps

Program table
├─ id (UUID)
├─ title (string)
├─ description (text)
├─ coachId (UUID) → Coach who created
├─ ownerId (UUID) → User (coach or client)
├─ isDraft (boolean) - Not published to clients
├─ data (JSON) - Contains:
│  └─ blocks (Block[])
│     └─ weeks (Week[])
│        └─ sessions (Session[])
│           └─ exercises (Exercise[])
└─ timestamps
```

---

## URL Path Examples

### Exercises
```
Create:  GET  /exercises/create
My List: GET  /exercises/my?page=1&search=push
Edit:    GET  /exercises/abc-123/edit
Delete:  DELETE /exercises/abc-123 (via API)
View:    GET  /exercises/abc-123

API:     GET  /api/exercises/my/created?page=1&limit=20
         POST /api/exercises
         PUT  /api/exercises/abc-123
         DELETE /api/exercises/abc-123
```

### Programs
```
Create:  GET  /programs/new
Edit:    GET  /programs/builder/xyz-789
List:    GET  /programs
Delete:  Via /programs page

API:     GET  /api/programs/builder/xyz-789/details
         PUT  /api/programs/builder/xyz-789/save
         GET  /api/programs/builder/exercises/filter?search=push
```

---

## Summary: Complete User Journey

### Coach: Exercise Management
```
1. Login → /dashboard
2. Navigate → /exercises/create
3. Fill form → Submit
4. Redirected → /exercises/my
5. See exercise in grid
6. Click "Edit" → /exercises/[id]/edit
7. Modify fields → Save
8. Back to → /exercises/my (changes visible)
9. Click "Delete" → Confirmation → Deleted
```

### Coach: Program Building
```
1. Login → /dashboard
2. Navigate → /programs/new
3. Enter title/description
4. Add blocks/weeks/sessions
5. Search & add exercises
6. Click "Save" (program saved, stay in builder)
7. Continue editing if needed
8. Click "Save & Quit" → /programs
9. See program in list
10. Click "Edit" → /programs/builder/[id]
11. Program structure loaded
12. Make changes
13. "Save & Quit" → Back to /programs
```

---

**Version**: Phase 5.2  
**Last Updated**: 2024  
**Status**: ✅ Complete Route Map
