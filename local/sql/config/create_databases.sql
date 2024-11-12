-- Creation of backend database
CREATE DATABASE backend;

-- Creation of backend User
CREATE USER backend WITH ENCRYPTED PASSWORD 'secret';

-- Grant schema privileges first
\c backend postgres;
CREATE SCHEMA IF NOT EXISTS public;
ALTER SCHEMA public OWNER TO backend;

-- Grant database privileges
GRANT ALL PRIVILEGES ON DATABASE backend TO backend;
GRANT ALL PRIVILEGES ON SCHEMA public TO backend;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO backend;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO backend;
