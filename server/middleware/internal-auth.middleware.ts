import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

// In production, you would fetch the expected audience from environment variables
const EXPECTED_AUDIENCE = process.env.SERVICE_URL || 'https://api.gem-intel.internal';
const authClient = new OAuth2Client();

/**
 * Middleware to authenticate requests from Cloud Tasks or internal GCP services.
 * It verifies the OIDC token passed in the Authorization header.
 */
export const requireInternalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const isCloudTask = !!req.headers['x-cloudtasks-taskname'];

  // For local development/testing without real Cloud Tasks, 
  // you might want a bypass using a static internal secret.
  if (process.env.NODE_ENV !== 'production' && authHeader === `Bearer ${process.env.INTERNAL_API_SECRET}`) {
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the OIDC token signed by Google
    const ticket = await authClient.verifyIdToken({
      idToken: token,
      audience: EXPECTED_AUDIENCE,
    });

    const payload = ticket.getPayload();
    
    // Check if the service account email is authorized to trigger jobs
    // In a real environment, you'd match this against a specific allowed service account
    if (!payload || !payload.email_verified) {
      return res.status(403).json({ error: 'Forbidden: Invalid service account' });
    }

    // Attach verified internal context
    (req as any).internalJobCtx = {
      serviceAccount: payload.email,
      taskName: req.headers['x-cloudtasks-taskname'] || 'manual-trigger'
    };

    next();
  } catch (error) {
    console.error('Error verifying internal OIDC token:', error);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};
