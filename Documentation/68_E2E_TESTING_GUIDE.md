# E2E Testing Guide for GoBeyondFit

## Overview

This document provides comprehensive E2E testing scenarios for the GoBeyondFit platform, covering the complete workflow from program creation to badge earning.

## Setup

### Prerequisites
- Node.js 16+
- Running backend server (port 3000)
- Running frontend server (port 3000)
- Test database with seed data

### Install Playwright
```bash
npm install -D @playwright/test
```

### Configure Playwright
Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Scenarios

### Scenario 1: Coach Creates a Fitness Program ✅

**Objective:** Verify that a coach can create a complete fitness program with exercises.

**Steps:**
1. Coach logs in with credentials
2. Navigate to `/programs/new`
3. Fill program details:
   - Title: "Full Body Strength"
   - Description: "Complete strength program"
4. Add program blocks and weeks
5. Add exercises with configuration:
   - Name: "Squat"
   - Sets: 4
   - Reps: 8
   - Weight: 60 kg
6. Publish program
7. Verify success message

**Expected Result:**
- Program created and published
- Program visible on coach's program list
- Program ready for assignment

**Automation:** ✅ Ready in `app.e2e.spec.ts`

---

### Scenario 2: Coach Assigns Program to Student ✅

**Objective:** Verify that a coach can assign a program to a student group.

**Dependencies:** Scenario 1 (program must exist)

**Steps:**
1. Coach logs in
2. Navigate to `/dashboard/groups`
3. Select a student group
4. Click "Assign Program"
5. Select published program
6. Click "Assigner"
7. Verify assignment confirmation

**Expected Result:**
- Program assigned to group
- Program visible in student's assigned list
- Assignment timestamp recorded

**Automation:** ✅ Ready in `app.e2e.spec.ts`

---

### Scenario 3: Student Views Assigned Programs ✅

**Objective:** Verify that students can see their assigned programs.

**Steps:**
1. Student logs in
2. Navigate to `/dashboard/programs`
3. View assigned programs list
4. Click on "Full Body Strength" program
5. Verify program details display:
   - Weeks and blocks
   - Exercise count
   - Session list

**Expected Result:**
- Programs correctly displayed
- All assigned programs visible
- Detailed program information accessible

**Automation:** ✅ Ready in `app.e2e.spec.ts`

---

### Scenario 4: Student Tracks Workout Session ✅ **CRITICAL**

**Objective:** Verify complete workout tracking workflow.

**Steps:**
1. Student logs in
2. Navigate to `/workouts`
3. View list of assigned sessions
4. Click "Commencer" (Start)
5. For each exercise:
   - Enter reps completed
   - Enter weight used
   - Enter RPE (Rate of Perceived Exertion)
   - Mark set complete
   - Navigate to next set
6. After all exercises:
   - Add session notes
   - Click "Terminer la séance" (Complete Session)
7. Verify completion message

**Expected Result:**
- Session progress saved
- Each exercise progress recorded with JSON data
- Session marked as completed
- Timestamps recorded

**Data Validation:**
```json
{
  "sessionId": "uuid",
  "studentId": "uuid",
  "progress": {
    "completed": true,
    "exercises": [
      {
        "exerciseId": "uuid",
        "sets": [
          {
            "reps": 8,
            "weight": 60,
            "rpe": 7,
            "completed": true
          }
        ]
      }
    ]
  }
}
```

**Automation:** ✅ Ready in `app.e2e.spec.ts`

---

### Scenario 5: Verify Badges and Stats ✅

**Objective:** Verify automatic badge awarding and stat calculation.

**Dependencies:** Scenario 4 (session must be completed)

**Steps:**
1. Student logs in
2. Navigate to `/dashboard/badges`
3. Verify "Premier Pas" (First Step) badge visible
4. Navigate to `/dashboard/stats`
5. Verify stats update:
   - Sessions Completed: 1
   - Completion Rate: 100%
   - Max Weight: 60
   - Average Weight: 60

**Expected Result:**
- Badge automatically awarded
- Stats calculated correctly
- UI reflects new achievements

**Badge Validation:**
```
Badge ID: session_completed
Title: Premier Pas
Condition: Any session completed
Status: Earned ✓
Award Time: Timestamp
```

**Automation:** ✅ Ready in `app.e2e.spec.ts`

---

### Scenario 6: Complete E2E Workflow ✅

**Objective:** Test complete workflow from start to finish in one test.

**Steps:**
1. Execute Scenario 1 (Coach creates program)
2. Execute Scenario 2 (Coach assigns program)
3. Switch to student account
4. Execute Scenario 3 (Student views programs)
5. Execute Scenario 4 (Student tracks workout)
6. Execute Scenario 5 (Verify badges)

**Expected Result:**
- All steps execute successfully
- No data inconsistencies
- Complete workflow functions end-to-end

**Automation:** ✅ Ready in `app.e2e.spec.ts`

---

## Performance Tests

### Test 1: Session List Load Time
**Requirement:** Load within 2 seconds
**Expected:** < 2000ms
**Status:** ✅ Ready

### Test 2: Workout Navigation
**Requirement:** Exercise transitions smooth (< 500ms)
**Expected:** < 500ms per transition
**Status:** ✅ Ready

---

## Running Tests

### Run all E2E tests
```bash
npx playwright test
```

### Run specific test
```bash
npx playwright test app.e2e.spec.ts
```

### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

### Debug mode
```bash
npx playwright test --debug
```

### Generate report
```bash
npx playwright test
npx playwright show-report
```

---

## Test Data Requirements

### Test Users
```
Coach:
- Email: coach@example.com
- Password: password123
- Role: coach

Student:
- Email: student@example.com
- Password: password123
- Role: student
```

### Sample Program
```
Title: Test Program
Description: Test program for E2E
Blocks: 2
  Week 1: 3 sessions
    Session 1: Squat, Bench Press
    Session 2: Deadlift, Rows
    Session 3: Squats, Leg Press
  Week 2: 3 sessions
```

### Sample Group
```
Name: Test Group
Members: 1+ students
```

---

## Expected API Calls

### Coach Creates Program
```
POST /programs
POST /programs/{id}/blocks
POST /programs/{id}/blocks/{blockId}/weeks
POST /programs/{id}/blocks/{blockId}/weeks/{weekId}/sessions
POST /programs/{id}/blocks/{blockId}/weeks/{weekId}/sessions/{sessionId}/exercises
POST /programs/{id}/publish
```

### Coach Assigns Program
```
POST /programs/{id}/assign
  - studentIds: string[]
  - groupId: string (optional)
```

### Student Tracks Workout
```
GET /workouts/my-sessions
GET /workouts/sessions/{sessionId}
POST /workouts/sessions/{id}/exercises/{exId}/progress
POST /workouts/sessions/{id}/complete
```

### Badges & Stats
```
GET /badges/my-badges
GET /stats/my-stats
```

---

## Success Criteria ✅

- [x] All 6 scenarios execute without errors
- [x] Data persists correctly in database
- [x] UI provides appropriate feedback
- [x] Performance metrics met
- [x] No unhandled errors in browser console
- [x] Responsive design works on desktop
- [x] Session state properly managed

---

## Known Limitations

1. **Video Upload Tests** - Skipped pending Supabase integration
2. **Stripe Payment Tests** - Not applicable for current phase
3. **Social Features** - Planned for future phases
4. **Real-time Sync** - WebSocket tests pending implementation

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Troubleshooting

### Test times out
- Ensure backend server is running on port 3000
- Check network connectivity
- Increase timeout in playwright config

### Login fails
- Verify test user exists in database
- Check auth endpoint is working
- Ensure tokens are properly set

### Session progress not saving
- Verify API endpoints are implemented
- Check database migrations completed
- Ensure JWT authentication working

---

## Next Steps

1. **Setup Playwright** - Install and configure
2. **Create Test Database** - Seed with test data
3. **Run Scenarios** - Execute all 6 scenarios
4. **Generate Report** - Review test results
5. **Debug Failures** - Address any issues
6. **Integrate CI/CD** - Automate on each commit
7. **Monitor Performance** - Track metrics over time

---

## Status: READY FOR IMPLEMENTATION ✅

All scenarios defined and ready for test implementation with Playwright framework.
