// Feature: crm-integration-settings, Property 47: Encryption round-trip consistency
// Feature: crm-integration-settings, Property 46: Sensitive data encryption
import fc from 'fast-check';
import { EncryptionService } from '../../services/encryption.service';

describe('Encryption Service Property Tests', () => {
  let encryptionService: EncryptionService;

  beforeAll(() => {
    // Set up encryption key for testing
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars = 32 bytes
    encryptionService = new EncryptionService();
  });

  afterAll(() => {
    // Clean up
    delete process.env.ENCRYPTION_KEY;
  });

  // Property 47: Encryption round-trip consistency
  // Validates: Requirements 8.4
  describe('Property 47: Encryption round-trip consistency', () => {
    it('should preserve plaintext after encrypt-decrypt cycle for any string', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (plaintext) => {
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve plaintext for empty strings', () => {
      const plaintext = '';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should preserve plaintext for very long strings', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1000, maxLength: 10000 }),
          (plaintext) => {
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should preserve plaintext with special characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (plaintext) => {
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve plaintext with unicode characters', () => {
      fc.assert(
        fc.property(
          fc.unicodeString({ minLength: 1, maxLength: 500 }),
          (plaintext) => {
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Property 46: Sensitive data encryption
  // Validates: Requirements 8.1, 8.2, 8.3
  describe('Property 46: Sensitive data encryption', () => {
    it('should produce ciphertext that does not match plaintext for any string', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (plaintext) => {
            const encrypted = encryptionService.encrypt(plaintext);
            // Encrypted value should not equal plaintext
            expect(encrypted).not.toBe(plaintext);
            // Encrypted value should be in the format iv:authTag:encrypted
            const parts = encrypted.split(':');
            expect(parts.length).toBe(3);
            // For strings longer than a few characters, the plaintext should not appear in the encrypted value
            // (We skip very short strings like single characters as they might coincidentally appear in base64)
            if (plaintext.length > 3) {
              expect(encrypted).not.toContain(plaintext);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce different ciphertext for the same plaintext on each encryption', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (plaintext) => {
            const encrypted1 = encryptionService.encrypt(plaintext);
            const encrypted2 = encryptionService.encrypt(plaintext);
            // Each encryption should produce different ciphertext (due to random IV)
            expect(encrypted1).not.toBe(encrypted2);
            // But both should decrypt to the same plaintext
            expect(encryptionService.decrypt(encrypted1)).toBe(plaintext);
            expect(encryptionService.decrypt(encrypted2)).toBe(plaintext);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce ciphertext in the correct format (iv:authTag:encrypted)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (plaintext) => {
            const encrypted = encryptionService.encrypt(plaintext);
            const parts = encrypted.split(':');
            // Should have exactly 3 parts
            expect(parts.length).toBe(3);
            // Each part should be valid base64
            parts.forEach(part => {
              expect(part).toMatch(/^[A-Za-z0-9+/]+=*$/);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should encrypt webhook URLs without exposing plaintext', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (webhookUrl) => {
            const encrypted = encryptionService.encrypt(webhookUrl);
            expect(encrypted).not.toBe(webhookUrl);
            expect(encrypted).not.toContain(webhookUrl);
            // Verify it can be decrypted back
            expect(encryptionService.decrypt(encrypted)).toBe(webhookUrl);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should encrypt webhook secrets without exposing plaintext', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 32, maxLength: 64 }),
          (secret) => {
            const encrypted = encryptionService.encrypt(secret);
            expect(encrypted).not.toBe(secret);
            expect(encrypted).not.toContain(secret);
            // Verify it can be decrypted back
            expect(encryptionService.decrypt(encrypted)).toBe(secret);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should encrypt access tokens without exposing plaintext', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 200 }),
          (accessToken) => {
            const encrypted = encryptionService.encrypt(accessToken);
            expect(encrypted).not.toBe(accessToken);
            expect(encrypted).not.toContain(accessToken);
            // Verify it can be decrypted back
            expect(encryptionService.decrypt(encrypted)).toBe(accessToken);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
