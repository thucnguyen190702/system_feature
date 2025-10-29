export interface JwtPayload {
  userId: string;
  username: string;
  iat?: number;  // Issued at (added by jsonwebtoken)
  exp?: number;  // Expiration (added by jsonwebtoken)
}
