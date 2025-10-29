import bcrypt from 'bcrypt';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a plain text password using bcrypt
   * @param password - Plain text password to hash
   * @returns Hashed password
   */
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns True if passwords match, false otherwise
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
