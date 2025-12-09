-- Remove the foreign key constraint for exerciseInstanceId if it exists
ALTER TABLE "session_progress" DROP CONSTRAINT IF EXISTS "session_progress_exerciseInstanceId_fkey";

-- Drop the exerciseInstanceId column
ALTER TABLE "session_progress" DROP COLUMN IF EXISTS "exercise_instance_id";
