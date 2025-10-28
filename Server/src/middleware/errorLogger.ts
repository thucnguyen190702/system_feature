import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Error logging middleware
 * Logs all errors with stack traces and request context
 */
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction): void {
    // Log error with full stack trace
    logger.error('Error occurred', {
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack
        },
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
            ip: req.ip,
            userAgent: req.get('user-agent')
        },
        timestamp: new Date().toISOString()
    });
    
    // Pass to next error handler
    next(err);
}

/**
 * Final error handler
 * Sends error response to client
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    const statusCode = (err as any).statusCode || 500;
    const message = err.message || 'Internal server error';
    
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}
