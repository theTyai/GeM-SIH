const fs = require('fs');
let code = fs.readFileSync('server/lib/trust-ledger.ts', 'utf8');

code = code.replace(
`  let signatureBase64 = 'kms-signature-unavailable';
  
  // Cloud KMS Asymmetric Signature
  if (keyName) {
    try {
      const [signResponse] = await kmsClient.asymmetricSign({
        name: keyName,
        digest: {
          sha256: Buffer.from(merkleRoot, 'hex')
        }
      });
      if (signResponse.signature) {
        signatureBase64 = Buffer.from(signResponse.signature as Uint8Array).toString('base64');
      }
    } catch (err) {
      console.error(\`[Ledger] KMS Signing failed (fallback to warning):\`, err);
    }
  } else {
    console.warn(\`[Ledger] KMS_KEY_NAME not configured. Skipping real cryptographic signature.\`);
    // In strict production, this would throw an Error rather than skipping, 
    // but we log a warning if the env isn't provided to avoid crashing the local dev flow.
    // However, per the instructions, we should enforce this in a real deployed environment.
    throw new Error('KMS_KEY_NAME environment variable is strictly required for production anchoring.');
  }`,
`  if (!keyName) {
    throw new Error('KMS_KEY_NAME environment variable is strictly required for production anchoring.');
  }

  let signatureBase64;
  // Cloud KMS Asymmetric Signature
  const [signResponse] = await kmsClient.asymmetricSign({
    name: keyName,
    digest: {
      sha256: Buffer.from(merkleRoot, 'hex')
    }
  });

  if (!signResponse.signature) {
    throw new Error('KMS signature returned empty from Google Cloud KMS');
  }

  signatureBase64 = Buffer.from(signResponse.signature as Uint8Array).toString('base64');`
);

fs.writeFileSync('server/lib/trust-ledger.ts', code);
