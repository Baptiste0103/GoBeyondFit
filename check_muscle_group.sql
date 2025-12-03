SELECT 
  COUNT(*) as total_exercises,
  COUNT(CASE WHEN meta->>'target_muscle_group' IS NOT NULL THEN 1 END) as with_muscle_group,
  COUNT(CASE WHEN meta->>'target_muscle_group' IS NULL THEN 1 END) as without_muscle_group
FROM exercises;
