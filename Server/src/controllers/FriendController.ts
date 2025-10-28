import { Request, Response } from 'express';
import { FriendService } from '../services/FriendService';
import { logger } from '../config/logger';

export class FriendController {
    private friendService: FriendService;

    constructor() {
        this.friendService = new FriendService();
    }

    /**
     * Get friend list for an account
     * GET /api/friends/:accountId
     * Requirements: 3.1, 3.2, 3.3
     */
    getFriendList = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accountId } = req.params;

            // Validate accountId
            if (!accountId) {
                res.status(400).json({ 
                    error: 'Account ID is required' 
                });
                return;
            }

            // Get friend list
            const friends = await this.friendService.getFriendList(accountId);

            res.json(friends);
        } catch (error) {
            logger.error('Error getting friend list:', error);
            
            res.status(500).json({ 
                error: 'Failed to get friend list' 
            });
        }
    };

    /**
     * Send friend request
     * POST /api/friend-requests
     * Requirements: 2.1, 2.4
     */
    sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const { fromAccountId, toAccountId } = req.body;

            // Validate required fields
            if (!fromAccountId || !toAccountId) {
                res.status(400).json({ 
                    error: 'Both fromAccountId and toAccountId are required' 
                });
                return;
            }

            // Send friend request
            const request = await this.friendService.sendFriendRequest(fromAccountId, toAccountId);

            logger.info(`Friend request sent from ${fromAccountId} to ${toAccountId}`);
            res.status(201).json({ 
                success: true, 
                requestId: request.requestId,
                request 
            });
        } catch (error) {
            logger.error('Error sending friend request:', error);
            
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    res.status(404).json({ 
                        error: error.message 
                    });
                    return;
                }
                
                if (error.message.includes('Already friends') || 
                    error.message.includes('already pending') ||
                    error.message.includes('yourself')) {
                    res.status(400).json({ 
                        error: error.message 
                    });
                    return;
                }
            }

            res.status(500).json({ 
                error: 'Failed to send friend request' 
            });
        }
    };

    /**
     * Accept friend request
     * POST /api/friend-requests/:requestId/accept
     * Requirements: 2.5
     */
    acceptFriendRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const { requestId } = req.params;

            // Validate requestId
            if (!requestId) {
                res.status(400).json({ 
                    error: 'Request ID is required' 
                });
                return;
            }

            // Accept friend request
            await this.friendService.acceptFriendRequest(requestId);

            logger.info(`Friend request accepted: ${requestId}`);
            res.json({ 
                success: true,
                message: 'Friend request accepted' 
            });
        } catch (error) {
            logger.error('Error accepting friend request:', error);
            
            if (error instanceof Error) {
                if (error.message === 'Friend request not found') {
                    res.status(404).json({ 
                        error: error.message 
                    });
                    return;
                }
                
                if (error.message.includes('not pending')) {
                    res.status(400).json({ 
                        error: error.message 
                    });
                    return;
                }
            }

            res.status(500).json({ 
                error: 'Failed to accept friend request' 
            });
        }
    };

    /**
     * Remove friend
     * DELETE /api/friends/:friendAccountId
     * Requirements: 3.4
     */
    removeFriend = async (req: Request, res: Response): Promise<void> => {
        try {
            const { friendAccountId } = req.params;
            const { accountId } = req.body;

            // Validate required fields
            if (!accountId || !friendAccountId) {
                res.status(400).json({ 
                    error: 'Both accountId and friendAccountId are required' 
                });
                return;
            }

            // Remove friend
            await this.friendService.removeFriend(accountId, friendAccountId);

            logger.info(`Friend removed: ${accountId} removed ${friendAccountId}`);
            res.json({ 
                success: true,
                message: 'Friend removed successfully' 
            });
        } catch (error) {
            logger.error('Error removing friend:', error);
            
            if (error instanceof Error && error.message === 'Friendship not found') {
                res.status(404).json({ 
                    error: 'Friendship not found' 
                });
                return;
            }

            res.status(500).json({ 
                error: 'Failed to remove friend' 
            });
        }
    };

    /**
     * Get pending friend requests
     * GET /api/friend-requests/:accountId/pending
     * Requirements: 2.4
     */
    getPendingRequests = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accountId } = req.params;

            // Validate accountId
            if (!accountId) {
                res.status(400).json({ 
                    error: 'Account ID is required' 
                });
                return;
            }

            // Get pending requests
            const requests = await this.friendService.getPendingRequests(accountId);

            res.json(requests);
        } catch (error) {
            logger.error('Error getting pending requests:', error);
            
            res.status(500).json({ 
                error: 'Failed to get pending requests' 
            });
        }
    };

    /**
     * Update online status
     * POST /api/friends/status
     * Requirements: 3.1, 3.3
     */
    updateOnlineStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accountId, isOnline } = req.body;

            // Validate required fields
            if (!accountId || typeof isOnline !== 'boolean') {
                res.status(400).json({ 
                    error: 'accountId and isOnline (boolean) are required' 
                });
                return;
            }

            // Update online status
            await this.friendService.updateOnlineStatus(accountId, isOnline);

            logger.info(`Online status updated for ${accountId}: ${isOnline}`);
            res.json({ 
                success: true,
                message: 'Online status updated' 
            });
        } catch (error) {
            logger.error('Error updating online status:', error);
            
            if (error instanceof Error && error.message === 'Account not found') {
                res.status(404).json({ 
                    error: 'Account not found' 
                });
                return;
            }

            res.status(500).json({ 
                error: 'Failed to update online status' 
            });
        }
    };

    /**
     * Get friends online status
     * POST /api/friends/status/batch
     * Requirements: 3.1, 3.3
     */
    getFriendsOnlineStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accountIds } = req.body;

            // Validate required fields
            if (!accountIds || !Array.isArray(accountIds)) {
                res.status(400).json({ 
                    error: 'accountIds array is required' 
                });
                return;
            }

            // Get friends online status
            const statuses = await this.friendService.getFriendsOnlineStatus(accountIds);

            res.json(statuses);
        } catch (error) {
            logger.error('Error getting friends online status:', error);
            
            res.status(500).json({ 
                error: 'Failed to get friends online status' 
            });
        }
    };
}
