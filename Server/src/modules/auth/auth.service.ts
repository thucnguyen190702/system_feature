import { AuthRepository } from './auth.repository';
import { PasswordUtil } from '../../shared/utils/password.util';
import { JwtUtil } from '../../shared/utils/jwt.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './types/jwt-payload';
import { ErrorCodes } from '../../shared/constants/error-codes';

export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private passwordUtil: typeof PasswordUtil = PasswordUtil,
    private jwtUtil: typeof JwtUtil = JwtUtil
  ) { }

  /**
   * Register a new user
   * Validates inputs, checks username exists, hashes password, creates user with default profile, generates token
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Validate username
      this.validateUsername(dto.username);

      // Validate password
      this.validatePassword(dto.password);

      // Check if username already exists
      const exists = await this.authRepository.usernameExists(dto.username);
      if (exists) {
        return {
          success: false,
          message: 'Username already exists',
          code: ErrorCodes.USERNAME_EXISTS,
        };
      }

      // Hash password
      const passwordHash = await this.passwordUtil.hash(dto.password);

      // Create user with default profile
      const user = await this.authRepository.createUser({
        username: dto.username,
        passwordHash,
        displayName: dto.displayName || dto.username, // Set displayName to username if not provided
      });

      // Generate token
      const token = this.jwtUtil.generateToken({
        userId: user.id,
        username: user.username,
      });

      return {
        success: true,
        token,
        userId: user.id,
        username: user.username,
      };
    } catch (error) {
      if (error instanceof Error) {
        const errorWithCode = error as Error & { code?: string };
        return {
          success: false,
          message: error.message,
          code: errorWithCode.code as any,
        };
      }
      return {
        success: false,
        message: 'Registration failed',
        code: ErrorCodes.SERVER_ERROR,
      };
    }
  }

  /**
   * Login an existing user
   * Finds user by username, compares password, generates token
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    try {
      // Find user by username
      const user = await this.authRepository.findByUsername(dto.username);

      // Return generic error for invalid credentials (prevent username enumeration)
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
          code: ErrorCodes.INVALID_CREDENTIALS,
        };
      }

      // Compare password
      const isPasswordValid = await this.passwordUtil.compare(
        dto.password,
        user.passwordHash
      );

      // Return generic error for invalid credentials
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid credentials',
          code: ErrorCodes.INVALID_CREDENTIALS,
        };
      }

      // Generate token
      const token = this.jwtUtil.generateToken({
        userId: user.id,
        username: user.username,
      });

      return {
        success: true,
        token,
        userId: user.id,
        username: user.username,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed',
        code: ErrorCodes.SERVER_ERROR,
      };
    }
  }

  /**
   * Validate a JWT token
   * Extracts and returns JwtPayload from valid token
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      // Verify token using JwtUtil
      const payload = this.jwtUtil.verifyToken(token);
      return payload;
    } catch (error) {
      // Throw error for invalid or expired tokens
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Token validation failed');
    }
  }

  /**
   * Validate username (3-50 alphanumeric characters)
   */
  private validateUsername(username: string): void {
    if (!username) {
      const error = new Error('Username is required') as Error & { code?: string };
      error.code = ErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    if (username.length < 3) {
      const error = new Error('Username must be at least 3 characters') as Error & { code?: string };
      error.code = ErrorCodes.USERNAME_TOO_SHORT;
      throw error;
    }

    if (username.length > 50) {
      const error = new Error('Username must not exceed 50 characters') as Error & { code?: string };
      error.code = ErrorCodes.USERNAME_TOO_LONG;
      throw error;
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(username)) {
      const error = new Error('Username must contain only alphanumeric characters') as Error & { code?: string };
      error.code = ErrorCodes.INVALID_USERNAME_FORMAT;
      throw error;
    }
  }

  /**
   * Validate password (minimum 6 characters)
   */
  private validatePassword(password: string): void {
    if (!password) {
      const error = new Error('Password is required') as Error & { code?: string };
      error.code = ErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters') as Error & { code?: string };
      error.code = ErrorCodes.PASSWORD_TOO_SHORT;
      throw error;
    }
  }
}
