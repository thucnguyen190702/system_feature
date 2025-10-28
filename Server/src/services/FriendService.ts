import { Repository, In } from 'typeorm';
import { FriendRequest } from '../entities/FriendRequest';
import { FriendRelationship } from '../entities/FriendRelationship';
import { InGameAccount } from '../entities/InGameAccount';
import { AppDataSource } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import { CacheService } from './CacheService';
import { BlockService } from './BlockService';
import { logger } from '../config/logger';
import { metrics, MetricNames } from '../utils/metrics';

export class FriendService {
    private friendRequestRepository: Repository<FriendRequest>;
    private friendRelationshipRepository: Repository<FriendRelationship>;
    private accountRepository: Repository<InGameAccount>;
    private cacheService: CacheService;
    private blockService: BlockService;

    constructor() {
        this.friendRequestRepository = AppDataSource.getRepository(FriendRequest);
        this.friendRelationshipRepository = AppDataSource.getRepository(FriendRelationship);
        this.accountRepository = AppDataSource.getRepository(InGameAccount);
        this.cacheService = new CacheService();
        this.blockService = new BlockService();
    }

    /**
     * Get friend list for an account
     * Query friend relationships bidirectional and join with accounts
     * Uses caching with 5 minute TTL for improved performance
     * Requirements: 3.1, 3.2, 3.3, 6.1, 6.3
     */
    async getFriendList(accountId: string): Promise<InGameAccount[]> {
        // Try to get from cache first
        const cachedFriends = await this.cacheService.getCachedFriendList(accountId);
        if (cachedFriends !== null) {
            return cachedFriends;
        }

        // Cache miss - query from database
        const relationships = await this.friendRelationshipRepository
            .createQueryBuilder('fr')
            .leftJoinAndSelect('fr.account1', 'acc1')
            .leftJoinAndSelect('fr.account2', 'acc2')
            .where('fr.accountId1 = :accountId OR fr.accountId2 = :accountId', { accountId })
            .getMany();

        // Extract friend accounts (the other account in each relationship)
        const friends: InGameAccount[] = relationships.map(rel => {
            return rel.accountId1 === accountId ? rel.account2 : rel.account1;
        });

        // Cache the result for 5 minutes
        await this.cacheService.cacheFriendList(accountId, friends);

        return friends;
    }

    /**
     * Send friend request
     * Validate both accounts exist, check not already friends, check no pending request
     * Rate limiting is enforced by middleware (20 requests per day)
     * Requirements: 2.1, 2.2, 2.3, 2.4, 5.2
     */
    async sendFriendRequest(fromAccountId: string, toAccountId: string): Promise<FriendRequest> {
        logger.info('Sending friend request', { fromAccountId, toAccountId });
        
        try {
            // Validate both accounts exist
            const fromAccount = await this.accountRepository.findOne({ where: { accountId: fromAccountId } });
            if (!fromAccount) {
                logger.warn('Friend request failed: sender not found', { fromAccountId });
                throw new Error('Sender account not found');
            }

        const toAccount = await this.accountRepository.findOne({ where: { accountId: toAccountId } });
        if (!toAccount) {
            throw new Error('Recipient account not found');
        }

        // Check if accounts are the same
        if (fromAccountId === toAccountId) {
            throw new Error('Cannot send friend request to yourself');
        }

        // Check if either account has blocked the other (Requirement 5.3)
        const isBlocked = await this.blockService.isBlockedBidirectional(fromAccountId, toAccountId);
        if (isBlocked) {
            throw new Error('Cannot send friend request to this account');
        }

        // Check if already friends
        const existingRelationship = await this.friendRelationshipRepository
            .createQueryBuilder('fr')
            .where(
                '(fr.accountId1 = :fromAccountId AND fr.accountId2 = :toAccountId) OR (fr.accountId1 = :toAccountId AND fr.accountId2 = :fromAccountId)',
                { fromAccountId, toAccountId }
            )
            .getOne();

        if (existingRelationship) {
            throw new Error('Already friends');
        }

        // Check for existing pending request (in either direction)
        const existingRequest = await this.friendRequestRepository
            .createQueryBuilder('fr')
            .where(
                '((fr.fromAccountId = :fromAccountId AND fr.toAccountId = :toAccountId) OR (fr.fromAccountId = :toAccountId AND fr.toAccountId = :fromAccountId)) AND fr.status = :status',
                { fromAccountId, toAccountId, status: 'pending' }
            )
            .getOne();

        if (existingRequest) {
            throw new Error('Friend request already pending');
        }

        // Create friend request with status pending
        const requestId = uuidv4();
        const request = this.friendRequestRepository.create({
            requestId,
            fromAccountId,
            toAccountId,
            status: 'pending'
        });

            // Validate entity
            const errors = await validate(request);
            if (errors.length > 0) {
                throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
            }

            const savedRequest = await this.friendRequestRepository.save(request);
            
            // Track metrics
            metrics.incrementCounter(MetricNames.FRIEND_REQUESTS_SENT);
            logger.info('Friend request sent successfully', { requestId, fromAccountId, toAccountId });
            
            return savedRequest;
        } catch (error) {
            logger.error('Failed to send friend request', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                fromAccountId,
                toAccountId
            });
            metrics.incrementCounter(MetricNames.ERRORS_TOTAL);
            throw error;
        }
    }

    /**
     * Accept friend request
     * Validate request exists and is pending, create bidirectional relationship, update status
     * Invalidates cache for both accounts
     * Requirements: 2.5, 6.3
     */
    async acceptFriendRequest(requestId: string): Promise<void> {
        logger.info('Accepting friend request', { requestId });
        
        try {
            // Validate request exists and is pending
            const request = await this.friendRequestRepository.findOne({ 
                where: { requestId } 
            });

            if (!request) {
                logger.warn('Accept failed: request not found', { requestId });
                throw new Error('Friend request not found');
            }

        if (request.status !== 'pending') {
            throw new Error('Friend request is not pending');
        }

        // Create bidirectional friend relationship
        const relationshipId = uuidv4();
        const relationship = this.friendRelationshipRepository.create({
            relationshipId,
            accountId1: request.fromAccountId,
            accountId2: request.toAccountId
        });

        // Validate entity
        const errors = await validate(relationship);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
        }

            // Save relationship
            await this.friendRelationshipRepository.save(relationship);

            // Update request status to accepted
            request.status = 'accepted';
            await this.friendRequestRepository.save(request);

            // Invalidate cache for both accounts (friend was added)
            await this.cacheService.invalidateMultipleFriendListCaches([
                request.fromAccountId,
                request.toAccountId
            ]);
            
            // Track metrics
            metrics.incrementCounter(MetricNames.FRIEND_REQUESTS_ACCEPTED);
            metrics.incrementCounter(MetricNames.FRIENDS_ADDED);
            logger.info('Friend request accepted successfully', { 
                requestId, 
                fromAccountId: request.fromAccountId, 
                toAccountId: request.toAccountId 
            });
        } catch (error) {
            logger.error('Failed to accept friend request', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                requestId
            });
            metrics.incrementCounter(MetricNames.ERRORS_TOTAL);
            throw error;
        }
    }

    /**
     * Remove friend
     * Validate friendship exists and delete relationship
     * Invalidates cache for both accounts
     * Requirements: 3.4, 6.3
     */
    async removeFriend(accountId: string, friendAccountId: string): Promise<void> {
        // Validate friendship exists
        const relationship = await this.friendRelationshipRepository
            .createQueryBuilder('fr')
            .where(
                '(fr.accountId1 = :accountId AND fr.accountId2 = :friendAccountId) OR (fr.accountId1 = :friendAccountId AND fr.accountId2 = :accountId)',
                { accountId, friendAccountId }
            )
            .getOne();

        if (!relationship) {
            throw new Error('Friendship not found');
        }

        // Delete friend relationship
        await this.friendRelationshipRepository.remove(relationship);

        // Invalidate cache for both accounts (friend was removed)
        await this.cacheService.invalidateMultipleFriendListCaches([
            accountId,
            friendAccountId
        ]);
    }

    /**
     * Get pending friend requests for an account
     * Query pending requests and sort by created date descending
     * Requirements: 2.4
     */
    async getPendingRequests(accountId: string): Promise<FriendRequest[]> {
        // Query pending requests where the account is the recipient
        const requests = await this.friendRequestRepository
            .createQueryBuilder('fr')
            .leftJoinAndSelect('fr.fromAccount', 'fromAcc')
            .where('fr.toAccountId = :accountId AND fr.status = :status', { 
                accountId, 
                status: 'pending' 
            })
            .orderBy('fr.createdAt', 'DESC')
            .getMany();

        return requests;
    }

    /**
     * Update online status for an account
     * Update is_online field and last_seen_at timestamp
     * Requirements: 3.1, 3.3
     */
    async updateOnlineStatus(accountId: string, isOnline: boolean): Promise<void> {
        const account = await this.accountRepository.findOne({ 
            where: { accountId } 
        });

        if (!account) {
            throw new Error('Account not found');
        }

        // Update is_online field
        account.isOnline = isOnline;
        
        // Update last_seen_at timestamp
        account.lastSeenAt = new Date();

        await this.accountRepository.save(account);
    }

    /**
     * Get online status for multiple friends
     * Query online status for list of account IDs and return map
     * Requirements: 3.1, 3.3
     */
    async getFriendsOnlineStatus(accountIds: string[]): Promise<Record<string, boolean>> {
        if (accountIds.length === 0) {
            return {};
        }

        // Query accounts with specified IDs
        const accounts = await this.accountRepository.find({
            where: { accountId: In(accountIds) },
            select: ['accountId', 'isOnline']
        });

        // Build map of accountId to isOnline status
        const statusMap: Record<string, boolean> = {};
        accounts.forEach(account => {
            statusMap[account.accountId] = account.isOnline;
        });

        return statusMap;
    }
}
