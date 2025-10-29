import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class Environment {
  static get PORT(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  static get NODE_ENV(): string {
    return process.env.NODE_ENV || 'development';
  }

  static get DB_HOST(): string {
    return process.env.DB_HOST || 'localhost';
  }

  static get DB_PORT(): number {
    return parseInt(process.env.DB_PORT || '5432', 10);
  }

  static get DB_USERNAME(): string {
    return process.env.DB_USERNAME || 'postgres';
  }

  static get DB_PASSWORD(): string {
    return process.env.DB_PASSWORD || 'postgres';
  }

  static get DB_DATABASE(): string {
    return process.env.DB_DATABASE || 'game_auth';
  }

  static get JWT_SECRET(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  static get JWT_EXPIRES_IN(): string {
    return process.env.JWT_EXPIRES_IN || '24h';
  }
}
