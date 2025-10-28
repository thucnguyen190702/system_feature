-- Initialize Friend System Database
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create database if not exists (handled by POSTGRES_DB env var)
-- CREATE DATABASE friend_system;

-- Connect to the database
\c friend_system;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE friend_system TO postgres;

-- Create schema version table for tracking migrations
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Log initialization
INSERT INTO schema_version (version, description) 
VALUES (0, 'Database initialized') 
ON CONFLICT (version) DO NOTHING;
