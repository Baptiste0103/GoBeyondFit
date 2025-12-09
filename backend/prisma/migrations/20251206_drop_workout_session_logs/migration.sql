-- Drop foreign key constraints first
-- This safely removes references without deleting data

-- Drop ExerciseLog table (which references WorkoutSession)
DROP TABLE IF EXISTS "exercise_logs" CASCADE;

-- Drop WorkoutSession table
DROP TABLE IF EXISTS "workout_sessions" CASCADE;

-- Verify tables are gone
-- SELECT tablename FROM pg_tables WHERE tablename IN ('exercise_logs', 'workout_sessions');
