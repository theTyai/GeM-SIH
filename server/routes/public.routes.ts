import { Router } from 'express';
import { db } from '../../src/db/index';
import { certificates, audits, gemListings } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

/**
 * Public Certificate Verification API
 * Independently hashes the payload to prove cryptographic integrity.
 * Returns the verified payload, evidence references, and issuance metadata.
 */
router.get('/v1/verify/:certificateHash', async (req, res) => {
  const { certificateHash } = req.params;

  try {
    const [cert] = await db.select().from(certificates).where(eq(certificates.currentHash, certificateHash));
    
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found in the trust ledger', isValid: false });
    }

    // 1. Reconstruct Canonical JSON Payload
    const payload = cert.payloadJson as Record<string, any>;
    const canonicalJson = JSON.stringify(payload, Object.keys(payload).sort());

    // 2. Recompute the hash exactly as the issuance gate did
    const hashObj = crypto.createHash('sha256');
    hashObj.update(canonicalJson);
    hashObj.update(cert.prevHash || 'GENESIS');
    const computedHash = hashObj.digest('hex');

    // 3. Verify Integrity
    const isValid = computedHash === cert.currentHash;

    if (!isValid) {
      console.error(`[Ledger Corruption Detected] Certificate ${certificateHash} fails cryptographic verification!`);
      return res.status(409).json({
        isValid: false,
        error: 'TAMPER_EVIDENT_FAILURE: Certificate hash does not match canonical payload.',
      });
    }

    // Don't expose sensitive procurement information, just the fact it was verified
    return res.status(200).json({
      isValid: true,
      verifiedAt: new Date().toISOString(),
      certificate: {
        certificateHash: cert.currentHash,
        previousLedgerHash: cert.prevHash,
        issuedAt: cert.createdAt,
        decidedBy: cert.officerId,
        decision: cert.decision,
      }
    });

  } catch (error) {
    console.error('Verification API failed:', error);
    return res.status(500).json({ error: 'Internal server error during verification' });
  }
});

export default router;
