import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = await service.register(req.body);
      return res.status(201).json({
        data: {
          tenant: data.tenant,
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        meta: null,
        error: null,
      });
    } catch (e: any) {
      return res.status(400).json({ data: null, meta: null, error: e.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = await service.login(req.body);
      return res.status(200).json({
        data: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        meta: null,
        error: null,
      });
    } catch (e: any) {
      return res.status(401).json({ data: null, meta: null, error: e.message });
    }
  }

  async me(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ data: null, meta: null, error: 'Unauthorized' });
      const data = await service.me(req.user.userId);
      return res.status(200).json({ data, meta: null, error: null });
    } catch (e: any) {
      return res.status(400).json({ data: null, meta: null, error: e.message });
    }
  }
}