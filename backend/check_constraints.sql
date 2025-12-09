SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'invitations' AND constraint_type = 'UNIQUE';
