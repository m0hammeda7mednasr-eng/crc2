import crypto from 'crypto';

/**
 * EncryptionService handles encryption and decryption of sensitive data
 * using AES-256-GCM encryption algorithm.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.6
 */
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16; // 128 bits
  private readonly authTagLength = 16; // 128 bits
  private readonly keyLength = 32; // 256 bits

  /**
   * Encrypt plaintext using AES-256-GCM
   * Returns base64 encoded string with format: iv:authTag:encrypted
   * 
   * @param plaintext - The plaintext string to encrypt
   * @returns Encrypted string in format "iv:authTag:encrypted" (base64 encoded)
   */
  encrypt(plaintext: string): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encrypted (all base64 encoded)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  }

  /**
   * Decrypt ciphertext using AES-256-GCM
   * Parses format: iv:authTag:encrypted
   * 
   * @param ciphertext - The encrypted string in format "iv:authTag:encrypted"
   * @returns Decrypted plaintext string
   * @throws Error if decryption fails or format is invalid
   */
  decrypt(ciphertext: string): string {
    const key = this.getEncryptionKey();
    
    // Parse the ciphertext format
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format. Expected format: iv:authTag:encrypted');
    }
    
    const [ivBase64, authTagBase64, encryptedBase64] = parts;
    
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const encrypted = Buffer.from(encryptedBase64, 'base64');
    
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  }

  /**
   * Mask sensitive string for display
   * Shows only last N characters
   * 
   * @param secret - The secret string to mask
   * @param visibleChars - Number of characters to show at the end (default: 4)
   * @returns Masked string with format "****last4chars"
   */
  maskSecret(secret: string, visibleChars: number = 4): string {
    if (!secret || secret.length <= visibleChars) {
      return '****';
    }
    
    const maskedPart = '*'.repeat(Math.max(4, secret.length - visibleChars));
    const visiblePart = secret.slice(-visibleChars);
    
    return `${maskedPart}${visiblePart}`;
  }

  /**
   * Get encryption key from environment variable
   * Validates key length (32 bytes for AES-256)
   * 
   * @returns Buffer containing the encryption key
   * @throws Error if ENCRYPTION_KEY is missing or invalid length
   */
  private getEncryptionKey(): Buffer {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    
    // Convert hex string to buffer
    const key = Buffer.from(encryptionKey, 'hex');
    
    if (key.length !== this.keyLength) {
      throw new Error(
        `Invalid encryption key length. Expected ${this.keyLength} bytes (64 hex characters), got ${key.length} bytes`
      );
    }
    
    return key;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
