-- Drop the old unique constraint on session_progress
-- This constraint was: (sessionId, studentId, exerciseInstanceId)
ALTER TABLE "session_progress" DROP CONSTRAINT "session_progress_sessionId_studentId_exerciseInstanceId_key";

-- Create new unique constraint that ensures one record per session per student
-- This allows multiple students to have one record per session
-- and one student to have one record per session (no per-exercise duplicates)
ALTER TABLE "session_progress" ADD CONSTRAINT "session_progress_sessionId_studentId_key" UNIQUE("sessionId", "studentId");
