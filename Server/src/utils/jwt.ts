import jwt, { SignOptions } from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
    accountId: string;
    username?: string;
}

/**
 * Generate JWT token for authentication
 * @param accountId - The account ID to encode in the token
 * @param username - Optional username to include in the token
 * @returns JWT token string
 */
export function generateToken(accountId: string, username?: string): string {
    const payload: JwtPayload = {
        accountId,
        ...(username && { username })
    };

    // Set expiration to 7 days
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d'
    });
}

/**
 * Verify JWT token and return decoded payload
 * @param token - JWT token string to verify
 * @returns Decoded JWT payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JwtPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
}

/**
 * Decode JWT token without verification (for debugging purposes)
 * @param token - JWT token string to decode
 * @returns Decoded JWT payload or null if invalid
 */
export function decodeToken(token: string): JwtPayload | null {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch (error) {
        return null;
    }
}
