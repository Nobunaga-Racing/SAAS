// ─────────────────────────────────────────────────────────────────────────────
// Service — Module Comptabilité
// Journal ventes, rapport TVA, export FEC (Fichier des Écritures Comptables)
// Norme DGFiP — Plan Comptable Général français (PCG)
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, InvoiceStatus, InvoiceType, JournalEntryType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { z } from 'zod'

const prisma = new PrismaClient()

// ─── Comptes PCG ──────────────────────────────────────────────────────────────
// Plan Comptable Général — comptes standards pour la comptabilité simplifiée

const PCG = {
  CLIENTS:       '411000', // Clients — créances
  VENTES:        '706000', // Prestations de services / ventes
  TVA_COLLECTEE: '445710', // TVA collectée
  BANQUE:        '512000', // Banque
  AVOIRS_VENTES: '709000', // RRR accordés (avoirs)
} as const

// ─── Schémas de filtres ───────────────────────────────────────────────────────

export const accountingFiltersSchema = z.object({
  year:    z.coerce.number().int().min(2020).max(2099),
  month:   z.coerce.number().int().min(1).max(12).optional(),
  quarter: z.coerce.number().int().min(1).max(4).optional(),
})

export type AccountingFilters = z.infer<typeof accountingFiltersSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round(n: number) {
  return Math.round(n * 100) / 100
}

function dateRange(f: AccountingFilters): { from: Date; to: Date } {
  const { year, month, quarter } = f
  if (month) {
    return {
      from: new Date(year, month - 1, 1),
      to:   new Date(year, month, 0, 23, 59, 59),
    }
  }
  if (quarter) {
    const s = (quarter - 1) * 3
    return {
      from: new Date(year, s, 1),
      to:   new Date(year, s + 3, 0, 23, 59, 59),
    }
  }
  return {
    from: new Date(year, 0, 1),
    to:   new Date(year, 11, 31, 23, 59, 59),
  }
}

// Statuts donnant lieu à une écriture comptable (hors brouillon et annulé)
const POSTED_STATUSES = [
  InvoiceStatus.SENT,
  InvoiceStatus.PARTIAL,
  InvoiceStatus.PAID,
  InvoiceStatus.OVERDUE,
]

// ─── Journal des ventes ───────────────────────────────────────────────────────
// Vue chronologique de toutes les factures émises sur la période.
// Sert de base au rapprochement et au contrôle comptable.

export async function getSalesJournal(tenantId: string, filters: AccountingFilters) {
  const { from, to } = dateRange(filters)

  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      status:    { in: POSTED_STATUSES },
      issueDate: { gte: from, lte: to },
    },
    include: {
      client:     { select: { id: true, name: true } },
      vatSummary: { orderBy: { vatRate: 'asc' } },
    },
    orderBy: { issueDate: 'asc' },
  })

  return invoices.map((inv) => ({
    date:       inv.issueDate,
    reference:  inv.number,
    type:       inv.type,
    status:     inv.status,
    clientId:   inv.clientId,
    client:     inv.client.name,
    subject:    inv.subject,
    totalHt:    round(Number(inv.totalHt)),
    totalVat:   round(Number(inv.totalVat)),
    totalTtc:   round(Number(inv.totalTtc)),
    amountPaid: round(Number(inv.amountPaid)),
    amountDue:  round(Number(inv.amountDue)),
    vatLines: inv.vatSummary.map((v) => ({
      rate:      Number(v.vatRate),
      baseHt:    round(Number(v.baseHt)),
      vatAmount: round(Number(v.vatAmount)),
    })),
    pcg: {
      debit:  PCG.CLIENTS,
      credit: inv.type === InvoiceType.CREDIT_NOTE ? PCG.AVOIRS_VENTES : PCG.VENTES,
    },
  }))
}

// ─── Rapport TVA collectée ────────────────────────────────────────────────────
// Agrège la TVA par taux sur la période, avoirs déduits.
// Utilisé pour remplir la déclaration CA3 (mensuelle) ou CA12 (annuelle).

export async function getVatReport(tenantId: string, filters: AccountingFilters) {
  const { from, to } = dateRange(filters)

  const allVatRows = await prisma.vatSummary.findMany({
    where: {
      invoice: {
        tenantId,
        status:    { in: POSTED_STATUSES },
        issueDate: { gte: from, lte: to },
      },
    },
    include: {
      invoice: { select: { type: true } },
    },
  })

  // Agréger par taux — signe négatif pour les avoirs
  const vatMap = new Map<number, { baseHt: number; vatAmount: number }>()
  for (const row of allVatRows) {
    const rate  = Number(row.vatRate)
    const sign  = row.invoice.type === InvoiceType.CREDIT_NOTE ? -1 : 1
    const entry = vatMap.get(rate) ?? { baseHt: 0, vatAmount: 0 }
    entry.baseHt    = round(entry.baseHt    + sign * Number(row.baseHt))
    entry.vatAmount = round(entry.vatAmount + sign * Number(row.vatAmount))
    vatMap.set(rate, entry)
  }

  const vatLines = Array.from(vatMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([rate, v]) => ({ rate, baseHt: v.baseHt, vatAmount: v.vatAmount }))

  // CA HT et encaissements
  const [salesAgg, creditAgg, paymentsAgg] = await Promise.all([
    prisma.invoice.aggregate({
      where: { tenantId, status: { in: POSTED_STATUSES }, type: { not: InvoiceType.CREDIT_NOTE }, issueDate: { gte: from, lte: to } },
      _sum:   { totalHt: true, totalTtc: true },
      _count: { id: true },
    }),
    prisma.invoice.aggregate({
      where: { tenantId, status: { in: POSTED_STATUSES }, type: InvoiceType.CREDIT_NOTE, issueDate: { gte: from, lte: to } },
      _sum:   { totalHt: true, totalTtc: true },
      _count: { id: true },
    }),
    prisma.payment.aggregate({
      where: { tenantId, paymentDate: { gte: from, lte: to } },
      _sum: { amount: true }, _count: { id: true },
    }),
  ])

  return {
    period: { year: filters.year, month: filters.month, quarter: filters.quarter, from, to },
    vatLines,
    totals: {
      baseHt:    round(vatLines.reduce((s, l) => s + l.baseHt, 0)),
      vatAmount: round(vatLines.reduce((s, l) => s + l.vatAmount, 0)),
    },
    revenue: {
      invoiceCount: salesAgg._count.id,
      creditCount:  creditAgg._count.id,
      totalHt:  round(Number(salesAgg._sum.totalHt  ?? 0) - Number(creditAgg._sum.totalHt  ?? 0)),
      totalTtc: round(Number(salesAgg._sum.totalTtc ?? 0) - Number(creditAgg._sum.totalTtc ?? 0)),
    },
    collected: {
      count:  paymentsAgg._count.id,
      amount: round(Number(paymentsAgg._sum.amount ?? 0)),
    },
  }
}

// ─── Export FEC ───────────────────────────────────────────────────────────────
// Fichier des Écritures Comptables — norme DGFiP (article A47 A-1 du LPF)
// Séparateur |  —  encodage UTF-8  —  CRLF
// Transmissible directement à l'expert-comptable ou à l'administration fiscale.

export async function exportFec(tenantId: string, year: number): Promise<string> {
  const { from, to } = dateRange({ year })

  const [invoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: { tenantId, status: { in: POSTED_STATUSES }, issueDate: { gte: from, lte: to } },
      include: {
        client:     { select: { id: true, name: true } },
        vatSummary: { orderBy: { vatRate: 'asc' } },
      },
      orderBy: { issueDate: 'asc' },
    }),
    prisma.payment.findMany({
      where: { tenantId, paymentDate: { gte: from, lte: to } },
      include: {
        invoice: { select: { number: true, client: { select: { id: true, name: true } } } },
      },
      orderBy: { paymentDate: 'asc' },
    }),
  ])

  const HEADER = [
    'JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate',
    'CompteNum', 'CompteLib', 'CompteAuxNum', 'CompteAuxLib',
    'PieceRef', 'PieceDate', 'EcritureLib',
    'Debit', 'Credit', 'EcritureLet', 'DateLet', 'ValidDate',
    'Montantdevise', 'Idevise',
  ].join('|')

  const rows: string[] = [HEADER]
  let seq = 1

  const fmtDate = (dt: Date) => dt.toISOString().slice(0, 10).replace(/-/g, '')
  const fmtAmt  = (n: number) => n.toFixed(2).replace('.', ',')
  const nextNum  = () => String(seq++).padStart(8, '0')

  // ── Factures et avoirs ───────────────────────────────────────────────────

  for (const inv of invoices) {
    const isAvoir  = inv.type === InvoiceType.CREDIT_NOTE
    const jCode    = isAvoir ? 'AV' : 'VE'
    const jLib     = isAvoir ? 'Avoirs' : 'Ventes'
    const date     = fmtDate(inv.issueDate)
    const totalHt  = round(Number(inv.totalHt))
    const totalTtc = round(Number(inv.totalTtc))

    // 411 Clients — débit vente / crédit avoir
    rows.push([
      jCode, jLib, nextNum(), date,
      PCG.CLIENTS, 'Clients',
      inv.clientId, inv.client.name,
      inv.number, date, inv.subject,
      isAvoir ? fmtAmt(0) : fmtAmt(totalTtc),
      isAvoir ? fmtAmt(totalTtc) : fmtAmt(0),
      '', '', date, '', 'EUR',
    ].join('|'))

    // 706 Ventes — crédit vente / débit avoir
    rows.push([
      jCode, jLib, nextNum(), date,
      isAvoir ? PCG.AVOIRS_VENTES : PCG.VENTES,
      isAvoir ? 'Avoirs sur ventes' : 'Prestations et ventes',
      '', '',
      inv.number, date, inv.subject,
      isAvoir ? fmtAmt(totalHt) : fmtAmt(0),
      isAvoir ? fmtAmt(0) : fmtAmt(totalHt),
      '', '', date, '', 'EUR',
    ].join('|'))

    // 445710 TVA collectée — une ligne par taux (si TVA > 0)
    for (const v of inv.vatSummary) {
      const vatAmt = round(Number(v.vatAmount))
      if (vatAmt === 0) continue
      rows.push([
        jCode, jLib, nextNum(), date,
        PCG.TVA_COLLECTEE, `TVA collectée ${Number(v.vatRate)}%`,
        '', '',
        inv.number, date, `TVA ${Number(v.vatRate)}% — ${inv.number}`,
        isAvoir ? fmtAmt(vatAmt) : fmtAmt(0),
        isAvoir ? fmtAmt(0) : fmtAmt(vatAmt),
        '', '', date, '', 'EUR',
      ].join('|'))
    }
  }

  // ── Encaissements ────────────────────────────────────────────────────────

  for (const pay of payments) {
    const date   = fmtDate(pay.paymentDate)
    const payAmt = round(Number(pay.amount))
    const ref    = pay.reference ?? pay.id.slice(0, 8).toUpperCase()
    const label  = `Règlt ${pay.invoice.number}`

    // 512 Banque — débit (entrée de trésorerie)
    rows.push([
      'BQ', 'Banque', nextNum(), date,
      PCG.BANQUE, 'Banque',
      '', '',
      ref, date, label,
      fmtAmt(payAmt), fmtAmt(0),
      '', '', date, '', 'EUR',
    ].join('|'))

    // 411 Clients — crédit (extinction de la créance)
    rows.push([
      'BQ', 'Banque', nextNum(), date,
      PCG.CLIENTS, 'Clients',
      pay.invoice.client.id, pay.invoice.client.name,
      ref, date, label,
      fmtAmt(0), fmtAmt(payAmt),
      '', '', date, '', 'EUR',
    ].join('|'))
  }

  return rows.join('\r\n') // CRLF requis par la norme DGFiP
}

// ─── Export CSV simple ────────────────────────────────────────────────────────
// Format lisible dans Excel / LibreOffice Calc — séparateur ;

export async function exportCsv(tenantId: string, filters: AccountingFilters): Promise<string> {
  const journal = await getSalesJournal(tenantId, filters)

  const HEADER = [
    'Date', 'Numéro', 'Type', 'Statut', 'Client', 'Objet',
    'Total HT', 'Total TVA', 'Total TTC', 'Payé', 'Solde',
  ].join(';')

  const rows = journal.map((j) => [
    new Date(j.date).toLocaleDateString('fr-FR'),
    j.reference,
    j.type,
    j.status,
    `"${j.client.replace(/"/g, '""')}"`,
    `"${j.subject.replace(/"/g, '""')}"`,
    j.totalHt.toFixed(2),
    j.totalVat.toFixed(2),
    j.totalTtc.toFixed(2),
    j.amountPaid.toFixed(2),
    j.amountDue.toFixed(2),
  ].join(';'))

  return [HEADER, ...rows].join('\n')
}

// ─── Persistance des écritures comptables ────────────────────────────────────
// Appelé lors du passage d'une facture au statut SENT (depuis invoices.service).
// Génère les lignes JournalEntry immuables pour l'audit trail légal.

export async function postInvoiceEntries(invoiceId: string, tenantId: string) {
  const inv = await prisma.invoice.findFirst({
    where:   { id: invoiceId, tenantId },
    include: { vatSummary: true },
  })
  if (!inv) throw new Error('Facture introuvable')

  // Idempotent — ne pas créer les écritures en double
  const exists = await prisma.journalEntry.count({ where: { invoiceId } })
  if (exists > 0) return

  const isAvoir = inv.type === InvoiceType.CREDIT_NOTE
  const jCode   = isAvoir ? 'AV' : 'VE'
  const jLib    = isAvoir ? 'Avoirs' : 'Ventes'
  const type    = isAvoir ? JournalEntryType.CREDIT_NOTE : JournalEntryType.SALE

  const entries: any[] = [
    // Écriture principale (411 ↔ 706)
    {
      tenantId, invoiceId,
      entryType:    type,
      journalCode:  jCode,
      journalLib:   jLib,
      date:         inv.issueDate,
      reference:    inv.number,
      label:        inv.subject,
      accountDebit:  isAvoir ? PCG.AVOIRS_VENTES : PCG.CLIENTS,
      accountCredit: isAvoir ? PCG.CLIENTS        : PCG.VENTES,
      amountHt:  new Decimal(Number(inv.totalHt)),
      amountVat: new Decimal(Number(inv.totalVat)),
      amountTtc: new Decimal(Number(inv.totalTtc)),
      isPosted:  true,
    },
  ]

  // Lignes TVA par taux
  for (const v of inv.vatSummary) {
    const vatAmt = round(Number(v.vatAmount))
    if (vatAmt === 0) continue
    entries.push({
      tenantId, invoiceId,
      entryType:    type,
      journalCode:  jCode,
      journalLib:   jLib,
      date:         inv.issueDate,
      reference:    inv.number,
      label:        `TVA ${Number(v.vatRate)}% — ${inv.number}`,
      accountDebit:  isAvoir ? PCG.TVA_COLLECTEE : PCG.VENTES,
      accountCredit: isAvoir ? PCG.VENTES        : PCG.TVA_COLLECTEE,
      amountHt:  new Decimal(0),
      amountVat: new Decimal(vatAmt),
      amountTtc: new Decimal(vatAmt),
      vatRate:   v.vatRate,
      isPosted:  true,
    })
  }

  await prisma.journalEntry.createMany({ data: entries })
}

// Appelé lors de l'enregistrement d'un paiement (depuis payments.service).
export async function postPaymentEntry(paymentId: string, tenantId: string) {
  const pay = await prisma.payment.findFirst({
    where:   { id: paymentId, tenantId },
    include: { invoice: { select: { number: true } } },
  })
  if (!pay) throw new Error('Paiement introuvable')

  const exists = await prisma.journalEntry.count({ where: { paymentId } })
  if (exists > 0) return

  await prisma.journalEntry.create({
    data: {
      tenantId, paymentId,
      entryType:    JournalEntryType.RECEIPT,
      journalCode:  'BQ',
      journalLib:   'Banque',
      date:         pay.paymentDate,
      reference:    pay.reference ?? paymentId.slice(0, 8).toUpperCase(),
      label:        `Règlt ${pay.invoice.number}`,
      accountDebit:  PCG.BANQUE,
      accountCredit: PCG.CLIENTS,
      amountHt:  pay.amount,
      amountVat: new Decimal(0),
      amountTtc: pay.amount,
      isPosted:  true,
    },
  })
}
