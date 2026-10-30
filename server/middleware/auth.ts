import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.ts';
import type { User, UserRole } from '../../src/types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'trustshield_enterprise_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function signToken(user: { id: string; email: string; role: UserRole }): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing or invalid Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role: UserRole };
    const user = await db.findUserById(decoded.sub);
    if (!user) {
      res.status(401).json({ error: 'User session invalid or user deleted.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organization: user.organization,
      createdAt: user.createdAt
    };
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access Denied: Requires one of [${allowedRoles.join(', ')}] role. Current role: '${req.user.role}'.`
      });
      return;
    }

    next();
  };
}
