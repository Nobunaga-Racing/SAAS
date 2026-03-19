import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      tenantId: string;
      role: UserRole;
      email: string;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};