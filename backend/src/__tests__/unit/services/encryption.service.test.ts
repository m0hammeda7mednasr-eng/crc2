import { EncryptionService } from '../../../services/encryption.service';

describe('EncryptionService Unit Tests - Edge Cases', () => {
  let encryptionService: EncryptionService;
  const validEncryptionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars = 32 bytes

  beforeEach(() => {
    // Set up encryption key for testing
    process.env.ENCRYPTION_KEY = validEncryptionKey;
    encryptionService = new EncryptionService();
  });

  afterEach(() => {
    // Clean up
    delete process.env.ENCRYPTION_KEY;
  });

  describe('Empty string encryption', () => {
    it('should encrypt and decrypt empty string correctly', () => {
      const plaintext = '';
      const encrypted = encryptionService.encrypt(plaintext);
      
      // Encrypted value should not be empty
      expect(encrypted).toBeTruthy();
      expect(encrypted.length).toBeGreaterThan(0);
      
      // Should have correct format
      const parts = encrypted.split(':');
      expect(parts.length).toBe(3);
      
      // Should decrypt back to empty string
      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe('');
    });
  });

  describe('Very long string encryption', () => {
    it('should encrypt and decrypt very long strings (10KB)', () => {
      // Create a 10KB string
      const plaintext = 'a'.repeat(10 * 1024);
      
      const encrypted = encryptionService.encrypt(plaintext);
      expect(encrypted).toBeTruthy();
      
      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
      expect(decrypted.length).toBe(10 * 1024);
    });

    it('should encrypt and decrypt very long strings (100KB)', () => {
      // Create a 100KB string
      const plaintext = 'b'.repeat(100 * 1024);
      
      const encrypted = encryptionService.encrypt(plaintext);
      expect(encrypted).toBeTruthy();
      
      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
      expect(decrypted.length).toBe(100 * 1024);
    });

    it('should encrypt and decrypt strings with mixed content', () => {
      // Create a long string with various characters
      const plaintext = 'Hello World! 🌍 '.repeat(1000) + 'Special chars: @#$%^&*()_+-=[]{}|;:,.<>?/~`';
      
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Invalid ciphertext decryption', () => {
    it('should throw error for invalid ciphertext format (missing parts)', () => {
      const invalidCiphertext = 'invalid:format';
      
      expect(() => {
        encryptionService.decrypt(invalidCiphertext);
      }).toThrow('Invalid ciphertext format');
    });

    it('should throw error for ciphertext with only one part', () => {
      const invalidCiphertext = 'singlepart';
      
      expect(() => {
        encryptionService.decrypt(invalidCiphertext);
      }).toThrow('Invalid ciphertext format');
    });

    it('should throw error for ciphertext with too many parts', () => {
      const invalidCiphertext = 'part1:part2:part3:part4';
      
      expect(() => {
        encryptionService.decrypt(invalidCiphertext);
      }).toThrow('Invalid ciphertext format');
    });

    it('should throw error for invalid base64 in IV', () => {
      const invalidCiphertext = 'invalid-base64!:dGVzdA==:dGVzdA==';
      
      expect(() => {
        encryptionService.decrypt(invalidCiphertext);
      }).toThrow();
    });

    it('should throw error for tampered ciphertext (wrong auth tag)', () => {
      // Encrypt a valid string
      const plaintext = 'test data';
      const encrypted = encryptionService.encrypt(plaintext);
      
      // Tamper with the auth tag
      const parts = encrypted.split(':');
      const tamperedAuthTag = Buffer.from('tampered', 'utf8').toString('base64');
      const tamperedCiphertext = `${parts[0]}:${tamperedAuthTag}:${parts[2]}`;
      
      expect(() => {
        encryptionService.decrypt(tamperedCiphertext);
      }).toThrow();
    });

    it('should throw error for tampered encrypted data', () => {
      // Encrypt a valid string
      const plaintext = 'test data';
      const encrypted = encryptionService.encrypt(plaintext);
      
      // Tamper with the encrypted data
      const parts = encrypted.split(':');
      const tamperedData = Buffer.from('tampered', 'utf8').toString('base64');
      const tamperedCiphertext = `${parts[0]}:${parts[1]}:${tamperedData}`;
      
      expect(() => {
        encryptionService.decrypt(tamperedCiphertext);
      }).toThrow();
    });

    it('should throw error for empty ciphertext', () => {
      expect(() => {
        encryptionService.decrypt('');
      }).toThrow('Invalid ciphertext format');
    });
  });

  describe('Missing encryption key', () => {
    it('should throw error when ENCRYPTION_KEY is not set', () => {
      delete process.env.ENCRYPTION_KEY;
      const service = new EncryptionService();
      
      expect(() => {
        service.encrypt('test');
      }).toThrow('ENCRYPTION_KEY environment variable is not set');
    });

    it('should throw error when ENCRYPTION_KEY is empty string', () => {
      process.env.ENCRYPTION_KEY = '';
      const service = new EncryptionService();
      
      expect(() => {
        service.encrypt('test');
      }).toThrow('ENCRYPTION_KEY environment variable is not set');
    });

    it('should throw error when ENCRYPTION_KEY has invalid length (too short)', () => {
      process.env.ENCRYPTION_KEY = '0123456789abcdef'; // Only 16 hex chars = 8 bytes
      const service = new EncryptionService();
      
      expect(() => {
        service.encrypt('test');
      }).toThrow('Invalid encryption key length');
    });

    it('should throw error when ENCRYPTION_KEY has invalid length (too long)', () => {
      process.env.ENCRYPTION_KEY = '0123456789abcdef'.repeat(5); // 80 hex chars = 40 bytes
      const service = new EncryptionService();
      
      expect(() => {
        service.encrypt('test');
      }).toThrow('Invalid encryption key length');
    });

    it('should throw error when ENCRYPTION_KEY is not valid hex', () => {
      process.env.ENCRYPTION_KEY = 'not-a-valid-hex-string-but-correct-length-xxxxxxxxxxxxxxxx';
      const service = new EncryptionService();
      
      expect(() => {
        service.encrypt('test');
      }).toThrow('Invalid encryption key length');
    });
  });

  describe('maskSecret method', () => {
    it('should mask secret showing last 4 characters by default', () => {
      const secret = 'my-secret-key-12345';
      const masked = encryptionService.maskSecret(secret);
      
      expect(masked).toMatch(/^\*+2345$/);
      expect(masked).toContain('2345');
      expect(masked).not.toContain('my-secret');
    });

    it('should mask secret showing custom number of visible characters', () => {
      const secret = 'my-secret-key-12345';
      const masked = encryptionService.maskSecret(secret, 10);
      
      expect(masked).toContain('key-12345');
      expect(masked).toMatch(/^\*+-key-12345$/);
    });

    it('should return **** for empty string', () => {
      const masked = encryptionService.maskSecret('');
      expect(masked).toBe('****');
    });

    it('should return **** for very short strings', () => {
      const masked1 = encryptionService.maskSecret('abc');
      const masked2 = encryptionService.maskSecret('ab');
      const masked3 = encryptionService.maskSecret('a');
      
      expect(masked1).toBe('****');
      expect(masked2).toBe('****');
      expect(masked3).toBe('****');
    });

    it('should mask string with exactly 4 characters', () => {
      const secret = 'abcd';
      const masked = encryptionService.maskSecret(secret);
      
      expect(masked).toBe('****');
    });

    it('should mask string with 5 characters showing last 4', () => {
      const secret = 'abcde';
      const masked = encryptionService.maskSecret(secret);
      
      expect(masked).toMatch(/^\*+bcde$/);
      expect(masked.length).toBeGreaterThan(4);
    });

    it('should handle null or undefined gracefully', () => {
      const masked1 = encryptionService.maskSecret(null as any);
      const masked2 = encryptionService.maskSecret(undefined as any);
      
      expect(masked1).toBe('****');
      expect(masked2).toBe('****');
    });
  });

  describe('Special characters and encoding', () => {
    it('should handle strings with newlines', () => {
      const plaintext = 'line1\nline2\nline3';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle strings with tabs', () => {
      const plaintext = 'col1\tcol2\tcol3';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle strings with null bytes', () => {
      const plaintext = 'before\x00after';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle JSON strings', () => {
      const plaintext = JSON.stringify({ key: 'value', nested: { data: [1, 2, 3] } });
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
      expect(JSON.parse(decrypted)).toEqual({ key: 'value', nested: { data: [1, 2, 3] } });
    });

    it('should handle URLs with special characters', () => {
      const plaintext = 'https://example.com/path?param=value&other=123#fragment';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle emoji and unicode', () => {
      const plaintext = '🔐 Secure data with emoji 🚀 and unicode: ñ, é, ü, 中文';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Encryption uniqueness', () => {
    it('should produce different ciphertext for same plaintext (due to random IV)', () => {
      const plaintext = 'same plaintext';
      
      const encrypted1 = encryptionService.encrypt(plaintext);
      const encrypted2 = encryptionService.encrypt(plaintext);
      const encrypted3 = encryptionService.encrypt(plaintext);
      
      // All should be different
      expect(encrypted1).not.toBe(encrypted2);
      expect(encrypted2).not.toBe(encrypted3);
      expect(encrypted1).not.toBe(encrypted3);
      
      // But all should decrypt to the same plaintext
      expect(encryptionService.decrypt(encrypted1)).toBe(plaintext);
      expect(encryptionService.decrypt(encrypted2)).toBe(plaintext);
      expect(encryptionService.decrypt(encrypted3)).toBe(plaintext);
    });

    it('should produce different IVs for each encryption', () => {
      const plaintext = 'test';
      
      const encrypted1 = encryptionService.encrypt(plaintext);
      const encrypted2 = encryptionService.encrypt(plaintext);
      
      const iv1 = encrypted1.split(':')[0];
      const iv2 = encrypted2.split(':')[0];
      
      expect(iv1).not.toBe(iv2);
    });
  });

  describe('Real-world scenarios', () => {
    it('should encrypt and decrypt Shopify access token', () => {
      const accessToken = 'shpat_1234567890abcdefghijklmnopqrstuvwxyz';
      const encrypted = encryptionService.encrypt(accessToken);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(accessToken);
      expect(encrypted).not.toContain(accessToken);
    });

    it('should encrypt and decrypt webhook URL', () => {
      const webhookUrl = 'https://n8n.example.com/webhook/abc123def456';
      const encrypted = encryptionService.encrypt(webhookUrl);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(webhookUrl);
      expect(encrypted).not.toContain('n8n.example.com');
    });

    it('should encrypt and decrypt webhook secret', () => {
      const secret = 'whsec_1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const encrypted = encryptionService.encrypt(secret);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(secret);
      expect(encrypted).not.toContain(secret);
    });

    it('should mask webhook URL for display', () => {
      const webhookUrl = 'https://n8n.example.com/webhook/abc123def456';
      const masked = encryptionService.maskSecret(webhookUrl, 10);
      
      expect(masked).toContain('3def456');
      expect(masked).not.toContain('n8n.example.com');
    });

    it('should mask access token for display', () => {
      const accessToken = 'shpat_1234567890abcdefghijklmnopqrstuvwxyz';
      const masked = encryptionService.maskSecret(accessToken, 4);
      
      expect(masked).toContain('wxyz');
      expect(masked).not.toContain('shpat_');
    });
  });
});
