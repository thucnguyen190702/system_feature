import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Redis client configuration
 * Optional caching layer for improved performance
 * Requirements: 6.3
 */

let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 * Returns null if Redis is not configured or connection fails
 */
export const initializeRedis = (): Redis | null => {
    try {
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

        redisClient = new Redis({
            host: redisHost,
            port: redisPort,
            retryStrategy: (times) => {
                // Retry connection up to 3 times
                if (times > 3) {
                    console.warn('Redis connection failed after 3 attempts. Running without cache.');
                    return null;
                }
                // Exponential backoff: 50ms, 100ms, 200ms
                return Math.min(times * 50, 2000);
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true
        });

        // Handle connection events
        redisClient.on('connect', () => {
            console.log('Redis client connected');
        });

        redisClient.on('ready', () => {
            console.log('Redis client ready');
        });

        redisClient.on('error', (err) => {
            console.error('Redis client error:', err.message);
        });

        redisClient.on('close', () => {
            console.log('Redis client connection closed');
        });

        // Attempt to connect
        redisClient.connect().catch((err) => {
            console.warn('Redis connection failed:', err.message);
            console.warn('Running without Redis cache');
            redisClient = null;
        });

        return redisClient;
    } catch (error) {
        console.warn('Failed to initialize Redis:', error);
        console.warn('Running without Redis cache');
        return null;
    }
};

/**
 * Get Redis client instance
 * Returns null if Redis is not available
 */
export const getRedisClient = (): Redis | null => {
    return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = (): boolean => {
    return redisClient !== null && redisClient.status === 'ready';
};
