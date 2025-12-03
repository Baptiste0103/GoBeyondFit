/*
  Warnings:

  - A unique constraint covering the columns `[groupId,userId]` on the table `group_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,toUserId,status]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "data" JSONB,
ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "data" JSONB;

-- CreateTable
CREATE TABLE "exercise_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_exercises" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "notes" TEXT,
    "restPeriodSeconds" INTEGER DEFAULT 60,
    "formGuidanceEnabled" BOOLEAN DEFAULT true,
    "exercisesCompleted" INTEGER DEFAULT 0,
    "totalExercises" INTEGER DEFAULT 0,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_logs" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" TEXT,
    "reps" INTEGER,
    "sets" INTEGER,
    "setsCompleted" INTEGER,
    "weight" DOUBLE PRECISION,
    "duration" INTEGER,
    "formRating" INTEGER,
    "skipped" BOOLEAN DEFAULT false,
    "notes" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "exercise_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exercise_history_userId_idx" ON "exercise_history"("userId");

-- CreateIndex
CREATE INDEX "exercise_history_exerciseId_idx" ON "exercise_history"("exerciseId");

-- CreateIndex
CREATE INDEX "exercise_history_viewedAt_idx" ON "exercise_history"("viewedAt");

-- CreateIndex
CREATE INDEX "favorite_exercises_userId_idx" ON "favorite_exercises"("userId");

-- CreateIndex
CREATE INDEX "favorite_exercises_exerciseId_idx" ON "favorite_exercises"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_exercises_userId_exerciseId_key" ON "favorite_exercises"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "workout_sessions_userId_idx" ON "workout_sessions"("userId");

-- CreateIndex
CREATE INDEX "workout_sessions_startedAt_idx" ON "workout_sessions"("startedAt");

-- CreateIndex
CREATE INDEX "exercise_logs_sessionId_idx" ON "exercise_logs"("sessionId");

-- CreateIndex
CREATE INDEX "exercise_logs_exerciseId_idx" ON "exercise_logs"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "group_members"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_groupId_toUserId_status_key" ON "invitations"("groupId", "toUserId", "status");

-- AddForeignKey
ALTER TABLE "exercise_history" ADD CONSTRAINT "exercise_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_history" ADD CONSTRAINT "exercise_history_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_exercises" ADD CONSTRAINT "favorite_exercises_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_exercises" ADD CONSTRAINT "favorite_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
