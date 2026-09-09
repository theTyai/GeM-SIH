import { Storage } from '@google-cloud/storage';
import { computeSha256 } from './evidence-hash';

// In a real environment, you might use Workload Identity to auth.
const storage = new Storage();
const BUCKET_NAME = process.env.EVIDENCE_BUCKET || 'gem-intel-evidence-local-dev';

export interface EvidenceArtifacts {
  htmlBuffer: Buffer;
  screenshotBuffer: Buffer;
  metadata: Record<string, any>;
}

/**
 * Commits scraper artifacts to WORM storage.
 * Calculates hashes of the exact buffers, writes them to the bucket, and returns
 * the WORM reference and combined hash.
 */
export async function storeEvidence(auditId: string, snapshotId: string, artifacts: EvidenceArtifacts) {
  const { htmlBuffer, screenshotBuffer, metadata } = artifacts;
  
  // 1. Hash the raw artifacts
  const htmlHash = computeSha256(htmlBuffer);
  const screenshotHash = computeSha256(screenshotBuffer);
  
  // 2. Attach hashes to metadata
  metadata.htmlSha256 = htmlHash;
  metadata.screenshotSha256 = screenshotHash;
  
  const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
  // The metadata hash acts as the root digest for this snapshot
  const metadataHash = computeSha256(metadataBuffer);

  const basePath = `evidence/audits/${auditId}/snapshots/${snapshotId}`;
  const evidenceObjectKey = `${basePath}/metadata.json`;
  
  // 3. Write to Cloud Storage (Bypass for local prototype mode if no real GCS bucket)
  if (process.env.NODE_ENV !== 'production' && !process.env.USE_REAL_GCS) {
    console.log(`[WORM Storage] Simulated upload to gs://${BUCKET_NAME}/${basePath}/...`);
    console.log(`[WORM Storage] Root Hash: ${metadataHash}`);
    
    return {
      evidenceObjectKey,
      evidenceSha256: metadataHash,
    };
  }

  const bucket = storage.bucket(BUCKET_NAME);
  
  // Upload exact bytes
  await bucket.file(`${basePath}/page.html`).save(htmlBuffer, { contentType: 'text/html' });
  await bucket.file(`${basePath}/screenshot.png`).save(screenshotBuffer, { contentType: 'image/png' });
  await bucket.file(evidenceObjectKey).save(metadataBuffer, { contentType: 'application/json' });

  // In production, the bucket would have a Retention Policy configured 
  // (e.g., 7 years WORM) to prevent any subsequent modification or deletion.

  return {
    evidenceObjectKey,
    evidenceSha256: metadataHash,
  };
}
