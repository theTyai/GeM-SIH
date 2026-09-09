import crypto from 'crypto';

/**
 * Computes the SHA-256 hash of a buffer.
 * This ensures cryptographic verifiability of the exact bytes written to WORM storage.
 */
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
