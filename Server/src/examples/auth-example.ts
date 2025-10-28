/**
 * Example usage of authentication middleware
 * This file demonstrates how to use JWT authentication in your Express routes
 */

import express, { Request, Response } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware';
import { generateToken } from '../utils';

const router = express.Router();

// Example 1: Login endpoint that generates a token
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        
        // TODO: Validate credentials against database
        // This is just an example - implement proper authentication
        const accountId = 'account-123'; // Get from database
        
        // Generate JWT token
        const token = generateToken(accountId, username);
        
        res.json({
            success: true,
            token,
            accountId,
            username
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Login failed'
        });
    }
});

// Example 2: Protected route - requires authentication
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        // Access authenticated user from req.user
        const { accountId, username } = req.user!;
        
        // TODO: Fetch user profile from database
        res.json({
            success: true,
            profile: {
                accountId,
                username,
                // ... other profile data
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch profile'
        });
    }
});

// Example 3: Protected route with parameter validation
router.get('/friends/:accountId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { accountId } = req.params;
        const authenticatedAccountId = req.user!.accountId;
        
        // Optional: Verify user can only access their own friends
        if (accountId !== authenticatedAccountId) {
            res.status(403).json({
                success: false,
                error: 'You can only view your own friend list'
            });
            return;
        }
        
        // TODO: Fetch friends from database
        res.json({
            success: true,
            friends: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch friends'
        });
    }
});

// Example 4: Optional authentication - works with or without token
router.get('/search', optionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        
        // Check if user is authenticated
        const isAuthenticated = !!req.user;
        
        // TODO: Perform search
        // You might want to return different results based on authentication
        res.json({
            success: true,
            results: [],
            isAuthenticated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Search failed'
        });
    }
});

// Example 5: Multiple middleware - authentication + custom validation
const validateAccountOwnership = (req: Request, res: Response, next: express.NextFunction) => {
    const { accountId } = req.params;
    const authenticatedAccountId = req.user!.accountId;
    
    if (accountId !== authenticatedAccountId) {
        res.status(403).json({
            success: false,
            error: 'Access denied'
        });
        return;
    }
    
    next();
};

router.put('/accounts/:accountId', authMiddleware, validateAccountOwnership, async (req: Request, res: Response) => {
    try {
        const { accountId } = req.params;
        const updateData = req.body;
        
        // TODO: Update account in database
        res.json({
            success: true,
            message: 'Account updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Update failed'
        });
    }
});

export default router;
