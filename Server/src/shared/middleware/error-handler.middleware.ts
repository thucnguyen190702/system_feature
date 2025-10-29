import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.util';

/**
 * Global error handler middleware
 * Logs errors with stack traces and returns generic error messages to client
 */
export class ErrorHandlerMiddleware {
  /**
   * Handle errors globally
   * Must be registered as the last middleware
   */
  static handle(err: Error, req: Request, res: Response, next: NextFunction): void {
    // Log error with stack trace (never log passwords)
    Logger.error('Global error handler caught error', err, {
      url: req.url,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Return generic error message to client (500 status)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }

  /**
   * Handle 404 Not Found errors
   * Should be registered after all routes but before error handler
   */
  static notFound(req: Request, res: Response): void {
    Logger.warn('404 Not Found', {
      url: req.url,
      method: req.method,
    });

    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
    });
  }
}
