import crypto from 'crypto';

/**
 * Generate a unique webhook token
 * Format: whk_xxxxxxxxxxxxxxxx (20 chars total)
 */
export function generateWebhookToken(): string {
  const randomBytes = crypto.randomBytes(12); // 12 bytes = 24 hex chars
  const token = randomBytes.toString('hex').substring(0, 16); // Take first 16 chars
  return `whk_${token}`;
}

/**
 * Validate webhook token format
 */
export function isValidWebhookToken(token: string): boolean {
  return /^whk_[a-f0-9]{16}$/.test(token);
}
