import { Request, Response } from 'express';
import { BlockService } from '../services/BlockService';
import { logger } from '../config/logger';

/**
 * Controller for block-related operations
 * Requirements: 5.3
 */
export class BlockController {
    private blockService: BlockService;

    constructor() {
        this.blockService = new BlockService();
    }

    /**
     * Block an account
     * POST /api/blocks
     * Body: { blockedAccountId: string, reason?: string }
     */
    async blockAccount(req: Request, res: Response): Promise<void> {
        try {
            const blockerAccountId = req.user?.accountId;
            const { blockedAccountId, reason } = req.body;

            if (!blockerAccountId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }

            if (!blockedAccountId) {
                res.status(400).json({
                    success: false,
                    error: 'blockedAccountId is required'
                });
                return;
            }

            const block = await this.blockService.blockAccount(blockerAccountId, blockedAccountId, reason);

            logger.info(`Account ${blockerAccountId} blocked account ${blockedAccountId}`);

            res.status(201).json({
                success: true,
                data: {
                    blockId: block.blockId,
                    blockedAccountId: block.blockedAccountId,
                    createdAt: block.createdAt
                }
            });
        } catch (error) {
            logger.error('Error blocking account:', error);
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to block account'
            });
        }
    }

    /**
     * Unblock an account
     * DELETE /api/blocks/:blockedAccountId
     */
    async unblockAccount(req: Request, res: Response): Promise<void> {
        try {
            const blockerAccountId = req.user?.accountId;
            const { blockedAccountId } = req.params;

            if (!blockerAccountId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }

            if (!blockedAccountId) {
                res.status(400).json({
                    success: false,
                    error: 'blockedAccountId is required'
                });
                return;
            }

            await this.blockService.unblockAccount(blockerAccountId, blockedAccountId);

            logger.info(`Account ${blockerAccountId} unblocked account ${blockedAccountId}`);

            res.json({
                success: true,
                message: 'Account unblocked successfully'
            });
        } catch (error) {
            logger.error('Error unblocking account:', error);
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to unblock account'
            });
        }
    }

    /**
     * Get list of blocked accounts
     * GET /api/blocks
     */
    async getBlockedAccounts(req: Request, res: Response): Promise<void> {
        try {
            const blockerAccountId = req.user?.accountId;

            if (!blockerAccountId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }

            const blockedAccounts = await this.blockService.getBlockedAccounts(blockerAccountId);

            res.json({
                success: true,
                data: blockedAccounts
            });
        } catch (error) {
            logger.error('Error getting blocked accounts:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get blocked accounts'
            });
        }
    }

    /**
     * Check if an account is blocked
     * GET /api/blocks/check/:accountId
     */
    async checkBlocked(req: Request, res: Response): Promise<void> {
        try {
            const blockerAccountId = req.user?.accountId;
            const { accountId } = req.params;

            if (!blockerAccountId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }

            if (!accountId) {
                res.status(400).json({
                    success: false,
                    error: 'accountId is required'
                });
                return;
            }

            const isBlocked = await this.blockService.isBlocked(blockerAccountId, accountId);

            res.json({
                success: true,
                data: {
                    isBlocked
                }
            });
        } catch (error) {
            logger.error('Error checking block status:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to check block status'
            });
        }
    }
}
