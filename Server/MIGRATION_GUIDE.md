# Database Migration Guide

## Overview

This guide explains how to set up and run database migrations for the Friend System.

## Prerequisites

1. **PostgreSQL Installation**
   - Install PostgreSQL 14 or higher
   - Ensure PostgreSQL service is running
   - Default port: 5432

2. **Database Setup**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE friend_system_db;
   
   # Verify database
   \l
   
   # Exit
   \q
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env` if not already done
   - Update database credentials in `.env`:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=postgres
     DB_PASSWORD=your_password
     DB_NAME=friend_system_db
     ```

## Migration Files

The following migrations have been created:

### 1. CreateAccountsTable (1700000001)
Creates the `accounts` table with:
- Primary key: `account_id` (VARCHAR 36)
- Unique constraint on `username`
- Indexes on: `username`, `status`, `is_online`
- Columns: account_id, username, display_name, avatar_url, level, status, is_online, last_seen_at, created_at, updated_at

### 2. CreateFriendRequestsTable (1700000002)
Creates the `friend_requests` table with:
- Primary key: `request_id` (VARCHAR 36)
- Foreign keys to `accounts` table (from_account_id, to_account_id)
- Indexes on: `from_account_id`, `to_account_id`, `status`
- Cascade delete on account removal
- Columns: request_id, from_account_id, to_account_id, status, created_at, updated_at

### 3. CreateFriendRelationshipsTable (1700000003)
Creates the `friend_relationships` table with:
- Primary key: `relationship_id` (VARCHAR 36)
- Foreign keys to `accounts` table (account_id1, account_id2)
- Unique constraint on (account_id1, account_id2) to prevent duplicates
- Indexes on: `account_id1`, `account_id2`
- Cascade delete on account removal
- Columns: relationship_id, account_id1, account_id2, created_at

## Running Migrations

### Step 1: Install Dependencies
```bash
cd Server
npm install
```

### Step 2: Verify Database Connection
Ensure PostgreSQL is running and the database exists:
```bash
# Windows
net start postgresql-x64-14

# Or check if service is running
Get-Service postgresql*
```

### Step 3: Run Migrations
```bash
npm run migration:run
```

Expected output:
```
query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = current_schema() AND "table_name" = 'migrations'
query: CREATE TABLE "migrations" (...)
query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
Migration CreateAccountsTable1700000001 has been executed successfully.
Migration CreateFriendRequestsTable1700000002 has been executed successfully.
Migration CreateFriendRelationshipsTable1700000003 has been executed successfully.
```

### Step 4: Verify Schema
```bash
npm run schema:verify
```

This will:
- Connect to the database
- Verify all tables exist
- Check columns, indexes, foreign keys, and constraints
- Display migration history

Expected output:
```
🔍 Connecting to database...
✅ Database connection established

📋 Verifying accounts table...
✅ accounts table exists
   Columns: account_id, username, display_name, avatar_url, level, status, is_online, last_seen_at, created_at, updated_at
   Indexes: idx_accounts_username, idx_accounts_status, idx_accounts_is_online

📋 Verifying friend_requests table...
✅ friend_requests table exists
   Columns: request_id, from_account_id, to_account_id, status, created_at, updated_at
   Indexes: idx_friend_requests_from, idx_friend_requests_to, idx_friend_requests_status
   Foreign Keys: fk_friend_requests_from_account, fk_friend_requests_to_account

📋 Verifying friend_relationships table...
✅ friend_relationships table exists
   Columns: relationship_id, account_id1, account_id2, created_at
   Indexes: idx_friend_relationships_account1, idx_friend_relationships_account2
   Foreign Keys: fk_friend_relationships_account1, fk_friend_relationships_account2
   Unique Constraints: uq_friend_relationships_accounts

📋 Checking migrations...
✅ 3 migrations executed

✅ Schema verification completed successfully!
```

## Reverting Migrations

To revert the last migration:
```bash
npm run migration:revert
```

To revert all migrations (run multiple times):
```bash
npm run migration:revert
npm run migration:revert
npm run migration:revert
```

## Manual Verification (Using psql)

```bash
# Connect to database
psql -U postgres -d friend_system_db

# List all tables
\dt

# Describe accounts table
\d accounts

# Describe friend_requests table
\d friend_requests

# Describe friend_relationships table
\d friend_relationships

# View migrations
SELECT * FROM migrations;

# Exit
\q
```

## Troubleshooting

### Error: ECONNREFUSED
**Problem**: Cannot connect to PostgreSQL
**Solution**: 
- Ensure PostgreSQL service is running
- Check DB_HOST and DB_PORT in .env
- Verify firewall settings

### Error: database "friend_system_db" does not exist
**Problem**: Database not created
**Solution**:
```bash
psql -U postgres -c "CREATE DATABASE friend_system_db;"
```

### Error: password authentication failed
**Problem**: Wrong credentials
**Solution**:
- Update DB_USER and DB_PASSWORD in .env
- Verify credentials with: `psql -U postgres`

### Error: relation already exists
**Problem**: Tables already exist
**Solution**:
- Check if migrations were already run
- Use `npm run migration:revert` to rollback
- Or drop and recreate database

## Database Schema Diagram

```
┌─────────────────────────┐
│       accounts          │
├─────────────────────────┤
│ PK account_id           │
│    username (unique)    │
│    display_name         │
│    avatar_url           │
│    level                │
│    status               │
│    is_online            │
│    last_seen_at         │
│    created_at           │
│    updated_at           │
└────────┬────────────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│   friend_requests       │
├─────────────────────────┤
│ PK request_id           │
│ FK from_account_id      │
│ FK to_account_id        │
│    status               │
│    created_at           │
│    updated_at           │
└─────────────────────────┘

         │
         │ 1:N
         │
┌────────▼────────────────┐
│ friend_relationships    │
├─────────────────────────┤
│ PK relationship_id      │
│ FK account_id1          │
│ FK account_id2          │
│    created_at           │
│ UQ (account_id1,        │
│     account_id2)        │
└─────────────────────────┘
```

## Next Steps

After successfully running migrations:
1. Proceed to Task 3: Implement TypeORM Entities
2. Test database operations with the entities
3. Implement services and controllers

## References

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
