import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { logger } from '../config/logger';

/**
 * Rate limiting middleware to prevent spam and abuse
 * Requirements: 5.2
 */

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Maximum requests per window
    message?: string;      // Custom error message
    keyGenerator?: (req: Request) => string;  // Custom key generator
}

/**
 * In-memory rate limit store (fallback when Redis is not available)
 */
class MemoryStore {
    private store: Map<string, { count: number; resetTime: number }> = new Map();

    async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
        const now = Date.now();
        const record = this.store.get(key);

        if (!record || now > record.resetTime) {
            // Create new record
            const newRecord = {
                count: 1,
                resetTime: now + windowMs
            };
            this.store.set(key, newRecord);
            return newRecord;
        }

        // Increment existing record
        record.count++;
        this.store.set(key, record);
        return record;
    }

    async reset(key: string): Promise<void> {
        this.store.delete(key);
    }

    // Clean up expired entries periodically
    cleanup(): void {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
            if (now > record.resetTime) {
                this.store.delete(key);
            }
        }
    }
}

const memoryStore = new MemoryStore();

// Clean up memory store every 5 minutes
setInterval(() => {
    memoryStore.cleanup();
}, 5 * 60 * 1000);

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
    const {
        windowMs,
        maxRequests,
        message = 'Too many requests, please try again later',
        keyGenerator = (req: Request) => {
            // Default: use account ID from auth or IP address
            return req.user?.accountId || req.ip || 'unknown';
        }
    } = config;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const key = `ratelimit:${keyGenerator(req)}`;
            const redis = getRedisClient();

            let count: number;
            let resetTime: number;

            if (redis) {
                // Use Redis for distributed rate limiting
                const now = Date.now();
                const windowKey = `${key}:${Math.floor(now / windowMs)}`;

                // Increment counter
                count = await redis.incr(windowKey);

                // Set expiration on first request
                if (count === 1) {
                    await redis.pexpire(windowKey, windowMs);
                }

                // Calculate reset time
                const ttl = await redis.pttl(windowKey);
                resetTime = now + (ttl > 0 ? ttl : windowMs);
            } else {
                // Fallback to memory store
                const result = await memoryStore.increment(key, windowMs);
                count = result.count;
                resetTime = result.resetTime;
            }

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', maxRequests.toString());
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count).toString());
            res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

            // Check if limit exceeded
            if (count > maxRequests) {
                logger.warn(`Rate limit exceeded for key: ${key}`);
                res.status(429).json({
                    success: false,
                    error: message,
                    retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
                });
                return;
            }

            next();
        } catch (error) {
            logger.error('Rate limiter error:', error);
            // On error, allow the request to proceed (fail open)
            next();
        }
    };
}

/**
 * Rate limiter for friend requests
 * Limit: 20 friend requests per day per account
 */
export const friendRequestRateLimiter = createRateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 20,
    message: 'You have exceeded the daily limit for friend requests. Please try again tomorrow.',
    keyGenerator: (req: Request) => {
        const accountId = req.user?.accountId || req.body?.fromAccountId || 'unknown';
        return `friend-request:${accountId}`;
    }
});

/**
 * Rate limiter for general API requests
 * Limit: 100 requests per 15 minutes per account/IP
 */
export const generalRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this account/IP, please try again later.'
});

/**
 * Rate limiter for authentication endpoints
 * Limit: 5 requests per 15 minutes per IP
 */
export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.',
    keyGenerator: (req: Request) => {
        return `auth:${req.ip || 'unknown'}`;
    }
});

/**
 * Rate limiter for search endpoints
 * Limit: 30 searches per minute per account
 */
export const searchRateLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many search requests, please slow down.'
});
