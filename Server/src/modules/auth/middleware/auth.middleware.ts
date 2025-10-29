import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../../../shared/utils/jwt.util';

/**
 * Authentication middleware for protecting routes
 * Validates JWT tokens and attaches user info to request
 */
export class AuthMiddleware {
  /**
   * Middleware function to authenticate requests using JWT
   * Extracts token from Authorization header, verifies it, and attaches user info to request
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: 'Authorization header missing'
        });
        return;
      }

      // Check if header follows Bearer format
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({
          success: false,
          message: 'Invalid authorization header format. Expected: Bearer <token>'
        });
        return;
      }

      const token = parts[1];

      // Verify token using JwtUtil
      const payload = JwtUtil.verifyToken(token);

      // Attach user info to request object
      req.user = {
        userId: payload.userId,
        username: payload.username
      };

      // Continue to next middleware/handler
      next();
    } catch (error) {
      // Handle token verification errors
      const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
      
      res.status(401).json({
        success: false,
        message: errorMessage
      });
    }
  }
}
