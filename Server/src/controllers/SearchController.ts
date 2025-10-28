import { Request, Response } from 'express';
import { SearchService } from '../services/SearchService';
import { logger } from '../config/logger';

export class SearchController {
    private searchService: SearchService;

    constructor() {
        this.searchService = new SearchService();
    }

    /**
     * Search accounts by username
     * GET /api/search/username?q=:query
     * Requirements: 2.1
     */
    searchByUsername = async (req: Request, res: Response): Promise<void> => {
        try {
            const query = req.query.q as string;

            // Validate query parameter
            if (!query || query.trim().length === 0) {
                res.status(400).json({ 
                    error: 'Search query is required' 
                });
                return;
            }

            // Search by username
            const accounts = await this.searchService.searchByUsername(query);

            res.json(accounts);
        } catch (error) {
            logger.error('Error searching by username:', error);
            
            res.status(500).json({ 
                error: 'Failed to search accounts' 
            });
        }
    };

    /**
     * Search account by ID
     * GET /api/search/id/:accountId
     * Requirements: 2.2
     */
    searchById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accountId } = req.params;

            // Validate accountId
            if (!accountId || accountId.trim().length === 0) {
                res.status(400).json({ 
                    error: 'Account ID is required' 
                });
                return;
            }

            // Search by ID
            const account = await this.searchService.searchById(accountId);

            if (!account) {
                res.status(404).json({ 
                    error: 'Account not found' 
                });
                return;
            }

            res.json(account);
        } catch (error) {
            logger.error('Error searching by ID:', error);
            
            res.status(500).json({ 
                error: 'Failed to search account' 
            });
        }
    };
}
