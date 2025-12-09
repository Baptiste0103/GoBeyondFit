-- Add circuit to ExerciseType enum
ALTER TYPE "ExerciseType" ADD VALUE 'circuit' BEFORE 'custom';

-- Create ExerciseMedia table
CREATE TABLE "exercise_media" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_media_pkey" PRIMARY KEY ("id")
);

-- Add foreign key
ALTER TABLE "exercise_media" ADD CONSTRAINT "exercise_media_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "session_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index for faster lookups
CREATE INDEX "exercise_media_progressId_idx" ON "exercise_media"("progressId");
