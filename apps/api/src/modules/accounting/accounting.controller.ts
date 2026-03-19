// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Comptabilité
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express'
import * as service from './accounting.service'
import { accountingFiltersSchema } from './accounting.service'

const ok   = (res: Response, data: unknown, status = 200) => res.status(status).json({ data })
const fail = (res: Response, message: string, status = 400) => res.status(status).json({ error: { message } })

const getTenant = (req: Request) => req.user!.tenantId

// ─── Journal des ventes ───────────────────────────────────────────────────────

export async function salesJournal(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = accountingFiltersSchema.parse(req.query)
    ok(res, await service.getSalesJournal(getTenant(req), filters))
  } catch (e) { next(e) }
}

// ─── Rapport TVA ──────────────────────────────────────────────────────────────

export async function vatReport(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = accountingFiltersSchema.parse(req.query)
    ok(res, await service.getVatReport(getTenant(req), filters))
  } catch (e) { next(e) }
}

// ─── Export FEC ───────────────────────────────────────────────────────────────

export async function fecExport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const year = Number(req.query.year)
    if (!year || year < 2020 || year > 2099) {
      fail(res, 'Paramètre year requis (2020-2099)', 400); return
    }
    const content = await service.exportFec(getTenant(req), year)

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="FEC_${year}_${getTenant(req)}.txt"`)
    res.send(content)
  } catch (e) { next(e) }
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

export async function csvExport(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = accountingFiltersSchema.parse(req.query)
    const content = await service.exportCsv(getTenant(req), filters)

    const suffix = filters.month
      ? `${filters.year}-${String(filters.month).padStart(2, '0')}`
      : filters.quarter
      ? `${filters.year}-T${filters.quarter}`
      : String(filters.year)

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="journal_ventes_${suffix}.csv"`)
    res.send('\uFEFF' + content) // BOM UTF-8 pour compatibilité Excel
  } catch (e) { next(e) }
}
