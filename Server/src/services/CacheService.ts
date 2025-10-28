import { getRedisClient, isRedisAvailable } from '../config/redis';
import { InGameAccount } from '../entities/InGameAccount';

/**
 * Cache Service for friend list caching
 * Cache friend list for 5 minutes
 * Invalidate cache on friend add/remove
 * Requirements: 6.1, 6.3
 */
export class CacheService {
    private readonly FRIEND_LIST_PREFIX = 'friends:';
    private readonly CACHE_TTL = 300; // 5 minutes in seconds

    /**
     * Get cached friend list for an account
     * Returns null if cache miss or Redis unavailable
     */
    async getCachedFriendList(accountId: string): Promise<InGameAccount[] | null> {
        if (!isRedisAvailable()) {
            return null;
        }

        try {
            const redis = getRedisClient();
            if (!redis) {
                return null;
            }

            const cacheKey = this.FRIEND_LIST_PREFIX + accountId;
            const cached = await redis.get(cacheKey);

            if (!cached) {
                return null;
            }

            // Parse and return cached friend list
            const friendList: InGameAccount[] = JSON.parse(cached);
            return friendList;
        } catch (error) {
            console.error('Error getting cached friend list:', error);
            return null;
        }
    }

    /**
     * Cache friend list for an account
     * Sets TTL to 5 minutes
     */
    async cacheFriendList(accountId: string, friends: InGameAccount[]): Promise<void> {
        if (!isRedisAvailable()) {
            return;
        }

        try {
            const redis = getRedisClient();
            if (!redis) {
                return;
            }

            const cacheKey = this.FRIEND_LIST_PREFIX + accountId;
            const serialized = JSON.stringify(friends);

            // Set cache with 5 minute TTL
            await redis.setex(cacheKey, this.CACHE_TTL, serialized);
        } catch (error) {
            console.error('Error caching friend list:', error);
        }
    }

    /**
     * Invalidate friend list cache for an account
     * Called when friend is added or removed
     */
    async invalidateFriendListCache(accountId: string): Promise<void> {
        if (!isRedisAvailable()) {
            return;
        }

        try {
            const redis = getRedisClient();
            if (!redis) {
                return;
            }

            const cacheKey = this.FRIEND_LIST_PREFIX + accountId;
            await redis.del(cacheKey);
        } catch (error) {
            console.error('Error invalidating friend list cache:', error);
        }
    }

    /**
     * Invalidate friend list cache for multiple accounts
     * Used when a friendship is created or removed (affects both accounts)
     */
    async invalidateMultipleFriendListCaches(accountIds: string[]): Promise<void> {
        if (!isRedisAvailable() || accountIds.length === 0) {
            return;
        }

        try {
            const redis = getRedisClient();
            if (!redis) {
                return;
            }

            // Build cache keys for all accounts
            const cacheKeys = accountIds.map(id => this.FRIEND_LIST_PREFIX + id);

            // Delete all cache keys
            if (cacheKeys.length > 0) {
                await redis.del(...cacheKeys);
            }
        } catch (error) {
            console.error('Error invalidating multiple friend list caches:', error);
        }
    }

    /**
     * Clear all friend list caches
     * Useful for maintenance or testing
     */
    async clearAllFriendListCaches(): Promise<void> {
        if (!isRedisAvailable()) {
            return;
        }

        try {
            const redis = getRedisClient();
            if (!redis) {
                return;
            }

            // Find all keys matching the friend list prefix
            const keys = await redis.keys(this.FRIEND_LIST_PREFIX + '*');

            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error('Error clearing all friend list caches:', error);
        }
    }
}
