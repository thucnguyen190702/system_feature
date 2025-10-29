import winston from 'winston';
import { Environment } from '../../config/environment';

/**
 * Logger utility using Winston
 * Provides structured logging with different levels
 * Never logs passwords or sensitive information
 */
class LoggerUtil {
  private logger: winston.Logger;

  constructor() {
    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    );

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        // Add stack trace if available
        if (stack) {
          log += `\n${stack}`;
        }
        
        // Add metadata if available
        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
      })
    );

    // Create logger instance
    this.logger = winston.createLogger({
      level: Environment.NODE_ENV === 'production' ? 'info' : 'debug',
      format: logFormat,
      transports: [
        // Console transport
        new winston.transports.Console({
          format: consoleFormat,
        }),
        // File transport for errors
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // File transport for all logs
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }

  /**
   * Log info message
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, this.sanitizeMeta(meta));
  }

  /**
   * Log error message with stack trace
   */
  error(message: string, error?: Error | any, meta?: any): void {
    const errorMeta = {
      ...this.sanitizeMeta(meta),
      ...(error instanceof Error && {
        stack: error.stack,
        name: error.name,
      }),
    };
    
    this.logger.error(message, errorMeta);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(message, this.sanitizeMeta(meta));
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(message, this.sanitizeMeta(meta));
  }

  /**
   * Sanitize metadata to remove sensitive information
   * Never log passwords or tokens
   */
  private sanitizeMeta(meta?: any): any {
    if (!meta) return {};

    const sanitized = { ...meta };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'authorization'];

    // Remove sensitive fields
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Handle nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeMeta(sanitized[key]);
      }
    }

    return sanitized;
  }
}

// Export singleton instance
export const Logger = new LoggerUtil();
