-- This script initializes the databases for GoBeyondFit
-- It's executed when the PostgreSQL container starts

-- The gobeyondfit_db database is already created by POSTGRES_DB environment variable
-- We just need to create the gobeyondfit database for the default connection

-- Create gobeyondfit database (for default connection with username)
-- This prevents errors when connecting as user gobeyondfit without specifying a database
CREATE DATABASE gobeyondfit OWNER gobeyondfit;

-- Set search_path for both databases
ALTER DATABASE gobeyondfit_db SET search_path TO public;
ALTER DATABASE gobeyondfit SET search_path TO public;

