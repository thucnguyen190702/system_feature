import jwt, { SignOptions } from 'jsonwebtoken';
import { Environment } from '../../config/environment';
import { JwtPayload } from '../../modules/auth/types/jwt-payload';

export class JwtUtil {
  /**
   * Generate a JWT token with the given payload
   * @param payload - JWT payload containing userId and username
   * @returns Signed JWT token
   */
  static generateToken(payload: JwtPayload): string {
    const secret = Environment.JWT_SECRET;
    const expiresIn = Environment.JWT_EXPIRES_IN;
    
    return jwt.sign(
      {
        userId: payload.userId,
        username: payload.username,
      },
      secret,
      {
        expiresIn: expiresIn as any,
      }
    );
  }

  /**
   * Verify and decode a JWT token
   * @param token - JWT token to verify
   * @returns Decoded JWT payload
   * @throws Error if token is invalid or expired
   */
  static verifyToken(token: string): JwtPayload {
    const secret = Environment.JWT_SECRET;
    
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Decode a JWT token without verification (for debugging/inspection)
   * @param token - JWT token to decode
   * @returns Decoded JWT payload or null if invalid
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
