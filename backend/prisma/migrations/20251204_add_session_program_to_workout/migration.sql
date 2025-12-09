-- Add sessionId and programId columns to workout_sessions table
ALTER TABLE "workout_sessions" ADD COLUMN "sessionId" TEXT;
ALTER TABLE "workout_sessions" ADD COLUMN "programId" TEXT;

-- Add foreign key constraints
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes for performance
CREATE INDEX "workout_sessions_sessionId_idx" ON "workout_sessions"("sessionId");
CREATE INDEX "workout_sessions_programId_idx" ON "workout_sessions"("programId");
