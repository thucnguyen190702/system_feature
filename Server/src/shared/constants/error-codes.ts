/**
 * Standardized error codes for client-server communication
 * These codes match the error codes expected by the Unity client
 */
export const ErrorCodes = {
  // Authentication errors
  USERNAME_EXISTS: 'USERNAME_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  USERNAME_TOO_SHORT: 'USERNAME_TOO_SHORT',
  USERNAME_TOO_LONG: 'USERNAME_TOO_LONG',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  INVALID_USERNAME_FORMAT: 'INVALID_USERNAME_FORMAT',
  
  // System errors
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
