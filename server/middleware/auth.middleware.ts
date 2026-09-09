import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../../src/db/index';
import { users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken & { dbRole?: string, dbId?: string };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    
    // Lookup user in Postgres
    const [dbUser] = await db.select().from(users).where(eq(users.firebaseUid, decodedToken.uid));
    if (dbUser) {
      req.user.dbRole = dbUser.role;
      req.user.dbId = dbUser.id;
    }
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware to enforce Role-Based Access Control (RBAC).
 */
export const requireRole = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.dbRole) {
      return res.status(403).json({ error: 'Forbidden: No role assigned in database' });
    }

    if (!requiredRoles.includes(req.user.dbRole)) {
      return res.status(403).json({ error: `Forbidden: Requires one of [${requiredRoles.join(', ')}]` });
    }

    next();
  };
};
