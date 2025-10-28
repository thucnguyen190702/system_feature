import * as crypto from 'crypto';

/**
 * Encryption utility for sensitive data
 * Uses AES-256-GCM for encryption
 * Requirements: 5.1, 5.4
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derive encryption key from secret using PBKDF2
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive data
 * @param text - Plain text to encrypt
 * @param secret - Encryption secret (from environment variable)
 * @returns Encrypted data in format: salt:iv:authTag:encryptedData (all base64 encoded)
 */
export function encrypt(text: string, secret?: string): string {
    if (!text) {
        throw new Error('Text to encrypt cannot be empty');
    }

    const encryptionSecret = secret || process.env.ENCRYPTION_SECRET;
    
    if (!encryptionSecret) {
        throw new Error('ENCRYPTION_SECRET environment variable is not set');
    }

    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from secret
    const key = deriveKey(encryptionSecret, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine salt, iv, authTag, and encrypted data
    return `${salt.toString('base64')}:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted data in format: salt:iv:authTag:encryptedData
 * @param secret - Encryption secret (from environment variable)
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string, secret?: string): string {
    if (!encryptedData) {
        throw new Error('Encrypted data cannot be empty');
    }

    const encryptionSecret = secret || process.env.ENCRYPTION_SECRET;
    
    if (!encryptionSecret) {
        throw new Error('ENCRYPTION_SECRET environment variable is not set');
    }

    // Split the encrypted data
    const parts = encryptedData.split(':');
    
    if (parts.length !== 4) {
        throw new Error('Invalid encrypted data format');
    }

    const [saltBase64, ivBase64, authTagBase64, encrypted] = parts;
    
    // Convert from base64
    const salt = Buffer.from(saltBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    // Derive key from secret
    const key = deriveKey(encryptionSecret, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

/**
 * Hash sensitive data (one-way)
 * Use this for data that doesn't need to be decrypted (like IDs for lookup)
 */
export function hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}
