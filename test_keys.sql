SELECT DISTINCT jsonb_object_keys(meta) FROM exercises WHERE meta IS NOT NULL;
