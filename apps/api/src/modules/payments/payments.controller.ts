// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Paiements
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express'
import * as service from './payments.service'
import { createPaymentSchema, paymentFiltersSchema } from './payments.service'

const ok   = (res: Response, data: unknown, status = 200) => res.status(status).json({ data })
const fail = (res: Response, message: string, status = 400) => res.status(status).json({ error: { message } })

const getTenant = (req: Request) => req.user!.tenantId
const p         = (req: Request, key: string): string => req.params[key] as string

// ─── Liste paginée ────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await service.findAll(getTenant(req), paymentFiltersSchema.parse(req.query)))
  } catch (e) { next(e) }
}

// ─── Détail ───────────────────────────────────────────────────────────────────

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payment = await service.findById(p(req, 'id'), getTenant(req))
    if (!payment) { fail(res, 'Paiement introuvable', 404); return }
    ok(res, payment)
  } catch (e) { next(e) }
}

// ─── Enregistrer un paiement ─────────────────────────────────────────────────

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createPaymentSchema.parse(req.body)
    ok(res, await service.recordPayment(dto, getTenant(req)), 201)
  } catch (e) { next(e) }
}

// ─── Supprimer un paiement ────────────────────────────────────────────────────

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.removePayment(p(req, 'id'), getTenant(req))
    res.status(204).send()
  } catch (e) { next(e) }
}

// ─── Statistiques ─────────────────────────────────────────────────────────────

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const { dateFrom, dateTo } = req.query as { dateFrom?: string; dateTo?: string }
    ok(res, await service.getStats(getTenant(req), dateFrom, dateTo))
  } catch (e) { next(e) }
}
