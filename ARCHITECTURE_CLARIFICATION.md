# Architecture Clarification: WorkoutSession vs SessionProgress

## Overview

There are two separate concepts in the application:

### 1. **WorkoutSession** - Execution Log/Metadata
**Purpose:** Track WHEN and HOW a session was executed
**Data stored:**
- `startedAt` - When the session started
- `endedAt` - When the session ended  
- `duration` - Total time spent
- `exercisesCompleted` - Count of completed exercises
- `totalExercises` - Total exercises in session
- `status` - Current status (not_started, in_progress, completed)
- `restPeriodSeconds` - Rest period config

**When it's created:**
- Every time user clicks "Commencer" button, a new `WorkoutSession` is created
- Allows tracking multiple attempts at the same session

**Example:**
```
Seance X attempted on Dec 1:  WorkoutSession ID: aaaaa
Seance X attempted on Dec 5:  WorkoutSession ID: bbbbb  
Seance X attempted on Dec 10: WorkoutSession ID: ccccc
```

**NOTE:** `WorkoutSession` does NOT contain exercise data (reps, weights, etc.)

---

### 2. **SessionProgress** - Exercise Data & Progress
**Purpose:** Store ALL exercise data and progress for a session
**Data structure:**
```typescript
{
  sessionId: string,
  studentId: string,
  progress: {
    exercises: [{
      position: number,
      exerciseId: string,
      exerciseName: string,
      exerciseType: 'standard' | 'EMOM' | 'AMRAP' | 'circuit',
      config: { sets, reps, weight, ... },
      status: 'not_started' | 'in_progress' | 'completed' | 'skipped',
      notes: string,
      videos: string[],
      data: {
        // Data structure depends on exercise type
        // standard: { setsCompleted, repsPerSet[], repsCompleted, weightUsed, rpe, notes }
        // EMOM: { repsPerMinute[], rpe, notes }
        // AMRAP: { totalReps, rpe, notes }
        // circuit: { roundsCompleted, totalReps, weightUsed, rpe, notes }
      }
    }],
    summary: {
      totalExercises: number,
      completedExercises: number,
      inProgressExercises: number,
      skippedExercises: number
    }
  }
}
```

**When it's created:**
- When user clicks "Commencer" for the FIRST time on a session
- `@@unique([sessionId, studentId])` ensures ONE record per user per session

**When it's updated:**
- Every time user saves exercise data (auto-save or manual save)
- Contains the COMPLETE progress state

**NOTE:** `SessionProgress` is the SOURCE OF TRUTH for all exercise data

**Unique constraint:** Only ONE `SessionProgress` per (session, student) pair - ensures data consistency

---

## Key Relationship

```
WorkoutSession (Log Entry)
    ↓ links to
Session (Template)
    ↓ links to
SessionProgress (Exercise Data)
    └─ contains: all exercise data, progress, notes, videos
```

---

## Workflow

### Scenario 1: First time starting a session
1. User clicks "Commencer" on my-programs
2. Backend calls `startWorkout(sessionId)`
3. Creates NEW `WorkoutSession` record
4. Creates NEW `SessionProgress` record with empty exercises array
5. Returns `workoutId` → redirects to `/workouts/{workoutId}`
6. Frontend loads `/workouts/{workoutId}/progress` → receives `SessionProgress`
7. User fills in exercise data, clicks "Save"
8. `saveExerciseData()` updates `SessionProgress.progress.exercises[index].data`

### Scenario 2: Resuming a session (Modify)
1. User clicks "Modifier" on my-programs
2. Backend calls `getSessionStatus(sessionId)` → finds LATEST `WorkoutSession`
3. Returns existing `workoutId` → redirects to `/workouts/{workoutId}`
4. Frontend loads `/workouts/{workoutId}/progress` → receives `SessionProgress` WITH existing data
5. User sees all previous data (reps, weights, notes, videos) pre-filled
6. User modifies and clicks "Save"
7. `saveExerciseData()` updates `SessionProgress` with new data

---

## File Updates Required

### **Backend Files:**

1. **`workout-runner.service.ts`** ✅ DONE
   - `getWorkoutProgress()` - Now returns `SessionProgress` as primary source
   - `saveExerciseData()` - Already saves to `SessionProgress` 
   - `startWorkout()` - Already creates/reuses `WorkoutSession` and `SessionProgress`

2. **`workout-runner.controller.ts`** 
   - Endpoint `/workouts/{workoutId}/progress` already returns `sessionProgress`
   - No changes needed - it's calling the service correctly

### **Frontend Files:**

1. **`/workouts/[id]/page.tsx`** 
   - Hook `loadSession()` - Already loads from `sessionProgress`
   - No major changes needed - it's already working correctly
   - Just verify it displays data from `SessionProgress.progress.exercises`

2. **`api-client.ts`**
   - Method `saveProgress()` - Already sends data to correct endpoint
   - Method to get progress - Already working

---

## Summary

✅ **Backend is correctly implemented:**
- `getWorkoutProgress()` returns `SessionProgress` (source of truth)
- `saveExerciseData()` saves to `SessionProgress.progress`
- `startWorkout()` creates new `WorkoutSession` but reuses `SessionProgress`

✅ **Frontend already loads from `SessionProgress`:**
- `loadSession()` extracts exercise data from `workoutData.sessionProgress.progress.exercises`
- Initializes form with saved data

**The architecture is correct** - just needed clarification on roles!
