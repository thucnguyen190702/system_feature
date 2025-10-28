# Database Migrations

This directory contains TypeORM migration files for the Friend System database schema.

## Migration Files

### 1700000001-CreateAccountsTable.ts
Creates the `accounts` table with all necessary columns and indexes.

**Tables Created:**
- `accounts`

**Indexes:**
- `idx_accounts_username` - Fast username lookups
- `idx_accounts_status` - Filter by account status
- `idx_accounts_is_online` - Query online users

**Requirements Addressed:** 1.1, 1.2

---

### 1700000002-CreateFriendRequestsTable.ts
Creates the `friend_requests` table with foreign key relationships to accounts.

**Tables Created:**
- `friend_requests`

**Foreign Keys:**
- `fk_friend_requests_from_account` - References accounts(account_id)
- `fk_friend_requests_to_account` - References accounts(account_id)

**Indexes:**
- `idx_friend_requests_from` - Query requests sent by user
- `idx_friend_requests_to` - Query requests received by user
- `idx_friend_requests_status` - Filter by request status

**Requirements Addressed:** 2.4

---

### 1700000003-CreateFriendRelationshipsTable.ts
Creates the `friend_relationships` table with bidirectional friendship support.

**Tables Created:**
- `friend_relationships`

**Foreign Keys:**
- `fk_friend_relationships_account1` - References accounts(account_id)
- `fk_friend_relationships_account2` - References accounts(account_id)

**Unique Constraints:**
- `uq_friend_relationships_accounts` - Prevents duplicate friendships

**Indexes:**
- `idx_friend_relationships_account1` - Query friends of user
- `idx_friend_relationships_account2` - Query friends of user (reverse)

**Requirements Addressed:** 3.1, 3.4

---

## Running Migrations

### Apply All Pending Migrations
```bash
npm run migration:run
```

### Revert Last Migration
```bash
npm run migration:revert
```

### Verify Schema
```bash
npm run schema:verify
```

## Migration Naming Convention

Migrations follow the pattern: `{timestamp}-{DescriptiveName}.ts`

Example: `1700000001-CreateAccountsTable.ts`

## Creating New Migrations

To generate a new migration based on entity changes:
```bash
npm run migration:generate -- src/migrations/MigrationName
```

To create an empty migration:
```bash
npm run typeorm -- migration:create src/migrations/MigrationName
```

## Best Practices

1. **Never modify existing migrations** that have been run in production
2. **Always test migrations** in development before deploying
3. **Create rollback logic** in the `down()` method
4. **Use transactions** for complex migrations
5. **Add indexes** for frequently queried columns
6. **Document breaking changes** in migration comments

## Troubleshooting

If migrations fail:
1. Check database connection in `.env`
2. Verify PostgreSQL is running
3. Check migration order (timestamps)
4. Review error logs
5. Use `npm run migration:revert` to rollback

For detailed troubleshooting, see [MIGRATION_GUIDE.md](../../MIGRATION_GUIDE.md)
