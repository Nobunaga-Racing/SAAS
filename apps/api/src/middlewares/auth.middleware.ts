import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ data: null, meta: null, error: 'Missing bearer token' });
  }

  const token = auth.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as any;
    req.user = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email,
    };
    return next();
  } catch {
    return res.status(401).json({ data: null, meta: null, error: 'Invalid or expired token' });
  }
}