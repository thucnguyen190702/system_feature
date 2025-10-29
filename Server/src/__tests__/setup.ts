import { DatabaseConfig } from '../shared/database/database.config';

/**
 * Setup test environment
 */
beforeAll(async () => {
  // Initialize database connection
  await DatabaseConfig.initialize();
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  // Close database connection
  await DatabaseConfig.close();
});
