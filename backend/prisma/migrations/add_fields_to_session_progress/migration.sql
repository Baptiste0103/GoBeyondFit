-- AlterTable add new fields to SessionProgress
ALTER TABLE "session_progress" ADD COLUMN "reps" INTEGER,
ADD COLUMN "sets" INTEGER,
ADD COLUMN "weight" DOUBLE PRECISION,
ADD COLUMN "format" TEXT,
ADD COLUMN "status" TEXT DEFAULT 'not_started',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Delete duplicate SessionProgress records keeping only the most recent one per (sessionId, studentId, exerciseInstanceId)
DELETE FROM "session_progress" sp1
WHERE EXISTS (
  SELECT 1 FROM "session_progress" sp2
  WHERE sp1."sessionId" = sp2."sessionId"
    AND sp1."studentId" = sp2."studentId"
    AND COALESCE(sp1."exerciseInstanceId", '') = COALESCE(sp2."exerciseInstanceId", '')
    AND sp1."id" < sp2."id"
);

-- Add unique constraint
ALTER TABLE "session_progress" ADD CONSTRAINT "session_progress_sessionId_studentId_exerciseInstanceId_key" UNIQUE("sessionId", "studentId", "exerciseInstanceId");
