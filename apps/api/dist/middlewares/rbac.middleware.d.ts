import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
export declare function rbacMiddleware(roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=rbac.middleware.d.ts.map