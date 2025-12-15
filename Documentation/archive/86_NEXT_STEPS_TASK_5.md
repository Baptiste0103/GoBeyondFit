# What To Do Next - Continuation Guide

**Current Progress**: 4/7 core tasks complete (57%)  
**Last Session**: December 3, 2025  
**Status**: Backend production-ready, Frontend components ready for integration

---

## 🎯 Next Priority: Task 5 - Workout Session Form Component

This is the critical UI component that ties everything together. Students will use this to log their exercise performance with video evidence.

### What to Build

Create `frontend/components/workout-session-form.tsx` with:

1. **Exercise Type Selector**
   - Radio buttons or dropdown: Standard | EMOM | AMRAP | Circuit
   - Displays based on coach-configured type
   - Read-only (coach sets the type)

2. **Dynamic Form Fields Based on Type**

   **Standard Exercise**
   - Sets completed (number input)
   - Reps per set (number input)  
   - Weight used (optional number input)
   - Weight unit (dropdown: lbs/kg)
   - RPE scale (1-10 slider)
   - Notes (textarea)

   **EMOM Exercise**
   - Array of reps for each minute
   - Dynamic inputs for N minutes
   - RPE scale (1-10 slider)
   - Notes (textarea)

   **AMRAP Exercise**
   - Total reps completed (number input)
   - RPE scale (1-10 slider)
   - Notes (textarea)

   **Circuit Exercise**
   - Rounds completed (number input)
   - Total reps (number input)
   - Weight used (optional number input)
   - RPE scale (1-10 slider)
   - Notes (textarea)

3. **Video Upload Integration**
   - Include VideoUploader component
   - Show captured video info
   - Display upload success/error

4. **Form Validation**
   - All required fields filled
   - Numeric fields positive
   - Video uploaded (optional but encouraged)
   - Form submission loading state

5. **Submission**
   - POST to `/api/workouts/:workoutId/exercise/:exerciseIndex/complete`
   - Include all progress data
   - Include video mediaId if available
   - Handle success/error responses

### Implementation Steps

```bash
# 1. Create component file
touch frontend/components/workout-session-form.tsx

# 2. Install dependencies (if not already)
cd frontend
npm install react-hook-form zod @hookform/resolvers

# 3. Build form with type-safe schema validation
# Use zod with discriminated unions for exercise types

# 4. Import and test components
```

### Example Structure

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { VideoUploader } from './video-uploader'

// Create discriminated union schema
const ExerciseProgressSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('standard'),
    setsCompleted: z.number().positive(),
    repsCompleted: z.number().positive(),
    // ... other fields
  }),
  z.object({
    type: z.literal('EMOM'),
    repsPerMinute: z.array(z.number().positive()),
    // ... other fields
  }),
  // ... other types
])

type ExerciseProgress = z.infer<typeof ExerciseProgressSchema>

export function WorkoutSessionForm({ 
  workoutId, 
  exerciseIndex, 
  config // From coach config
}) {
  const form = useForm<ExerciseProgress>({
    resolver: zodResolver(ExerciseProgressSchema),
    defaultValues: { type: config.type }
  })

  // Form JSX with dynamic fields based on type
  // Include VideoUploader
  // Submit handler to backend API
}
```

---

## 📋 Detailed Checklist for Task 5

- [ ] Create `workout-session-form.tsx`
- [ ] Import all necessary UI components (Button, Input, Select, etc.)
- [ ] Import VideoUploader component
- [ ] Create Zod schema with discriminated union for all types
- [ ] Set up useForm with type-safe schema validation
- [ ] Build conditional rendering for exercise type
  - [ ] Standard form fields
  - [ ] EMOM form fields with dynamic array
  - [ ] AMRAP form fields
  - [ ] Circuit form fields
- [ ] Add RPE scale (1-10) to all types
- [ ] Integrate VideoUploader in form
- [ ] Add error display
- [ ] Add loading state during submission
- [ ] Implement form submission to backend
- [ ] Add success/error toasts or alerts
- [ ] Test with mock data for each exercise type
- [ ] Handle async operations (video upload, form submit)
- [ ] Add responsive design for mobile
- [ ] Document component props and usage

---

## ✅ Subsequent Tasks (After Task 5)

### Task 6: Dashboard Current Session Widget
Create `frontend/components/current-session-widget.tsx`

```tsx
export function CurrentSessionWidget() {
  // Fetch from GET /api/workouts/current
  // Show:
  // - Exercise count (X of Y completed)
  // - Progress percentage
  // - Time elapsed
  // - Quick-resume button
  // - Quick-start button if no session
}
```

**Estimated**: 2-3 hours

### Task 7: End-to-End Testing
- Test video recording (all durations)
- Test video upload (success/error)
- Test backend compression
- Test all exercise types
- Test database storage
- Test authorization
- Performance testing

**Estimated**: 6-8 hours

---

## 🔗 Integration Points

### Database Queries You'll Need

```sql
-- Get workout with exercise config
SELECT * FROM session WHERE id = $1;

-- Get user's current session
SELECT * FROM workout_session 
WHERE userId = $1 AND endedAt IS NULL
ORDER BY startedAt DESC LIMIT 1;

-- Save exercise progress
INSERT INTO exercise_log (...) VALUES (...);

-- Get compressed video
SELECT * FROM exercise_media WHERE id = $1;
```

### API Endpoints Used

```
GET    /api/workouts/:workoutId/progress          - Get current progress
POST   /api/workouts/:workoutId/exercise/:index/complete  - Log exercise
POST   /api/storage/progress/:progressId/video    - Upload video
GET    /api/workouts/current                       - Get active session
```

---

## 💾 Data Flow

```
User Interface (WorkoutSessionForm)
  ↓
Validate Input (Zod schema)
  ↓
Optional: Upload Video
  ├→ POST /api/storage/progress/:progressId/video
  └→ Get mediaId back
  ↓
Submit Exercise Progress
  ├→ Include all form data
  ├→ Include videoMediaId (if uploaded)
  └→ POST /api/workouts/:workoutId/exercise/:index/complete
  ↓
Backend Processing
  ├→ Validate student ownership
  ├→ Validate exercise config
  ├→ Save to exercise_log table
  └→ Update workout progress
  ↓
Database Storage
  ├→ exercise_log row added
  ├→ exercise_media row (if video)
  └→ workout_session updated
  ↓
User Feedback
  ├→ Success toast
  └→ Update UI progress
```

---

## 🚀 Code Template to Start

```tsx
'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { VideoUploader } from './video-uploader'
import { API_BASE_URL } from '@/lib/config'

// Zod schemas for each exercise type
const StandardSchema = z.object({
  type: z.literal('standard'),
  setsCompleted: z.number().min(1),
  repsCompleted: z.number().min(1),
  weightUsed: z.number().optional(),
  rpe: z.number().min(1).max(10),
  notes: z.string().optional(),
})

const EMOMSchema = z.object({
  type: z.literal('EMOM'),
  repsPerMinute: z.array(z.number().min(0)),
  rpe: z.number().min(1).max(10),
  notes: z.string().optional(),
})

// ... other schemas

const ExerciseProgressSchema = z.discriminatedUnion('type', [
  StandardSchema,
  EMOMSchema,
  // Add other types
])

type ExerciseProgress = z.infer<typeof ExerciseProgressSchema>

export function WorkoutSessionForm({ workoutId, exerciseIndex, config }) {
  const form = useForm<ExerciseProgress>({
    resolver: zodResolver(ExerciseProgressSchema),
    defaultValues: { type: config.type },
  })

  const [videoMediaId, setVideoMediaId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: ExerciseProgress) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/workouts/${workoutId}/exercise/${exerciseIndex}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            ...data,
            videoMediaId: videoMediaId,
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to save')

      // Show success and move to next exercise
      const result = await response.json()
      console.log('Progress saved:', result)
      // Trigger parent component to move to next exercise
    } catch (error) {
      console.error('Submission error:', error)
      // Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Render form fields based on type */}
        {form.watch('type') === 'standard' && (
          <>
            {/* Standard form fields */}
          </>
        )}

        {/* Video uploader */}
        <VideoUploader
          progressId={workoutId}
          onUploadSuccess={(mediaId) => setVideoMediaId(mediaId)}
        />

        {/* Submit button */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Exercise'}
        </Button>
      </form>
    </div>
  )
}
```

---

## 📞 Questions & Help

If stuck:
1. Check WORKOUT_RUNNER_QUICK_START.md for API reference
2. Check workout-config.dto.ts for exercise type structure
3. Check workout-progress.dto.ts for progress structure
4. Refer to existing components (e.g., program-builder-advanced.tsx) for patterns

---

## ⏱️ Estimated Time

- Task 5 (Form Component): **4-6 hours**
- Task 6 (Dashboard Widget): **2-3 hours**
- Task 7 (E2E Testing): **6-8 hours**

**Total**: ~12-17 hours to complete all remaining tasks

---

## 🎯 Success Criteria for Task 5

✅ Form renders with all fields for selected exercise type  
✅ Form validation works (Zod schema enforced)  
✅ Video upload integrated and working  
✅ Form submission sends correct data to backend  
✅ Success/error feedback to user  
✅ Loading state during submission  
✅ Component type-safe with TypeScript  
✅ Responsive on mobile  
✅ All 4 exercise types testable  

---

## 🚀 Ready to Start?

1. Create the file: `frontend/components/workout-session-form.tsx`
2. Copy the template above
3. Build out the form fields for Standard type first
4. Test the submission
5. Add other exercise types
6. Iterate and refine

**Happy coding!** 🎉
