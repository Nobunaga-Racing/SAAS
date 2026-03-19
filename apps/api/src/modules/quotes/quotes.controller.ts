// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Devis
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express'
import * as service from './quotes.service'
import { generateInvoicePdf } from '../pdf/invoice.pdf'
import { sendMail, isSmtpConfigured, invoiceEmailHtml } from '../email/email.service'
import {
  createQuoteSchema,
  updateQuoteSchema,
  rejectQuoteSchema,
  quoteFiltersSchema,
} from './quotes.validators'

const ok   = (res: Response, data: unknown, status = 200) => res.status(status).json({ data })
const fail = (res: Response, message: string, status = 400) => res.status(status).json({ error: { message } })

const getTenant = (req: Request) => req.user!.tenantId
const getUser   = (req: Request) => req.user!.userId
const p         = (req: Request, key: string): string => req.params[key] as string

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await service.findAll(getTenant(req), quoteFiltersSchema.parse(req.query)))
  } catch (e) { next(e) }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const quote = await service.findById(p(req, 'id'), getTenant(req))
    if (!quote) { fail(res, 'Devis introuvable', 404); return }
    ok(res, quote)
  } catch (e) { next(e) }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = createQuoteSchema.parse(req.body)
    ok(res, await service.createQuote(dto, getTenant(req), getUser(req)), 201)
  } catch (e) { next(e) }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = updateQuoteSchema.parse(req.body)
    ok(res, await service.updateQuote(p(req, 'id'), dto, getTenant(req)))
  } catch (e) { next(e) }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.deleteQuote(p(req, 'id'), getTenant(req))
    res.status(204).send()
  } catch (e) { next(e) }
}

// ─── Transitions de statut ────────────────────────────────────────────────────

export async function send(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await service.sendQuote(p(req, 'id'), getTenant(req)))
  } catch (e) { next(e) }
}

export async function accept(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await service.acceptQuote(p(req, 'id'), getTenant(req)))
  } catch (e) { next(e) }
}

export async function reject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = rejectQuoteSchema.parse(req.body)
    ok(res, await service.rejectQuote(p(req, 'id'), dto, getTenant(req)))
  } catch (e) { next(e) }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function convert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await service.convertToInvoice(p(req, 'id'), getTenant(req), getUser(req)), 201)
  } catch (e) { next(e) }
}

export async function duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await service.duplicateQuote(p(req, 'id'), getTenant(req), getUser(req)), 201)
  } catch (e) { next(e) }
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

export async function downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quote, settings } = await service.getQuoteWithSettings(p(req, 'id'), getTenant(req))
    const pdfBuffer = await generateInvoicePdf({
      type:          'quote',
      number:        quote.number,
      issueDate:     quote.issueDate,
      expiryDate:    quote.expiryDate,
      subject:       quote.subject,
      notes:         quote.notes,
      footer:        quote.footer,
      client:        quote.client ?? { name: 'Client' },
      lines:         quote.lines,
      subtotalHt:    quote.totals.subtotalHt,
      discountAmount:quote.totals.discountAmount,
      totalHt:       quote.totals.totalHt,
      totalVat:      quote.totals.totalVat,
      totalTtc:      quote.totals.totalTtc,
      settings,
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${quote.number}.pdf"`)
    res.send(pdfBuffer)
  } catch (e) { next(e) }
}

// ─── Email ────────────────────────────────────────────────────────────────────

export async function sendByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quote, settings } = await service.getQuoteWithSettings(p(req, 'id'), getTenant(req))
    if (!isSmtpConfigured(settings)) {
      fail(res, 'Email non configuré. Rendez-vous dans Paramètres → Configuration email.', 503); return
    }
    if (!quote.client?.email && !req.body.to) {
      fail(res, 'Adresse email destinataire manquante', 400); return
    }
    const to = req.body.to ?? quote.client!.email

    const pdfBuffer = await generateInvoicePdf({
      type: 'quote', number: quote.number,
      issueDate: quote.issueDate, expiryDate: quote.expiryDate,
      subject: quote.subject, notes: quote.notes, footer: quote.footer,
      client: quote.client ?? { name: 'Client' }, lines: quote.lines,
      subtotalHt: quote.totals.subtotalHt, discountAmount: quote.totals.discountAmount,
      totalHt: quote.totals.totalHt, totalVat: quote.totals.totalVat,
      totalTtc: quote.totals.totalTtc, settings,
    })

    const ttc = quote.totals.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
    const expiry = quote.expiryDate ? new Date(quote.expiryDate).toLocaleDateString('fr-FR') : undefined

    await sendMail({
      to,
      subject: `Devis ${quote.number} — ${settings.companyName ?? ''}`,
      html: invoiceEmailHtml({
        clientName: quote.client?.name ?? to,
        docType: 'devis', number: quote.number,
        totalTtc: ttc, companyName: settings.companyName, dueOrExpiry: expiry,
        notes: quote.notes,
      }),
      attachments: [{ filename: `${quote.number}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
    }, settings)

    if (quote.status === 'DRAFT') {
      await service.sendQuote(quote.id, getTenant(req))
    }

    ok(res, { sent: true, to })
  } catch (e) { next(e) }
}
