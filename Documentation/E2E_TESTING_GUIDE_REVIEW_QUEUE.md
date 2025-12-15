# End-to-End Testing Guide - Review Queue Feature
**Feature**: Option A++ Review Queue Enhancement  
**Date**: 2024-12-15  
**Status**: ✅ Ready for Testing

---

## Prerequisites

1. **Docker containers running**:
   ```powershell
   docker-compose ps
   # Should show: postgres, backend, frontend, adminer (all Up)
   ```

2. **Test data available**:
   - At least 1 coach user
   - At least 1 student assigned to coach
   - At least 1 program with blocks/weeks/sessions
   - Program assigned to student

3. **URLs**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api (proxied through Next.js)
   - Adminer: http://localhost:8080

---

## Test Scenario 1: Student Completes Session

### Goal
Verify that when a student completes a session, the context fields (blockNumber, weekNumber, sessionNumber) are populated.

### Steps

1. **Login as Student** (via frontend or API)
   ```bash
   # Frontend: http://localhost:3000/auth/login
   # Use student credentials
   ```

2. **Complete a Session**
   ```bash
   POST /api/workouts/sessions/{sessionId}/complete
   Headers:
     Authorization: Bearer {student-token}
   Body:
     {
       "notes": "Great session! Felt strong today."
     }
   ```

3. **Verify in Database** (via Adminer: http://localhost:8080)
   ```sql
   SELECT 
     id,
     sessionId,
     studentId,
     blockNumber,
     weekNumber,
     sessionNumber,
     reviewStatus,
     updatedAt
   FROM session_progress
   ORDER BY updatedAt DESC
   LIMIT 5;
   ```

   **Expected Result**:
   - `blockNumber` should be populated (e.g., 1, 2, 3...)
   - `weekNumber` should be populated (e.g., 1, 2, 3...)
   - `sessionNumber` should be populated (e.g., 1, 2, 3...)
   - `reviewStatus` = 'pending'

---

## Test Scenario 2: Coach Views Review Queue (Base)

### Goal
Verify that coach can see completed sessions in review queue with full context.

### Steps

1. **Login as Coach**
   ```bash
   # Frontend: http://localhost:3000/auth/login
   # Use coach credentials
   ```

2. **Access Review Queue Page**
   ```
   Navigate to: http://localhost:3000/dashboard/review-queue
   ```

   **Expected UI**:
   - Sessions grouped by student
   - Each session displays: "Bloc X • Semaine Y • Séance Z - Session Title"
   - Pending sessions have orange badge
   - Search bar and status filter visible

3. **API Call** (DevTools → Network tab)
   ```bash
   GET /api/workouts/review-queue
   Headers:
     Authorization: Bearer {coach-token}
   ```

   **Expected Response**:
   ```json
   {
     "data": [
       {
         "student": {
           "id": "student-123",
           "pseudo": "Bob Dylan",
           "email": "bob@example.com"
         },
         "sessions": [
           {
             "id": "progress-456",
             "sessionTitle": "Upper Body",
             "programTitle": "Powerlifting 12 Week",
             "blockNumber": 2,
             "weekNumber": 5,
             "sessionNumber": 3,
             "completedAt": "2024-12-15T10:30:00Z",
             "reviewStatus": "pending",
             "hasVideos": false
           }
         ]
       }
     ],
     "meta": {
       "total": 1,
       "students": 1,
       "page": 1,
       "perPage": 20,
       "totalPages": 1
     }
   }
   ```

---

## Test Scenario 3: Filter by Student

### Goal
Verify that coach can filter review queue by specific student.

### Steps

1. **Apply Student Filter** (in UI)
   - Type student name in search bar
   - Should filter client-side immediately

2. **API Call with studentId**
   ```bash
   GET /api/workouts/review-queue?studentId={valid-student-id}
   Headers:
     Authorization: Bearer {coach-token}
   ```

   **Expected**: Only sessions from that student returned

3. **Security Test: Try Unauthorized Student**
   ```bash
   GET /api/workouts/review-queue?studentId={another-coach-student-id}
   Headers:
     Authorization: Bearer {coach-token}
   ```

   **Expected**: `403 Forbidden` with message:
   ```json
   {
     "statusCode": 403,
     "message": "Access denied: student not assigned to this coach"
   }
   ```

---

## Test Scenario 4: Filter by Status

### Goal
Verify that coach can filter by review status.

### Steps

1. **Filter: All Statuses**
   ```bash
   GET /api/workouts/review-queue?status=all
   ```
   Expected: Returns all sessions (pending + reviewed)

2. **Filter: Pending Only** (default)
   ```bash
   GET /api/workouts/review-queue
   # or explicitly: ?status=pending
   ```
   Expected: Only pending sessions

3. **Filter: Reviewed**
   ```bash
   GET /api/workouts/review-queue?status=reviewed
   ```
   Expected: Only reviewed sessions

4. **Invalid Status** (security test)
   ```bash
   GET /api/workouts/review-queue?status=hacked
   ```
   Expected: `400 Bad Request` (DTO validation)

---

## Test Scenario 5: Pagination

### Goal
Verify that pagination works correctly.

### Steps

1. **Default Pagination** (20/page)
   ```bash
   GET /api/workouts/review-queue
   ```
   Expected: Max 20 results, `meta.totalPages` calculated

2. **Custom Pagination**
   ```bash
   GET /api/workouts/review-queue?page=2&perPage=10
   ```
   Expected: 
   - Results 11-20
   - `meta.page = 2`
   - `meta.perPage = 10`

3. **Max Limit Test**
   ```bash
   GET /api/workouts/review-queue?perPage=999
   ```
   Expected: `400 Bad Request` (max 100 enforced by DTO)

4. **Pagination UI** (frontend)
   - Navigate to review queue with 25+ sessions
   - Should see "< Previous | Page X/Y | Next >" controls
   - Click Next → loads page 2

---

## Test Scenario 6: Date Range Filter

### Goal
Verify date filtering works.

### Steps

1. **Filter by Date Range**
   ```bash
   GET /api/workouts/review-queue?dateFrom=2024-12-01&dateTo=2024-12-31
   ```
   Expected: Only sessions updated in December 2024

2. **Invalid Date Format**
   ```bash
   GET /api/workouts/review-queue?dateFrom=invalid-date
   ```
   Expected: `400 Bad Request` (DTO validation)

---

## Test Scenario 7: Calendar Widget

### Goal
Verify dashboard calendar widget displays pending sessions by week.

### Steps

1. **Navigate to Coach Dashboard**
   ```
   http://localhost:3000/dashboard
   ```

2. **Locate Calendar Widget**
   - Should appear below KPI cards
   - Title: "Review Calendar"
   - Badge showing total pending count

3. **Verify Week Grouping**
   - Each row shows: "Semaine X"
   - Shows count: "3 sessions • 2 students"
   - Badge with pending count

4. **Click "View Full Queue"**
   - Should navigate to `/dashboard/review-queue`

---

## Test Scenario 8: Coach Reviews Session

### Goal
Complete the feedback loop.

### Steps

1. **Open Session for Review** (from review queue)
   - Click "Review" button on a pending session

2. **Review Modal Opens**
   - Should show session details
   - Planned vs Actual comparison
   - Video player (if videos uploaded)

3. **Submit Feedback**
   ```bash
   POST /api/workouts/sessions/{progressId}/review
   Headers:
     Authorization: Bearer {coach-token}
   Body:
     {
       "globalFeedback": "Great work! Keep pushing on upper body.",
       "exerciseFeedbacks": [
         {
           "exerciseId": "ex-123",
           "feedback": "Form looks solid on squats"
         }
       ]
     }
   ```

4. **Verify Status Change**
   - Session should disappear from pending queue
   - `reviewStatus` in DB should be 'reviewed'
   - `reviewedAt` and `reviewedBy` should be populated

---

## Test Scenario 9: Security - Multi-Tenancy

### Goal
Verify coach cannot access other coaches' data.

### Steps

1. **Create 2 Coaches** (coach1, coach2)
2. **Assign Students** (student1 → coach1, student2 → coach2)
3. **Student2 Completes Session**

4. **Coach1 Tries to Access Coach2's Data**
   ```bash
   # Login as coach1
   GET /api/workouts/review-queue?studentId={student2-id}
   ```

   **Expected**: `403 Forbidden` with message:
   ```json
   {
     "statusCode": 403,
     "message": "Access denied: student not assigned to this coach"
   }
   ```

5. **Verify DB Query Logs** (optional)
   - Enable Prisma query logging
   - Verify `WHERE studentId IN (...)` always filters by coach's students

---

## Test Scenario 10: Performance

### Goal
Verify indexes are used and queries are fast.

### Steps

1. **Create Test Data**
   - 20 students per coach
   - 5 completed sessions per student
   - Total: 100 sessions in review queue

2. **Measure Query Time**
   ```bash
   # In psql or Adminer:
   EXPLAIN ANALYZE
   SELECT * FROM session_progress
   WHERE "studentId" IN (
     SELECT id FROM users WHERE "coachId" = 'coach-123'
   )
   AND "reviewStatus" = 'pending'
   AND status = 'completed'
   ORDER BY "updatedAt" DESC
   LIMIT 20;
   ```

   **Expected**:
   - Index scan on `session_progress_studentId_reviewStatus_idx`
   - Query time < 50ms

3. **Frontend Load Time**
   - Navigate to review queue
   - Open DevTools → Network tab
   - `/api/workouts/review-queue` should return in < 500ms

---

## Automated Test Command

Run all backend tests including security:

```powershell
cd backend
npm test
```

Expected output:
```
Test Suites: X passed, X total
Tests:       XX passed, XX total (including 11 security tests)
```

---

## Troubleshooting

### Issue: Context fields (blockNumber, weekNumber) are null

**Cause**: Old sessions completed before migration  
**Fix**: Complete a new session after migration

### Issue: 403 Forbidden on review queue

**Cause**: JWT token expired or user not coach role  
**Fix**: Re-login and verify user has `role: 'coach'`

### Issue: Pagination not working in UI

**Cause**: Frontend state not updating  
**Fix**: Check browser console for errors, verify TanStack Query cache

### Issue: Calendar widget not showing

**Cause**: Not logged in as coach  
**Fix**: Widget only displays for `role: 'coach'` or `role: 'admin'`

---

## Success Criteria

✅ Student completes session → context fields populated  
✅ Coach sees session in review queue with "Bloc X • Semaine Y • Séance Z"  
✅ Filters work (student, status, date range, pagination)  
✅ Calendar widget shows pending sessions by week  
✅ Multi-tenancy enforced (403 on unauthorized access)  
✅ All 11 security tests pass  
✅ Performance < 500ms for review queue API  

---

## Next Steps

After successful testing:

1. **Deploy to staging** environment
2. **User acceptance testing** with real coach
3. **Monitor performance** metrics (query times, API latency)
4. **Gather feedback** on UX improvements
5. **Plan Phase 3** features (Groups, Messaging, Analytics)

---

## Related Documentation

- [PRD.md](../roadmap/PRD.md) - Product Requirements
- [SECURITY_AUDIT_REVIEW_QUEUE.md](SECURITY_AUDIT_REVIEW_QUEUE.md) - Security Audit
- [COACH_REVIEW_QUEUE_ACCESS.md](COACH_REVIEW_QUEUE_ACCESS.md) - User Guide
