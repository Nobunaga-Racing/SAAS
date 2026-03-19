// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Factures
// Gère les requêtes HTTP, délègue au service, formate les réponses
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express'
import * as invoicesService from './invoices.service'
import { generateInvoicePdf } from '../pdf/invoice.pdf'
import { sendMail, isSmtpConfigured, invoiceEmailHtml } from '../email/email.service'
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  createPaymentSchema,
  createDepositSchema,
  invoiceFiltersSchema,
} from '@saas-gestion/validators'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok   = (res: Response, data: unknown, status = 200) => res.status(status).json({ data })
const fail = (res: Response, message: string, status = 400) => res.status(status).json({ error: { message } })

function getTenant(req: Request): string {
  return req.user!.tenantId
}
function getUser(req: Request): string {
  return req.user!.userId
}
const p = (req: Request, key: string): string => req.params[key] as string

// ─── Factures ─────────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = invoiceFiltersSchema.parse(req.query) as any
    const result  = await invoicesService.findAll(getTenant(req), filters)
    ok(res, result)
  } catch (e) { next(e) }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const raw = await invoicesService.findById(p(req, 'id'), getTenant(req))
    if (!raw) { fail(res, 'Facture introuvable', 404); return }
    ok(res, invoicesService.formatInvoice(raw))
  } catch (e) { next(e) }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto     = createInvoiceSchema.parse(req.body) as any
    const invoice = await invoicesService.createInvoice(dto, getTenant(req), getUser(req))
    ok(res, invoice, 201)
  } catch (e) { next(e) }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto     = updateInvoiceSchema.parse(req.body) as any
    const invoice = await invoicesService.updateInvoice(p(req, 'id'), dto, getTenant(req))
    ok(res, invoice)
  } catch (e) { next(e) }
}

export async function send(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await invoicesService.sendInvoice(p(req, 'id'), getTenant(req))
    ok(res, invoice)
  } catch (e) { next(e) }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await invoicesService.cancelInvoice(p(req, 'id'), getTenant(req))
    ok(res, invoice)
  } catch (e) { next(e) }
}

export async function creditNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const avoir = await invoicesService.createCreditNote(p(req, 'id'), getTenant(req), getUser(req))
    ok(res, avoir, 201)
  } catch (e) { next(e) }
}

// ─── Paiements ────────────────────────────────────────────────────────────────

export async function addPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto     = createPaymentSchema.parse(req.body)
    const invoice = await invoicesService.recordPayment(p(req, 'id'), dto, getTenant(req))
    ok(res, invoice, 201)
  } catch (e) { next(e) }
}

export async function removePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await invoicesService.deletePayment(p(req, 'paymentId'), p(req, 'id'), getTenant(req))
    res.status(204).send()
  } catch (e) { next(e) }
}

// ─── Acomptes ─────────────────────────────────────────────────────────────────

export async function addDeposit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto     = createDepositSchema.parse(req.body)
    const deposit = await invoicesService.createDeposit(p(req, 'id'), dto, getTenant(req))
    ok(res, deposit, 201)
  } catch (e) { next(e) }
}

export async function issueDepositInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const depInvoice = await invoicesService.generateDepositInvoice(
      p(req, 'depositId'),
      getTenant(req),
      getUser(req)
    )
    ok(res, depInvoice, 201)
  } catch (e) { next(e) }
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

export async function downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { invoice, settings } = await invoicesService.getInvoiceWithSettings(p(req, 'id'), getTenant(req))
    const pdfBuffer = await generateInvoicePdf({
      type:          'invoice',
      number:        invoice.number,
      issueDate:     invoice.issueDate,
      dueDate:       invoice.dueDate,
      subject:       invoice.subject,
      notes:         invoice.notes,
      footer:        invoice.footer,
      client:        invoice.client ?? { name: 'Client' },
      lines:         invoice.lines,
      subtotalHt:    invoice.subtotalHt,
      discountAmount:invoice.discountAmount,
      totalHt:       invoice.totalHt,
      totalVat:      invoice.totalVat,
      totalTtc:      invoice.totalTtc,
      amountPaid:    invoice.amountPaid,
      amountDue:     invoice.amountDue,
      settings,
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.number}.pdf"`)
    res.send(pdfBuffer)
  } catch (e) { next(e) }
}

// ─── Email ────────────────────────────────────────────────────────────────────

export async function sendByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { invoice, settings } = await invoicesService.getInvoiceWithSettings(p(req, 'id'), getTenant(req))
    if (!isSmtpConfigured(settings)) {
      fail(res, 'Email non configuré. Rendez-vous dans Paramètres → Configuration email.', 503); return
    }
    if (!invoice.client?.email && !req.body.to) {
      fail(res, 'Adresse email destinataire manquante', 400); return
    }
    const to = req.body.to ?? invoice.client!.email

    const pdfBuffer = await generateInvoicePdf({
      type: 'invoice', number: invoice.number,
      issueDate: invoice.issueDate, dueDate: invoice.dueDate,
      subject: invoice.subject, notes: invoice.notes, footer: invoice.footer,
      client: invoice.client ?? { name: 'Client' }, lines: invoice.lines,
      subtotalHt: invoice.subtotalHt, discountAmount: invoice.discountAmount,
      totalHt: invoice.totalHt, totalVat: invoice.totalVat, totalTtc: invoice.totalTtc,
      amountPaid: invoice.amountPaid, amountDue: invoice.amountDue, settings,
    })

    const ttc = invoice.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
    const due = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : undefined

    await sendMail({
      to,
      subject: `Facture ${invoice.number} — ${settings.companyName ?? ''}`,
      html: invoiceEmailHtml({
        clientName: invoice.client?.name ?? to,
        docType: 'facture', number: invoice.number,
        totalTtc: ttc, companyName: settings.companyName, dueOrExpiry: due,
        notes: invoice.notes,
      }),
      attachments: [{ filename: `${invoice.number}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
    }, settings)

    // Marquer comme envoyé si brouillon
    if (invoice.status === 'DRAFT') {
      await invoicesService.sendInvoice(invoice.id, getTenant(req))
    }

    ok(res, { sent: true, to })
  } catch (e) { next(e) }
}
