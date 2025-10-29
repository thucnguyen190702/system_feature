import { Express, Router, json } from 'express';
import { DataSource } from 'typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthMiddleware } from './middleware/auth.middleware';

/**
 * Auth Module
 * Initializes and wires together all authentication components
 */
export class AuthModule {
  private controller: AuthController;
  private service: AuthService;
  private repository: AuthRepository;
  private router: Router;

  constructor(private dataSource: DataSource) {
    // Initialize repository with database connection
    this.repository = new AuthRepository(dataSource);

    // Initialize service with repository and utilities
    this.service = new AuthService(this.repository);

    // Initialize controller with service
    this.controller = new AuthController(this.service);

    // Create router
    this.router = Router();

    // Register routes
    this.registerRoutes();
  }

  /**
   * Register all authentication routes
   */
  private registerRoutes(): void {
    // POST /api/auth/register - Public endpoint
    this.router.post(
      '/register',
      this.controller.register.bind(this.controller)
    );

    // POST /api/auth/login - Public endpoint
    this.router.post(
      '/login',
      this.controller.login.bind(this.controller)
    );

    // GET /api/auth/validate - Protected endpoint
    this.router.get(
      '/validate',
      AuthMiddleware.authenticate,
      this.controller.validateToken.bind(this.controller)
    );
  }

  /**
   * Get the router instance to mount on Express app
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Initialize the auth module with Express app
   */
  initialize(app: Express): void {
    // Mount auth routes under /api/auth
    app.use('/api/auth', this.router);
  }
}
