import type { Request, Response, NextFunction } from 'express'
import * as service from './settings.service'

const ok = (res: Response, data: unknown) => res.json({ data })

export async function getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { ok(res, await service.getSettings(req.user!.tenantId)) } catch (e) { next(e) }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { ok(res, await service.updateSettings(req.user!.tenantId, req.body)) } catch (e) { next(e) }
}

export async function uploadLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) { res.status(400).json({ error: { message: 'Aucun fichier reçu' } }); return }
    const logoUrl = `/uploads/${req.file.filename}`
    ok(res, await service.updateLogo(req.user!.tenantId, logoUrl))
  } catch (e) { next(e) }
}
