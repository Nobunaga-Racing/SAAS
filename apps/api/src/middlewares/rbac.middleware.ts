import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';

export function rbacMiddleware(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ data: null, meta: null, error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ data: null, meta: null, error: 'Forbidden' });
    }
    return next();
  };
}