import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

// Extend Express Request type to include user property
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Authentication middleware to verify JWT tokens
 * Extracts token from Authorization header, verifies it, and attaches user to request
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            res.status(401).json({
                success: false,
                error: 'No authorization header provided'
            });
            return;
        }

        // Check if header follows "Bearer <token>" format
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({
                success: false,
                error: 'Invalid authorization header format. Expected: Bearer <token>'
            });
            return;
        }

        const token = parts[1];

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'No token provided'
            });
            return;
        }

        // Verify token and attach user to request
        const decoded = verifyToken(token);
        req.user = decoded;

        // Continue to next middleware/route handler
        next();
    } catch (error) {
        if (error instanceof Error) {
            res.status(401).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Authentication failed'
            });
        }
    }
}

/**
 * Optional authentication middleware
 * Attempts to verify token but doesn't fail if token is missing
 * Useful for routes that work with or without authentication
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            // No token provided, continue without user
            next();
            return;
        }

        const parts = authHeader.split(' ');
        
        if (parts.length === 2 && parts[0] === 'Bearer') {
            const token = parts[1];
            
            if (token) {
                try {
                    const decoded = verifyToken(token);
                    req.user = decoded;
                } catch (error) {
                    // Invalid token, but continue without user
                    console.warn('Invalid token in optional auth:', error);
                }
            }
        }

        next();
    } catch (error) {
        // Any error in optional auth should not block the request
        next();
    }
}
