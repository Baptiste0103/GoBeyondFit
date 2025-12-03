-- Test the exact query that should be generated
SELECT * FROM exercises 
WHERE (scope = 'global' OR "ownerId" = '32608d9d-f27e-4bbf-bc82-ef2c7fe82294')
AND (meta->>'target_muscle_group' = 'Glutes' OR meta->>'targetMuscleGroup' = 'Glutes')
ORDER BY "createdAt" DESC LIMIT 5 OFFSET 0;
