import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Logger } from '../../shared/utils/logger.util';
import { ErrorCodes } from '../../shared/constants/error-codes';

export class AuthController {
  constructor(private authService: AuthService) { }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Transform and validate request body
      const registerDto = plainToClass(RegisterDto, req.body);
      const errors = await validate(registerDto);

      if (errors.length > 0) {
        // Return 400 on validation error
        const errorMessages = errors
          .map(error => Object.values(error.constraints || {}))
          .flat();
        res.status(400).json({
          success: false,
          message: errorMessages[0] || 'Validation failed',
          code: ErrorCodes.VALIDATION_ERROR,
        });
        return;
      }

      // Call AuthService.register method
      const result = await this.authService.register(registerDto);

      // Return 409 on username conflict
      if (!result.success && result.message === 'Username already exists') {
        res.status(409).json(result);
        return;
      }

      // Return 400 on other validation errors
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Return 201 on success
      res.status(201).json(result);
    } catch (error) {
      // Handle errors and return appropriate error responses
      Logger.error('Registration error', error as Error, {
        username: req.body?.username,
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: ErrorCodes.SERVER_ERROR,
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login an existing user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Transform and validate request body
      const loginDto = plainToClass(LoginDto, req.body);
      const errors = await validate(loginDto);

      if (errors.length > 0) {
        // Return 400 on validation error
        const errorMessages = errors
          .map(error => Object.values(error.constraints || {}))
          .flat();
        res.status(400).json({
          success: false,
          message: errorMessages[0] || 'Validation failed',
          code: ErrorCodes.VALIDATION_ERROR,
        });
        return;
      }

      // Call AuthService.login method
      const result = await this.authService.login(loginDto);

      // Return 401 on invalid credentials
      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      // Return 200 on success
      res.status(200).json(result);
    } catch (error) {
      // Handle errors and return appropriate error responses
      Logger.error('Login error', error as Error, {
        username: req.body?.username,
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: ErrorCodes.SERVER_ERROR,
      });
    }
  }

  /**
   * GET /api/auth/validate
   * Validate JWT token (protected endpoint)
   * Note: Token validation is done by AuthMiddleware, this just returns user info
   */
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      // User info is already attached by AuthMiddleware
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          code: ErrorCodes.VALIDATION_ERROR,
        });
        return;
      }

      // Return 200 with user info on success
      res.status(200).json({
        success: true,
        userId: user.userId,
        username: user.username,
      });
    } catch (error) {
      // Return 401 on error
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Token validation failed',
        code: ErrorCodes.TOKEN_EXPIRED,
      });
    }
  }
}
