import { AppDataSource } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Setup before all tests
beforeAll(async () => {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Test database connection established');
    }
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
}, 30000);

// Cleanup after all tests
afterAll(async () => {
  try {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Test database connection closed');
    }
  } catch (error) {
    console.error('❌ Failed to close test database connection:', error);
  }
}, 30000);
