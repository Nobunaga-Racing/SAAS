// ─────────────────────────────────────────────────────────────────────────────
// Service — Module Paiements
// Vue transversale des paiements + délégation à invoices.service pour
// la logique de mise à jour du statut facture.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, InvoiceStatus, PaymentMethod } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { z } from 'zod'

const prisma = new PrismaClient()

// ─── Schémas de validation ────────────────────────────────────────────────────

export const createPaymentSchema = z.object({
  invoiceId:   z.string().uuid('Facture requise'),
  amount:      z.number().positive('Le montant doit être > 0'),
  method:      z.nativeEnum(PaymentMethod),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD attendu'),
  reference:   z.string().max(255).optional(),
  notes:       z.string().max(500).optional(),
})

export const paymentFiltersSchema = z.object({
  invoiceId: z.string().uuid().optional(),
  clientId:  z.string().uuid().optional(),
  method:    z.nativeEnum(PaymentMethod).optional(),
  dateFrom:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
})

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>
export type PaymentFilters  = z.infer<typeof paymentFiltersSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round(n: number) {
  return Math.round(n * 100) / 100
}

// ─── Liste paginée ────────────────────────────────────────────────────────────

export async function findAll(tenantId: string, filters: PaymentFilters) {
  const { page, limit, invoiceId, clientId, method, dateFrom, dateTo } = filters
  const skip = (page - 1) * limit

  const where: any = { tenantId }
  if (invoiceId) where.invoiceId = invoiceId
  if (method)    where.method    = method
  if (dateFrom || dateTo) {
    where.paymentDate = {}
    if (dateFrom) where.paymentDate.gte = new Date(dateFrom)
    if (dateTo)   where.paymentDate.lte = new Date(dateTo)
  }
  if (clientId) {
    where.invoice = { clientId }
  }

  const [total, data] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { paymentDate: 'desc' },
      include: {
        invoice: {
          select: {
            id: true, number: true, status: true, totalTtc: true, amountDue: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ])

  return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } }
}

// ─── Détail ───────────────────────────────────────────────────────────────────

export async function findById(paymentId: string, tenantId: string) {
  return prisma.payment.findFirst({
    where:   { id: paymentId, tenantId },
    include: {
      invoice: {
        select: {
          id: true, number: true, status: true, totalTtc: true,
          amountPaid: true, amountDue: true,
          client: { select: { id: true, name: true } },
        },
      },
    },
  })
}

// ─── Enregistrer un paiement ─────────────────────────────────────────────────

export async function recordPayment(dto: CreatePaymentDto, tenantId: string) {
  return prisma.$transaction(async (tx) => {
    // Vérifier la facture
    const invoice = await tx.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    })
    if (!invoice) throw new Error('Facture introuvable')
    if ((['PAID', 'CANCELLED'] as string[]).includes(invoice.status)) {
      throw new Error('Cette facture ne peut plus recevoir de paiement')
    }

    const currentDue = Number(invoice.amountDue)
    if (dto.amount > currentDue + 0.01) {
      throw new Error(`Paiement (${dto.amount} €) supérieur au solde dû (${round(currentDue)} €)`)
    }

    // Créer le paiement
    const payment = await tx.payment.create({
      data: {
        tenantId,
        invoiceId:   dto.invoiceId,
        amount:      new Decimal(dto.amount),
        method:      dto.method,
        paymentDate: new Date(dto.paymentDate),
        reference:   dto.reference,
        notes:       dto.notes,
      },
    })

    // Mettre à jour les totaux et le statut de la facture
    const newAmountPaid = round(Number(invoice.amountPaid) + dto.amount)
    const newAmountDue  = round(Math.max(0, Number(invoice.totalTtc) - Number(invoice.depositAmount) - newAmountPaid))
    const newStatus     = newAmountDue <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL

    await tx.invoice.update({
      where: { id: dto.invoiceId },
      data:  {
        amountPaid: new Decimal(newAmountPaid),
        amountDue:  new Decimal(newAmountDue),
        status:     newStatus,
        ...(newStatus === InvoiceStatus.PAID && { paidAt: new Date() }),
      },
    })

    return payment
  })
}

// ─── Supprimer un paiement ────────────────────────────────────────────────────

export async function removePayment(paymentId: string, tenantId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where:   { id: paymentId, tenantId },
      include: { invoice: true },
    })
    if (!payment) throw new Error('Paiement introuvable')

    const invoice = payment.invoice
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error('Impossible de supprimer un paiement sur une facture annulée')
    }

    await tx.payment.delete({ where: { id: paymentId } })

    const newAmountPaid = round(Math.max(0, Number(invoice.amountPaid) - Number(payment.amount)))
    const newAmountDue  = round(Number(invoice.totalTtc) - Number(invoice.depositAmount) - newAmountPaid)

    // Recalcul statut : si plus aucun paiement → SENT, sinon PARTIAL
    const remaining = await tx.payment.count({ where: { invoiceId: invoice.id } })
    const newStatus = remaining === 0 ? InvoiceStatus.SENT : InvoiceStatus.PARTIAL

    await tx.invoice.update({
      where: { id: invoice.id },
      data:  {
        amountPaid: new Decimal(newAmountPaid),
        amountDue:  new Decimal(newAmountDue),
        status:     newStatus,
        paidAt:     null,
      },
    })
  })
}

// ─── Statistiques ─────────────────────────────────────────────────────────────

export async function getStats(tenantId: string, dateFrom?: string, dateTo?: string) {
  const dateFilter: any = {}
  if (dateFrom) dateFilter.gte = new Date(dateFrom)
  if (dateTo)   dateFilter.lte = new Date(dateTo)

  const where: any = { tenantId }
  if (dateFrom || dateTo) where.paymentDate = dateFilter

  // Total encaissé
  const totalAgg = await prisma.payment.aggregate({
    where,
    _sum:   { amount: true },
    _count: { id: true },
  })

  // Répartition par méthode
  const byMethod = await prisma.payment.groupBy({
    by:     ['method'],
    where,
    _sum:   { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
  })

  // Évolution mensuelle (12 derniers mois)
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)

  const monthly = await prisma.$queryRaw<{ month: string; total: number; count: number }[]>`
    SELECT
      TO_CHAR(payment_date, 'YYYY-MM') AS month,
      SUM(amount)::numeric::float8      AS total,
      COUNT(*)::int                     AS count
    FROM payments
    WHERE tenant_id = ${tenantId}
      AND payment_date >= ${twelveMonthsAgo}
    GROUP BY month
    ORDER BY month ASC
  `

  // Factures en attente (SENT + PARTIAL)
  const outstandingAgg = await prisma.invoice.aggregate({
    where: { tenantId, status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] } },
    _sum:   { amountDue: true },
    _count: { id: true },
  })

  // Factures en retard (OVERDUE)
  const overdueAgg = await prisma.invoice.aggregate({
    where: { tenantId, status: InvoiceStatus.OVERDUE },
    _sum:   { amountDue: true },
    _count: { id: true },
  })

  return {
    totalCollected:  round(Number(totalAgg._sum.amount ?? 0)),
    totalPayments:   totalAgg._count.id,
    byMethod: byMethod.map((m) => ({
      method: m.method,
      total:  round(Number(m._sum.amount ?? 0)),
      count:  m._count.id,
    })),
    monthly,
    outstanding: {
      amount: round(Number(outstandingAgg._sum.amountDue ?? 0)),
      count:  outstandingAgg._count.id,
    },
    overdue: {
      amount: round(Number(overdueAgg._sum.amountDue ?? 0)),
      count:  overdueAgg._count.id,
    },
  }
}
