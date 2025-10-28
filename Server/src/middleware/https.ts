import { Request, Response, NextFunction } from 'express';

/**
 * HTTPS enforcement middleware
 * Ensures all API calls use HTTPS in production
 * Requirements: 5.1, 5.4
 */
export function enforceHttps(req: Request, res: Response, next: NextFunction): void {
    // Skip in development or if already using HTTPS
    if (process.env.NODE_ENV !== 'production') {
        next();
        return;
    }

    // Check if request is secure
    const isSecure = req.secure || 
                     req.headers['x-forwarded-proto'] === 'https' ||
                     req.protocol === 'https';

    if (!isSecure) {
        res.status(403).json({
            success: false,
            error: 'HTTPS is required for all API calls'
        });
        return;
    }

    next();
}

/**
 * Security headers middleware
 * Adds security-related headers to all responses
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict transport security (HTTPS only)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Content security policy
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    next();
}
