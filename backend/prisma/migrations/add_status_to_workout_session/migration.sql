-- AddColumn status to WorkoutSession (non-destructive)
ALTER TABLE "workout_sessions" ADD COLUMN "status" TEXT DEFAULT 'not_started';
