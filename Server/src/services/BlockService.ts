import { Repository } from 'typeorm';
import { BlockedAccount } from '../entities/BlockedAccount';
import { InGameAccount } from '../entities/InGameAccount';
import { AppDataSource } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';

/**
 * Service for managing blocked accounts
 * Requirements: 5.3
 */
export class BlockService {
    private blockedAccountRepository: Repository<BlockedAccount>;
    private accountRepository: Repository<InGameAccount>;

    constructor() {
        this.blockedAccountRepository = AppDataSource.getRepository(BlockedAccount);
        this.accountRepository = AppDataSource.getRepository(InGameAccount);
    }

    /**
     * Block an account
     * @param blockerAccountId - Account ID of the user blocking
     * @param blockedAccountId - Account ID of the user being blocked
     * @param reason - Optional reason for blocking
     */
    async blockAccount(blockerAccountId: string, blockedAccountId: string, reason?: string): Promise<BlockedAccount> {
        // Validate both accounts exist
        const blockerAccount = await this.accountRepository.findOne({ where: { accountId: blockerAccountId } });
        if (!blockerAccount) {
            throw new Error('Blocker account not found');
        }

        const blockedAccount = await this.accountRepository.findOne({ where: { accountId: blockedAccountId } });
        if (!blockedAccount) {
            throw new Error('Blocked account not found');
        }

        // Cannot block yourself
        if (blockerAccountId === blockedAccountId) {
            throw new Error('Cannot block yourself');
        }

        // Check if already blocked
        const existingBlock = await this.blockedAccountRepository.findOne({
            where: {
                blockerAccountId,
                blockedAccountId
            }
        });

        if (existingBlock) {
            throw new Error('Account is already blocked');
        }

        // Create block record
        const blockId = uuidv4();
        const block = this.blockedAccountRepository.create({
            blockId,
            blockerAccountId,
            blockedAccountId,
            reason: reason || null
        });

        // Validate entity
        const errors = await validate(block);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
        }

        return await this.blockedAccountRepository.save(block);
    }

    /**
     * Unblock an account
     * @param blockerAccountId - Account ID of the user who blocked
     * @param blockedAccountId - Account ID of the user to unblock
     */
    async unblockAccount(blockerAccountId: string, blockedAccountId: string): Promise<void> {
        const block = await this.blockedAccountRepository.findOne({
            where: {
                blockerAccountId,
                blockedAccountId
            }
        });

        if (!block) {
            throw new Error('Block record not found');
        }

        await this.blockedAccountRepository.remove(block);
    }

    /**
     * Check if an account is blocked
     * @param blockerAccountId - Account ID of the potential blocker
     * @param blockedAccountId - Account ID to check
     * @returns true if blocked, false otherwise
     */
    async isBlocked(blockerAccountId: string, blockedAccountId: string): Promise<boolean> {
        const block = await this.blockedAccountRepository.findOne({
            where: {
                blockerAccountId,
                blockedAccountId
            }
        });

        return !!block;
    }

    /**
     * Check if either account has blocked the other (bidirectional check)
     * @param accountId1 - First account ID
     * @param accountId2 - Second account ID
     * @returns true if either has blocked the other
     */
    async isBlockedBidirectional(accountId1: string, accountId2: string): Promise<boolean> {
        const blocks = await this.blockedAccountRepository
            .createQueryBuilder('ba')
            .where(
                '(ba.blockerAccountId = :accountId1 AND ba.blockedAccountId = :accountId2) OR (ba.blockerAccountId = :accountId2 AND ba.blockedAccountId = :accountId1)',
                { accountId1, accountId2 }
            )
            .getCount();

        return blocks > 0;
    }

    /**
     * Get list of accounts blocked by a user
     * @param blockerAccountId - Account ID of the blocker
     */
    async getBlockedAccounts(blockerAccountId: string): Promise<InGameAccount[]> {
        const blocks = await this.blockedAccountRepository.find({
            where: { blockerAccountId },
            relations: ['blockedAccount'],
            order: { createdAt: 'DESC' }
        });

        return blocks.map(block => block.blockedAccount);
    }

    /**
     * Get list of accounts that have blocked a user
     * @param blockedAccountId - Account ID of the blocked user
     */
    async getBlockedByAccounts(blockedAccountId: string): Promise<InGameAccount[]> {
        const blocks = await this.blockedAccountRepository.find({
            where: { blockedAccountId },
            relations: ['blockerAccount'],
            order: { createdAt: 'DESC' }
        });

        return blocks.map(block => block.blockerAccount);
    }

    /**
     * Get block details
     * @param blockerAccountId - Account ID of the blocker
     * @param blockedAccountId - Account ID of the blocked user
     */
    async getBlockDetails(blockerAccountId: string, blockedAccountId: string): Promise<BlockedAccount | null> {
        return await this.blockedAccountRepository.findOne({
            where: {
                blockerAccountId,
                blockedAccountId
            },
            relations: ['blockerAccount', 'blockedAccount']
        });
    }
}
