import { Request, Response } from 'express';
import { AccountService } from '../services/AccountService';
import { logger } from '../config/logger';

export class AccountController {
    private accountService: AccountService;

    constructor() {
        this.accountService = new AccountService();
    }

    /**
     * Create a new account
     * POST /api/accounts
     * Requirements: 1.1, 1.2
     */
    createAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, displayName } = req.body;

            // Validate required fields
            if (!username) {
                res.status(400).json({ 
                    error: 'Username is required' 
                });
                return;
            }

            // Create account
            const account = await this.accountService.createAccount(username, displayName);

            logger.info(`Account created: ${account.accountId}`);
            res.status(201).json(account);
        } catch (error) {
            logger.error('Error creating account:', error);
            
            if (error instanceof Error) {
                if (error.message.includes('already exists')) {
                    res.status(409).json({ 
                        error: error.message 
                    });
                    return;
                }
                
                if (error.message.includes('Validation failed')) {
                    res.status(400).json({ 
                        error: error.message 
                    });
                    return;
                }
            }

            res.status(500).json({ 
                error: 'Failed to create account' 
            });
        }
    };

    /**
     * Get account by ID
     * GET /api/accounts/:accountId
     * Requirements: 1.1
     */
    getAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accountId } = req.params;

            // Validate accountId
            if (!accountId) {
                res.status(400).json({ 
                    error: 'Account ID is required' 
                });
                return;
            }

            // Get account
            const account = await this.accountService.getAccount(accountId);

            res.json(account);
        } catch (error) {
            logger.error('Error getting account:', error);
            
            if (error instanceof Error && error.message === 'Account not found') {
                res.status(404).json({ 
                    error: 'Account not found' 
                });
                return;
            }

            res.status(500).json({ 
                error: 'Failed to get account' 
            });
        }
    };

    /**
     * Update account information
     * PUT /api/accounts/:accountId
     * Requirements: 1.3
     */
    updateAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accountId } = req.params;
            const updateData = req.body;

            // Validate accountId
            if (!accountId) {
                res.status(400).json({ 
                    error: 'Account ID is required' 
                });
                return;
            }

            // Validate update data
            if (!updateData || Object.keys(updateData).length === 0) {
                res.status(400).json({ 
                    error: 'Update data is required' 
                });
                return;
            }

            // Update account
            const account = await this.accountService.updateAccount(accountId, updateData);

            logger.info(`Account updated: ${accountId}`);
            res.json(account);
        } catch (error) {
            logger.error('Error updating account:', error);
            
            if (error instanceof Error) {
                if (error.message === 'Account not found') {
                    res.status(404).json({ 
                        error: 'Account not found' 
                    });
                    return;
                }
                
                if (error.message.includes('already exists')) {
                    res.status(409).json({ 
                        error: error.message 
                    });
                    return;
                }
                
                if (error.message.includes('Validation failed')) {
                    res.status(400).json({ 
                        error: error.message 
                    });
                    return;
                }
            }

            res.status(500).json({ 
                error: 'Failed to update account' 
            });
        }
    };
}
