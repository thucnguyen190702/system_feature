# Integration Tests - Friend System

## Overview

This directory contains integration tests for the Friend System server. The tests verify the core functionality of account management, friend requests, friend list operations, online status, and search features.

## Prerequisites

Before running the tests, ensure you have:

1. **PostgreSQL Database Running**
   - The database server must be running on `localhost:5432` (or as configured in `.env`)
   - Database name: `friend_system_db` (or as configured in `.env`)
   - User credentials must match those in `.env` file

2. **Database Schema**
   - Run migrations to create the required tables:
     ```bash
     npm run migration:run
     ```

3. **Environment Variables**
   - Ensure `.env` file is properly configured with database credentials

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- account.test.ts
```

## Test Structure

### Test Files

1. **account.test.ts** - Account Creation Flow (Task 22.1)
   - Tests account creation with unique ID and username
   - Tests duplicate username error handling
   - Requirements: 1.1, 1.2

2. **friend-request.test.ts** - Friend Request Flow (Task 22.2)
   - Tests sending friend requests
   - Tests accepting friend requests
   - Tests rejecting friend requests
   - Tests duplicate request prevention
   - Requirements: 2.4, 2.5

3. **friend-list.test.ts** - Friend List Operations (Task 22.3)
   - Tests getting friend list
   - Tests removing friends
   - Tests bidirectional relationships
   - Requirements: 3.1, 3.2, 3.3, 3.4

4. **online-status.test.ts** - Online Status (Task 22.4)
   - Tests updating online status
   - Tests getting friends online status
   - Tests lastSeenAt timestamp updates
   - Requirements: 3.1, 3.3

5. **search.test.ts** - Search Functionality (Task 22.5)
   - Tests search by username (exact and partial matches)
   - Tests search by ID
   - Tests case-insensitive search
   - Requirements: 2.1, 2.2

### Test Setup

- **setup.ts**: Initializes database connection before all tests and closes it after all tests complete
- Each test file has `afterEach` hooks to clean up test data
- Tests use the prefix `test_` for usernames to facilitate cleanup

## Test Data Cleanup

All tests automatically clean up their test data after execution:
- Test accounts are deleted using the pattern `test_%`
- Friend relationships and requests are cascaded deleted via foreign keys

## Troubleshooting

### Database Connection Errors

If you see "Driver not Connected" errors:
1. Verify PostgreSQL is running: `pg_isready`
2. Check database credentials in `.env`
3. Ensure database exists: `psql -U postgres -l`
4. Run migrations: `npm run migration:run`

### Test Timeouts

If tests timeout:
1. Increase Jest timeout in `jest.config.js`
2. Check database performance
3. Ensure no long-running queries

### Port Conflicts

If port 5432 is in use:
1. Update `DB_PORT` in `.env`
2. Restart PostgreSQL on a different port

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: All test data is cleaned up after each test
3. **Unique Data**: Tests use timestamps to generate unique usernames
4. **Real Database**: Tests run against a real PostgreSQL database (not mocked)
5. **Sequential Execution**: Tests run with `--runInBand` to avoid race conditions

## Coverage

To view test coverage:
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## CI/CD Integration

For CI/CD pipelines:
1. Ensure PostgreSQL service is available
2. Run migrations before tests
3. Use environment variables for database configuration
4. Run tests with `--runInBand` flag for consistency
