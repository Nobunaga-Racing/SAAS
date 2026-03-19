// ─────────────────────────────────────────────────────────────────────────────
// Service — Module Factures
// Logique métier : calculs, statuts, acomptes, paiements
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, InvoiceStatus, InvoiceType, DepositStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreatePaymentDto,
  CreateDepositDto,
  InvoiceFilters,
  InvoiceLineCalculated,
  VatSummaryLine,
  InvoiceTotals,
} from './invoices.types'
import { DiscountType } from './invoices.types'

const prisma = new PrismaClient()

// ─── Include standard ─────────────────────────────────────────────────────────

const INVOICE_INCLUDE = {
  client:     { select: { id: true, name: true, email: true } },
  lines:      { orderBy: { position: 'asc' as const } },
  vatSummary: true,
  payments:   { orderBy: { paymentDate: 'desc' as const } },
  deposits:   true,
} as const

// ─── Calculs ──────────────────────────────────────────────────────────────────

/**
 * Calcule les montants d'une ligne de facture.
 * Arrondis à 2 décimales (règle comptable).
 */
export function calculateLine(line: CreateInvoiceDto['lines'][0]): InvoiceLineCalculated {
  const lineBaseHt = round(line.quantity * line.unitPrice)

  let lineDiscountAmt = 0
  if (line.discountType && line.discountValue) {
    lineDiscountAmt =
      line.discountType === DiscountType.PERCENT
        ? round(lineBaseHt * (line.discountValue / 100))
        : round(line.discountValue)
  }

  const lineTotalHt   = round(lineBaseHt - lineDiscountAmt)
  const lineVatAmount = round(lineTotalHt * (line.vatRate / 100))
  const lineTotalTtc  = round(lineTotalHt + lineVatAmount)

  return { ...line, lineBaseHt, lineDiscountAmt, lineTotalHt, lineVatAmount, lineTotalTtc }
}

/**
 * Calcule les totaux d'une facture depuis ses lignes calculées.
 * La remise globale est appliquée sur le sous-total HT, puis répartie
 * proportionnellement sur chaque ligne pour le récap TVA.
 */
export function calculateTotals(
  calculatedLines: InvoiceLineCalculated[],
  discountType?: DiscountType,
  discountValue?: number,
  depositAmount: number = 0,
  amountPaid: number = 0
): InvoiceTotals {
  const subtotalHt = round(calculatedLines.reduce((s, l) => s + l.lineTotalHt, 0))

  let discountAmount = 0
  if (discountType && discountValue) {
    discountAmount =
      discountType === DiscountType.PERCENT
        ? round(subtotalHt * (discountValue / 100))
        : round(Math.min(discountValue, subtotalHt))
  }

  const totalHt      = round(subtotalHt - discountAmount)
  const discountRatio = subtotalHt > 0 ? totalHt / subtotalHt : 1

  // Récapitulatif TVA groupé par taux
  const vatMap = new Map<number, { baseHt: number; vatAmount: number }>()
  for (const line of calculatedLines) {
    const adjustedHt = round(line.lineTotalHt * discountRatio)
    const vat        = round(adjustedHt * (line.vatRate / 100))
    const entry      = vatMap.get(line.vatRate)
    if (entry) {
      entry.baseHt    = round(entry.baseHt + adjustedHt)
      entry.vatAmount = round(entry.vatAmount + vat)
    } else {
      vatMap.set(line.vatRate, { baseHt: adjustedHt, vatAmount: vat })
    }
  }

  const vatSummary: VatSummaryLine[] = Array.from(vatMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([vatRate, v]) => ({ vatRate, ...v }))

  const totalVat = round(vatSummary.reduce((s, v) => s + v.vatAmount, 0))
  const totalTtc = round(totalHt + totalVat)
  const amountDue = round(Math.max(0, totalTtc - depositAmount - amountPaid))

  return { subtotalHt, discountAmount, totalHt, vatSummary, totalVat, totalTtc, depositAmount, amountDue }
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

// ─── Numérotation ─────────────────────────────────────────────────────────────

async function generateNumber(tenantId: string, type: InvoiceType): Promise<string> {
  const year   = new Date().getFullYear()
  const prefix = type === InvoiceType.DEPOSIT_INVOICE ? 'ACPT'
    : type === InvoiceType.CREDIT_NOTE ? 'AV'
    : 'FAC'

  const count = await prisma.invoice.count({
    where: { tenantId, type, number: { startsWith: `${prefix}-${year}` } },
  })

  return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createInvoice(dto: CreateInvoiceDto, tenantId: string, userId: string) {
  const type = dto.type ?? InvoiceType.INVOICE

  return prisma.$transaction(async (tx) => {
    const number          = await generateNumber(tenantId, type)
    const calculatedLines = dto.lines.map(calculateLine)
    const totals          = calculateTotals(
      calculatedLines,
      dto.discountType as DiscountType | undefined,
      dto.discountValue,
      dto.depositAmount ?? 0,
      0
    )

    return tx.invoice.create({
      data: {
        tenantId,
        clientId:      dto.clientId,
        quoteId:       dto.quoteId,
        number,
        type,
        status:        InvoiceStatus.DRAFT,
        issueDate:     new Date(dto.issueDate),
        dueDate:       new Date(dto.dueDate),
        subject:       dto.subject,
        notes:         dto.notes,
        footer:        dto.footer,
        discountType:  dto.discountType as any,
        discountValue: dto.discountValue ? new Decimal(dto.discountValue) : null,
        depositAmount: new Decimal(dto.depositAmount ?? 0),
        subtotalHt:    new Decimal(totals.subtotalHt),
        discountAmount:new Decimal(totals.discountAmount),
        totalHt:       new Decimal(totals.totalHt),
        totalVat:      new Decimal(totals.totalVat),
        totalTtc:      new Decimal(totals.totalTtc),
        amountPaid:    new Decimal(0),
        amountDue:     new Decimal(totals.amountDue),
        createdBy:     userId,
        lines: {
          create: calculatedLines.map((l) => ({
            productId:      l.productId,
            description:    l.description,
            quantity:       new Decimal(l.quantity),
            unitPrice:      new Decimal(l.unitPrice),
            vatRate:        new Decimal(l.vatRate),
            discountType:   l.discountType as any,
            discountValue:  l.discountValue ? new Decimal(l.discountValue) : null,
            lineBaseHt:     new Decimal(l.lineBaseHt),
            lineDiscountAmt:new Decimal(l.lineDiscountAmt),
            lineTotalHt:    new Decimal(l.lineTotalHt),
            lineVatAmount:  new Decimal(l.lineVatAmount),
            lineTotalTtc:   new Decimal(l.lineTotalTtc),
            position:       l.position,
          })),
        },
        vatSummary: {
          create: totals.vatSummary.map((v) => ({
            vatRate:   new Decimal(v.vatRate),
            baseHt:    new Decimal(v.baseHt),
            vatAmount: new Decimal(v.vatAmount),
          })),
        },
      },
      include: INVOICE_INCLUDE,
    })
  })
}

export async function updateInvoice(invoiceId: string, dto: UpdateInvoiceDto, tenantId: string) {
  const invoice = await findByIdOrThrow(invoiceId, tenantId)
  if (invoice.status !== InvoiceStatus.DRAFT) throw new Error('Seul un brouillon peut être modifié')

  return prisma.$transaction(async (tx) => {
    const linesToUse = dto.lines
      ? dto.lines.map(calculateLine)
      : invoice.lines.map((l) => ({
          ...l,
          quantity:       Number(l.quantity),
          unitPrice:      Number(l.unitPrice),
          vatRate:        Number(l.vatRate),
          discountType:   l.discountType as DiscountType | undefined,
          discountValue:  l.discountValue ? Number(l.discountValue) : undefined,
          lineBaseHt:     Number(l.lineBaseHt),
          lineDiscountAmt:Number(l.lineDiscountAmt),
          lineTotalHt:    Number(l.lineTotalHt),
          lineVatAmount:  Number(l.lineVatAmount),
          lineTotalTtc:   Number(l.lineTotalTtc),
        }))

    const totals = calculateTotals(
      linesToUse as InvoiceLineCalculated[],
      (dto.discountType ?? invoice.discountType) as DiscountType | undefined,
      dto.discountValue ?? (invoice.discountValue ? Number(invoice.discountValue) : undefined),
      dto.depositAmount ?? Number(invoice.depositAmount),
      Number(invoice.amountPaid)
    )

    if (dto.lines) {
      await tx.invoiceLine.deleteMany({ where: { invoiceId } })
      await tx.vatSummary.deleteMany({ where: { invoiceId } })
    }

    return tx.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(dto.issueDate  && { issueDate:    new Date(dto.issueDate) }),
        ...(dto.dueDate    && { dueDate:      new Date(dto.dueDate) }),
        ...(dto.subject    && { subject:      dto.subject }),
        ...(dto.notes      !== undefined && { notes:   dto.notes }),
        ...(dto.footer     !== undefined && { footer:  dto.footer }),
        ...(dto.discountType  && { discountType:  dto.discountType as any }),
        ...(dto.discountValue !== undefined && { discountValue: dto.discountValue ? new Decimal(dto.discountValue) : null }),
        ...(dto.depositAmount !== undefined && { depositAmount: new Decimal(dto.depositAmount) }),
        subtotalHt:    new Decimal(totals.subtotalHt),
        discountAmount:new Decimal(totals.discountAmount),
        totalHt:       new Decimal(totals.totalHt),
        totalVat:      new Decimal(totals.totalVat),
        totalTtc:      new Decimal(totals.totalTtc),
        amountDue:     new Decimal(totals.amountDue),
        ...(dto.lines && {
          lines: {
            create: linesToUse.map((l) => ({
              productId:      l.productId,
              description:    l.description,
              quantity:       new Decimal(l.quantity),
              unitPrice:      new Decimal(l.unitPrice),
              vatRate:        new Decimal(l.vatRate),
              discountType:   l.discountType as any,
              discountValue:  l.discountValue ? new Decimal(l.discountValue) : null,
              lineBaseHt:     new Decimal(l.lineBaseHt),
              lineDiscountAmt:new Decimal(l.lineDiscountAmt),
              lineTotalHt:    new Decimal(l.lineTotalHt),
              lineVatAmount:  new Decimal(l.lineVatAmount),
              lineTotalTtc:   new Decimal(l.lineTotalTtc),
              position:       l.position,
            })),
          },
          vatSummary: {
            create: totals.vatSummary.map((v) => ({
              vatRate: new Decimal(v.vatRate), baseHt: new Decimal(v.baseHt), vatAmount: new Decimal(v.vatAmount),
            })),
          },
        }),
      },
      include: INVOICE_INCLUDE,
    })
  })
}

export async function findAll(tenantId: string, filters: InvoiceFilters) {
  const { page = 1, limit = 20, status, type, clientId, dateFrom, dateTo, overdue, search } = filters
  const skip  = (page - 1) * limit
  const where: any = { tenantId }

  if (status)   where.status   = status
  if (type)     where.type     = type
  if (clientId) where.clientId = clientId
  if (dateFrom || dateTo) {
    where.issueDate = {}
    if (dateFrom) where.issueDate.gte = new Date(dateFrom)
    if (dateTo)   where.issueDate.lte = new Date(dateTo)
  }
  if (overdue) {
    where.status  = { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] }
    where.dueDate = { lt: new Date() }
  }
  if (search) {
    where.OR = [
      { number:  { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, data] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: INVOICE_INCLUDE,
    }),
  ])

  return { data: data.map(formatInvoice), meta: { total, page, limit, pages: Math.ceil(total / limit) } }
}

export async function findById(invoiceId: string, tenantId: string) {
  return prisma.invoice.findFirst({
    where:   { id: invoiceId, tenantId },
    include: { lines: { orderBy: { position: 'asc' } }, vatSummary: true, payments: true, deposits: true },
  })
}

// ─── Transitions de statut ────────────────────────────────────────────────────

export async function sendInvoice(invoiceId: string, tenantId: string) {
  const invoice = await findByIdOrThrow(invoiceId, tenantId)
  if (invoice.status !== InvoiceStatus.DRAFT) throw new Error('Seul un brouillon peut être envoyé')
  return prisma.invoice.update({ where: { id: invoiceId }, data: { status: InvoiceStatus.SENT, sentAt: new Date() } })
}

export async function cancelInvoice(invoiceId: string, tenantId: string) {
  const invoice = await findByIdOrThrow(invoiceId, tenantId)
  if ((['PAID', 'CANCELLED'] as string[]).includes(invoice.status)) {
    throw new Error('Cette facture ne peut pas être annulée')
  }
  return prisma.invoice.update({ where: { id: invoiceId }, data: { status: InvoiceStatus.CANCELLED } })
}

export async function createCreditNote(invoiceId: string, tenantId: string, userId: string) {
  const invoice = await findByIdOrThrow(invoiceId, tenantId)
  if (invoice.type !== InvoiceType.INVOICE) throw new Error('Seule une facture peut générer un avoir')

  return prisma.$transaction(async (tx) => {
    const number = await generateNumber(tenantId, InvoiceType.CREDIT_NOTE)
    return tx.invoice.create({
      data: {
        tenantId,
        clientId:      invoice.clientId,
        number,
        type:          InvoiceType.CREDIT_NOTE,
        status:        InvoiceStatus.DRAFT,
        issueDate:     new Date(),
        dueDate:       new Date(),
        subject:       `Avoir sur ${invoice.number}`,
        discountType:  invoice.discountType,
        discountValue: invoice.discountValue,
        depositAmount: new Decimal(0),
        subtotalHt:    invoice.subtotalHt,
        discountAmount:invoice.discountAmount,
        totalHt:       invoice.totalHt,
        totalVat:      invoice.totalVat,
        totalTtc:      invoice.totalTtc,
        amountPaid:    new Decimal(0),
        amountDue:     invoice.totalTtc,
        createdBy:     userId,
        lines: {
          create: invoice.lines.map((l) => ({ ...l, id: undefined, invoiceId: undefined })),
        },
        vatSummary: {
          create: invoice.vatSummary.map((v) => ({ ...v, id: undefined, invoiceId: undefined })),
        },
      },
      include: INVOICE_INCLUDE,
    })
  })
}

// ─── Paiements ────────────────────────────────────────────────────────────────

export async function recordPayment(invoiceId: string, dto: CreatePaymentDto, tenantId: string) {
  const invoice = await findByIdOrThrow(invoiceId, tenantId)

  if ((['PAID', 'CANCELLED'] as string[]).includes(invoice.status)) {
    throw new Error('Cette facture ne peut plus recevoir de paiement')
  }
  const currentDue = Number(invoice.amountDue)
  if (dto.amount > currentDue + 0.01) {
    throw new Error(`Paiement (${dto.amount} €) > solde dû (${currentDue} €)`)
  }

  return prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        tenantId, invoiceId,
        amount:      new Decimal(dto.amount),
        method:      dto.method as any,
        reference:   dto.reference,
        paymentDate: new Date(dto.paymentDate),
        notes:       dto.notes,
      },
    })

    const newAmountPaid = round(Number(invoice.amountPaid) + dto.amount)
    const newAmountDue  = round(Math.max(0, Number(invoice.totalTtc) - Number(invoice.depositAmount) - newAmountPaid))
    const newStatus     = newAmountDue <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL

    return tx.invoice.update({
      where: { id: invoiceId },
      data:  {
        amountPaid: new Decimal(newAmountPaid),
        amountDue:  new Decimal(newAmountDue),
        status:     newStatus,
        ...(newStatus === InvoiceStatus.PAID && { paidAt: new Date() }),
      },
      include: INVOICE_INCLUDE,
    })
  })
}

export async function deletePayment(paymentId: string, invoiceId: string, tenantId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({ where: { id: paymentId, invoiceId, tenantId } })
    if (!payment) throw new Error('Paiement introuvable')

    await tx.payment.delete({ where: { id: paymentId } })

    const invoice       = await findByIdOrThrow(invoiceId, tenantId)
    const newAmountPaid = round(Math.max(0, Number(invoice.amountPaid) - Number(payment.amount)))
    const newAmountDue  = round(Number(invoice.totalTtc) - Number(invoice.depositAmount) - newAmountPaid)
    const newStatus     = newAmountPaid === 0 ? InvoiceStatus.SENT : InvoiceStatus.PARTIAL

    return tx.invoice.update({
      where: { id: invoiceId },
      data:  { amountPaid: new Decimal(newAmountPaid), amountDue: new Decimal(newAmountDue), status: newStatus, paidAt: null },
    })
  })
}

// ─── Acomptes ─────────────────────────────────────────────────────────────────

export async function createDeposit(invoiceId: string, dto: CreateDepositDto, tenantId: string) {
  const invoice = await findByIdOrThrow(invoiceId, tenantId)

  const amountResolved =
    dto.amountType === DiscountType.PERCENT
      ? round(Number(invoice.totalTtc) * (dto.amountValue / 100))
      : dto.amountValue

  if (amountResolved > Number(invoice.totalTtc)) {
    throw new Error("L'acompte dépasse le montant total TTC de la facture")
  }

  const deposit = await prisma.deposit.create({
    data: {
      tenantId, invoiceId,
      amountType:     dto.amountType as any,
      amountValue:    new Decimal(dto.amountValue),
      amountResolved: new Decimal(amountResolved),
      status:         DepositStatus.PENDING,
      dueDate:        new Date(dto.dueDate),
      notes:          dto.notes,
    },
  })

  const newDepositAmount = round(Number(invoice.depositAmount) + amountResolved)
  const newAmountDue     = round(Math.max(0, Number(invoice.totalTtc) - newDepositAmount - Number(invoice.amountPaid)))

  await prisma.invoice.update({
    where: { id: invoiceId },
    data:  { depositAmount: new Decimal(newDepositAmount), amountDue: new Decimal(newAmountDue) },
  })

  return deposit
}

export async function generateDepositInvoice(depositId: string, tenantId: string, userId: string) {
  const deposit = await prisma.deposit.findFirst({
    where:   { id: depositId, tenantId },
    include: { invoice: true },
  })
  if (!deposit) throw new Error('Acompte introuvable')
  if (deposit.status !== DepositStatus.PENDING) throw new Error("Facture d'acompte déjà émise")

  return prisma.$transaction(async (tx) => {
    const number    = await generateNumber(tenantId, InvoiceType.DEPOSIT_INVOICE)
    const vatRate   = 20
    const amountHt  = round(Number(deposit.amountResolved) / (1 + vatRate / 100))
    const vatAmount = round(Number(deposit.amountResolved) - amountHt)

    const depInvoice = await tx.invoice.create({
      data: {
        tenantId,
        clientId:      deposit.invoice.clientId,
        number,
        type:          InvoiceType.DEPOSIT_INVOICE,
        status:        InvoiceStatus.DRAFT,
        issueDate:     new Date(),
        dueDate:       deposit.dueDate,
        subject:       `Acompte sur facture ${deposit.invoice.number}`,
        subtotalHt:    new Decimal(amountHt),
        discountAmount:new Decimal(0),
        totalHt:       new Decimal(amountHt),
        totalVat:      new Decimal(vatAmount),
        totalTtc:      new Decimal(Number(deposit.amountResolved)),
        amountPaid:    new Decimal(0),
        amountDue:     new Decimal(Number(deposit.amountResolved)),
        depositAmount: new Decimal(0),
        createdBy:     userId,
        lines: {
          create: [{
            description:    `Acompte ${Number(deposit.amountValue)}${deposit.amountType === 'PERCENT' ? '%' : '€'} — ${deposit.invoice.number}`,
            quantity:       new Decimal(1),
            unitPrice:      new Decimal(amountHt),
            vatRate:        new Decimal(vatRate),
            lineBaseHt:     new Decimal(amountHt),
            lineDiscountAmt:new Decimal(0),
            lineTotalHt:    new Decimal(amountHt),
            lineVatAmount:  new Decimal(vatAmount),
            lineTotalTtc:   new Decimal(Number(deposit.amountResolved)),
            position:       0,
          }],
        },
        vatSummary: {
          create: [{ vatRate: new Decimal(vatRate), baseHt: new Decimal(amountHt), vatAmount: new Decimal(vatAmount) }],
        },
      },
    })

    await tx.deposit.update({
      where: { id: depositId },
      data:  { status: DepositStatus.INVOICED, depositInvoiceId: depInvoice.id, depositInvoiceNumber: depInvoice.number },
    })

    return depInvoice
  })
}

// ─── Cron : mise à jour des factures en retard ────────────────────────────────

export async function markOverdueInvoices(): Promise<number> {
  const result = await prisma.invoice.updateMany({
    where: { status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] }, dueDate: { lt: new Date() } },
    data:  { status: InvoiceStatus.OVERDUE },
  })
  return result.count
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findByIdOrThrow(invoiceId: string, tenantId: string) {
  const invoice = await prisma.invoice.findFirst({
    where:   { id: invoiceId, tenantId },
    include: INVOICE_INCLUDE,
  })
  if (!invoice) throw new Error('Facture introuvable')
  return invoice
}

// ─── Formatter (Decimal → number) ────────────────────────────────────────────

export function formatInvoice(inv: any) {
  return {
    id:            inv.id,
    number:        inv.number,
    type:          inv.type,
    status:        inv.status,
    client:        inv.client,
    issueDate:     inv.issueDate?.toISOString?.()?.split('T')[0] ?? inv.issueDate,
    dueDate:       inv.dueDate?.toISOString?.()?.split('T')[0] ?? inv.dueDate,
    subject:       inv.subject,
    notes:         inv.notes,
    footer:        inv.footer,
    discountType:  inv.discountType,
    discountValue: inv.discountValue ? Number(inv.discountValue) : null,
    depositAmount: Number(inv.depositAmount ?? 0),
    subtotalHt:    Number(inv.subtotalHt),
    discountAmount:Number(inv.discountAmount),
    totalHt:       Number(inv.totalHt),
    totalVat:      Number(inv.totalVat),
    totalTtc:      Number(inv.totalTtc),
    amountPaid:    Number(inv.amountPaid ?? 0),
    amountDue:     Number(inv.amountDue ?? 0),
    lines:         (inv.lines ?? []).map((l: any) => ({
      id:             l.id,
      productId:      l.productId,
      description:    l.description,
      quantity:       Number(l.quantity),
      unitPrice:      Number(l.unitPrice),
      vatRate:        Number(l.vatRate),
      discountType:   l.discountType,
      discountValue:  l.discountValue ? Number(l.discountValue) : null,
      lineBaseHt:     Number(l.lineBaseHt),
      lineDiscountAmt:Number(l.lineDiscountAmt),
      lineTotalHt:    Number(l.lineTotalHt),
      lineVatAmount:  Number(l.lineVatAmount),
      lineTotalTtc:   Number(l.lineTotalTtc),
      position:       l.position,
    })),
    vatSummary: (inv.vatSummary ?? []).map((v: any) => ({
      vatRate:   Number(v.vatRate),
      baseHt:    Number(v.baseHt),
      vatAmount: Number(v.vatAmount),
    })),
    payments: (inv.payments ?? []).map((p: any) => ({
      id:          p.id,
      amount:      Number(p.amount),
      method:      p.method,
      reference:   p.reference,
      paymentDate: p.paymentDate?.toISOString?.()?.split('T')[0] ?? p.paymentDate,
      notes:       p.notes,
    })),
    deposits:  inv.deposits,
    paidAt:    inv.paidAt,
    sentAt:    inv.sentAt,
    quoteId:   inv.quoteId,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  }
}

// ─── Récupération pour PDF/email ──────────────────────────────────────────────

export interface TenantSettings {
  companyName?:  string | null
  siret?:        string | null
  vatNumber?:    string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?:         string | null
  zipCode?:      string | null
  country?:      string | null
  phone?:        string | null
  logoUrl?:      string | null
  invoiceFooter?:string | null
  smtpHost?:     string | null
  smtpPort?:     number | null
  smtpSecure?:   boolean | null
  smtpUser?:     string | null
  smtpPass?:     string | null
  smtpFrom?:     string | null
}

export async function getInvoiceWithSettings(invoiceId: string, tenantId: string) {
  const invoice = await findByIdOrThrow(invoiceId, tenantId)
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      companyName: true, siret: true, vatNumber: true,
      addressLine1: true, addressLine2: true, city: true,
      zipCode: true, country: true, phone: true,
      logoUrl: true, invoiceFooter: true,
      smtpHost: true, smtpPort: true, smtpSecure: true,
      smtpUser: true, smtpPass: true, smtpFrom: true,
    },
  })
  const fallback: TenantSettings = { companyName: null, siret: null, vatNumber: null, addressLine1: null, addressLine2: null, city: null, zipCode: null, country: null, phone: null, logoUrl: null, invoiceFooter: null, smtpHost: null, smtpPort: null, smtpSecure: false, smtpUser: null, smtpPass: null, smtpFrom: null }
  return { invoice: formatInvoice(invoice), settings: (tenant ?? fallback) as TenantSettings }
}