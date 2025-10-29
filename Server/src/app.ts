import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import { DatabaseConfig } from './shared/database/database.config';
import { Environment } from './config/environment';
import { AuthModule } from './modules/auth/auth.module';
import { Logger } from './shared/utils/logger.util';
import { ErrorHandlerMiddleware } from './shared/middleware/error-handler.middleware';

/**
 * Main application class
 * Bootstraps the Express server and initializes all modules
 */
class Application {
  private app: Express;
  private authModule: AuthModule;

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  /**
   * Setup global middleware
   */
  private setupMiddleware(): void {
    // Parse JSON request bodies
    this.app.use(express.json());

    // Parse URL-encoded request bodies
    this.app.use(express.urlencoded({ extended: true }));

    // CORS middleware (basic configuration)
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      
      next();
    });
  }

  /**
   * Initialize database connection
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await DatabaseConfig.initialize();
      Logger.info('Database initialized successfully');
    } catch (error) {
      Logger.error('Database initialization failed', error as Error);
      throw error;
    }
  }

  /**
   * Initialize all modules
   */
  private initializeModules(): void {
    try {
      const dataSource = DatabaseConfig.getDataSource();

      // Initialize Auth Module
      this.authModule = new AuthModule(dataSource);
      this.authModule.initialize(this.app);

      Logger.info('Auth module initialized successfully');
    } catch (error) {
      Logger.error('Module initialization failed', error as Error);
      throw error;
    }
  }

  /**
   * Setup health check endpoint
   */
  private setupHealthCheck(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  /**
   * Setup global error handling middleware
   */
  private setupErrorHandling(): void {
    // 404 handler - must be after all routes
    this.app.use(ErrorHandlerMiddleware.notFound);

    // Global error handler - must be last
    this.app.use(ErrorHandlerMiddleware.handle);
  }

  /**
   * Start the server
   */
  private startServer(): void {
    const port = Environment.PORT;

    this.app.listen(port, () => {
      Logger.info('=================================');
      Logger.info(`Server running on port ${port}`);
      Logger.info(`Environment: ${Environment.NODE_ENV}`);
      Logger.info(`Health check: http://localhost:${port}/health`);
      Logger.info(`Auth API: http://localhost:${port}/api/auth`);
      Logger.info('=================================');
    });
  }

  /**
   * Bootstrap the application
   */
  async start(): Promise<void> {
    try {
      Logger.info('Starting application...');

      // Initialize database
      await this.initializeDatabase();

      // Initialize modules
      this.initializeModules();

      // Setup health check
      this.setupHealthCheck();

      // Setup error handling (must be last)
      this.setupErrorHandling();

      // Start server
      this.startServer();
    } catch (error) {
      Logger.error('Failed to start application', error as Error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    Logger.info('Shutting down gracefully...');
    try {
      await DatabaseConfig.close();
      Logger.info('Database connection closed');
      process.exit(0);
    } catch (error) {
      Logger.error('Error during shutdown', error as Error);
      process.exit(1);
    }
  }
}

// Create and start application
const app = new Application();

// Handle graceful shutdown
process.on('SIGTERM', () => app.shutdown());
process.on('SIGINT', () => app.shutdown());

// Start the application
app.start().catch((error) => {
  Logger.error('Fatal error', error);
  process.exit(1);
});
