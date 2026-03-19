// ─────────────────────────────────────────────────────────────────────────────
// Service — Module Devis
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, QuoteStatus, InvoiceStatus, InvoiceType, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { CreateQuoteDto, UpdateQuoteDto, RejectQuoteDto, QuoteFilters } from './quotes.validators'
import { DiscountType, type QuoteLineCalculated, type QuoteTotals, type VatSummaryLine } from './quotes.types'

const prisma = new PrismaClient()

// ─── Include standard ─────────────────────────────────────────────────────────

const QUOTE_INCLUDE = {
  client: { select: { id: true, name: true, email: true } },
  lines: {
    orderBy: { position: 'asc' } as const,
    include: { product: { select: { id: true, name: true, sku: true } } },
  },
  invoices: {
    where:  { status: { not: InvoiceStatus.CANCELLED } },
    select: { id: true, number: true },
    take:   1,
    orderBy: { createdAt: 'desc' } as const,
  },
} satisfies Prisma.QuoteInclude

// ─── Calculs (miroir exact du module invoices) ────────────────────────────────

export function calculateLine(line: CreateQuoteDto['lines'][0]): QuoteLineCalculated {
  const lineBaseHt = round(line.quantity * line.unitPrice)
  let lineDiscountAmt = 0

  if (line.discountType && line.discountValue) {
    lineDiscountAmt = line.discountType === DiscountType.PERCENT
      ? round(lineBaseHt * (line.discountValue / 100))
      : round(line.discountValue)
  }

  const lineTotalHt   = round(lineBaseHt - lineDiscountAmt)
  const lineVatAmount = round(lineTotalHt * (line.vatRate / 100))
  const lineTotalTtc  = round(lineTotalHt + lineVatAmount)

  return { ...line, lineBaseHt, lineDiscountAmt, lineTotalHt, lineVatAmount, lineTotalTtc } as QuoteLineCalculated
}

export function calculateTotals(
  lines: QuoteLineCalculated[],
  discountType?: DiscountType,
  discountValue?: number
): QuoteTotals {
  const subtotalHt = round(lines.reduce((s, l) => s + l.lineTotalHt, 0))

  let discountAmount = 0
  if (discountType && discountValue) {
    discountAmount = discountType === DiscountType.PERCENT
      ? round(subtotalHt * (discountValue / 100))
      : round(Math.min(discountValue, subtotalHt))
  }

  const totalHt      = round(subtotalHt - discountAmount)
  const discountRatio = subtotalHt > 0 ? totalHt / subtotalHt : 1

  const vatMap = new Map<number, { baseHt: number; vatAmount: number }>()
  for (const line of lines) {
    const adjHt = round(line.lineTotalHt * discountRatio)
    const vat   = round(adjHt * (line.vatRate / 100))
    const entry = vatMap.get(line.vatRate)
    if (entry) {
      entry.baseHt    = round(entry.baseHt + adjHt)
      entry.vatAmount = round(entry.vatAmount + vat)
    } else {
      vatMap.set(line.vatRate, { baseHt: adjHt, vatAmount: vat })
    }
  }

  const vatSummary: VatSummaryLine[] = Array.from(vatMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([vatRate, v]) => ({ vatRate, ...v }))

  const totalVat = round(vatSummary.reduce((s, v) => s + v.vatAmount, 0))
  const totalTtc = round(totalHt + totalVat)

  return { subtotalHt, discountAmount, totalHt, vatSummary, totalVat, totalTtc }
}

function round(n: number) { return Math.round(n * 100) / 100 }

// ─── Numérotation ─────────────────────────────────────────────────────────────

async function generateNumber(tenantId: string): Promise<string> {
  const year  = new Date().getFullYear()
  const count = await prisma.quote.count({
    where: { tenantId, number: { startsWith: `DEV-${year}` } },
  })
  return `DEV-${year}-${String(count + 1).padStart(4, '0')}`
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function findAll(tenantId: string, filters: QuoteFilters) {
  const { status, clientId, dateFrom, dateTo, expiredOnly, search, page = 1, limit = 20 } = filters
  const skip  = (page - 1) * limit
  const today = new Date()

  const where: Prisma.QuoteWhereInput = {
    tenantId,
    ...(status   && { status }),
    ...(clientId && { clientId }),
    ...(dateFrom || dateTo
      ? { issueDate: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo   && { lte: new Date(dateTo) }),
        }}
      : {}),
    ...(expiredOnly && {
      status:     { in: [QuoteStatus.SENT, QuoteStatus.DRAFT] },
      expiryDate: { lt: today },
    }),
    ...(search && {
      OR: [
        { number:  { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const [total, data] = await Promise.all([
    prisma.quote.count({ where }),
    prisma.quote.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: QUOTE_INCLUDE,
    }),
  ])

  return { data: data.map(formatQuote), meta: { total, page, limit, pages: Math.ceil(total / limit) } }
}

export async function findById(quoteId: string, tenantId: string) {
  const q = await prisma.quote.findFirst({ where: { id: quoteId, tenantId }, include: QUOTE_INCLUDE })
  return q ? formatQuote(q) : null
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createQuote(dto: CreateQuoteDto, tenantId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const number          = await generateNumber(tenantId)
    const calculatedLines = dto.lines.map(calculateLine)
    const totals          = calculateTotals(
      calculatedLines,
      dto.discountType as DiscountType | undefined,
      dto.discountValue
    )

    const quote = await tx.quote.create({
      data: {
        tenantId,
        clientId:      dto.clientId,
        number,
        status:        QuoteStatus.DRAFT,
        issueDate:     new Date(dto.issueDate),
        expiryDate:    new Date(dto.expiryDate),
        subject:       dto.subject,
        notes:         dto.notes,
        footer:        dto.footer,
        discountType:  dto.discountType as any,
        discountValue: dto.discountValue ? new Decimal(dto.discountValue) : null,
        subtotalHt:    new Decimal(totals.subtotalHt),
        discountAmount:new Decimal(totals.discountAmount),
        totalHt:       new Decimal(totals.totalHt),
        totalVat:      new Decimal(totals.totalVat),
        totalTtc:      new Decimal(totals.totalTtc),
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
      },
      include: QUOTE_INCLUDE,
    })

    return formatQuote(quote)
  })
}

export async function updateQuote(quoteId: string, dto: UpdateQuoteDto, tenantId: string) {
  const quote = await findRawOrThrow(quoteId, tenantId)

  if (quote.status !== QuoteStatus.DRAFT) {
    throw new Error('Seul un devis en brouillon peut être modifié')
  }

  return prisma.$transaction(async (tx) => {
    const linesToUse = dto.lines
      ? dto.lines.map(calculateLine)
      : quote.lines.map((l: any) => ({
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
      linesToUse as QuoteLineCalculated[],
      (dto.discountType ?? quote.discountType) as DiscountType | undefined,
      dto.discountValue ?? (quote.discountValue ? Number(quote.discountValue) : undefined)
    )

    if (dto.lines) {
      await tx.quoteLine.deleteMany({ where: { quoteId } })
    }

    const updated = await tx.quote.update({
      where: { id: quoteId },
      data: {
        ...(dto.issueDate  && { issueDate:   new Date(dto.issueDate) }),
        ...(dto.expiryDate && { expiryDate:  new Date(dto.expiryDate) }),
        ...(dto.subject    && { subject:     dto.subject }),
        ...(dto.notes      !== undefined && { notes:  dto.notes }),
        ...(dto.footer     !== undefined && { footer: dto.footer }),
        ...(dto.discountType  && { discountType:  dto.discountType as any }),
        ...(dto.discountValue !== undefined && {
          discountValue: dto.discountValue ? new Decimal(dto.discountValue) : null,
        }),
        subtotalHt:    new Decimal(totals.subtotalHt),
        discountAmount:new Decimal(totals.discountAmount),
        totalHt:       new Decimal(totals.totalHt),
        totalVat:      new Decimal(totals.totalVat),
        totalTtc:      new Decimal(totals.totalTtc),
        ...(dto.lines && {
          lines: {
            create: linesToUse.map((l: any) => ({
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
        }),
      },
      include: QUOTE_INCLUDE,
    })

    return formatQuote(updated)
  })
}

export async function deleteQuote(quoteId: string, tenantId: string) {
  const quote = await findRawOrThrow(quoteId, tenantId)
  if (quote.status !== QuoteStatus.DRAFT) {
    throw new Error('Seul un brouillon peut être supprimé')
  }
  return prisma.quote.delete({ where: { id: quoteId } })
}

// ─── Transitions de statut ────────────────────────────────────────────────────

export async function sendQuote(quoteId: string, tenantId: string) {
  const quote = await findRawOrThrow(quoteId, tenantId)
  if (quote.status !== QuoteStatus.DRAFT) {
    throw new Error('Seul un brouillon peut être envoyé')
  }
  return prisma.quote.update({
    where: { id: quoteId },
    data:  { status: QuoteStatus.SENT, sentAt: new Date() },
  })
}

export async function acceptQuote(quoteId: string, tenantId: string) {
  const quote = await findRawOrThrow(quoteId, tenantId)
  if (quote.status !== QuoteStatus.SENT) {
    throw new Error('Seul un devis envoyé peut être accepté')
  }
  return prisma.quote.update({
    where: { id: quoteId },
    data:  { status: QuoteStatus.ACCEPTED, acceptedAt: new Date() },
  })
}

export async function rejectQuote(quoteId: string, dto: RejectQuoteDto, tenantId: string) {
  const quote = await findRawOrThrow(quoteId, tenantId)
  if (!([QuoteStatus.SENT, QuoteStatus.ACCEPTED] as QuoteStatus[]).includes(quote.status)) {
    throw new Error('Ce devis ne peut pas être refusé dans son état actuel')
  }
  return prisma.quote.update({
    where: { id: quoteId },
    data: {
      status:         QuoteStatus.REJECTED,
      rejectedAt:     new Date(),
      rejectedReason: dto.reason,
    },
  })
}

// ─── Cron : expiration automatique ───────────────────────────────────────────

export async function markExpiredQuotes(): Promise<number> {
  const result = await prisma.quote.updateMany({
    where: {
      status:     { in: [QuoteStatus.DRAFT, QuoteStatus.SENT] },
      expiryDate: { lt: new Date() },
    },
    data: { status: QuoteStatus.EXPIRED },
  })
  return result.count
}

// ─── Conversion en facture ────────────────────────────────────────────────────

export async function convertToInvoice(quoteId: string, tenantId: string, userId: string) {
  const quote = await findRawOrThrow(quoteId, tenantId)

  if (quote.status !== QuoteStatus.ACCEPTED) {
    throw new Error('Seul un devis accepté peut être converti en facture')
  }

  // Empêche une double conversion
  const existingInvoice = await prisma.invoice.findFirst({
    where: { quoteId, tenantId, status: { not: InvoiceStatus.CANCELLED } },
  })
  if (existingInvoice) {
    throw new Error(`Ce devis a déjà été converti (facture ${existingInvoice.number})`)
  }

  return prisma.$transaction(async (tx) => {
    // Génère le numéro de facture
    const year  = new Date().getFullYear()
    const count = await tx.invoice.count({
      where: { tenantId, number: { startsWith: `FAC-${year}` } },
    })
    const invoiceNumber = `FAC-${year}-${String(count + 1).padStart(4, '0')}`

    // Calcule la date d'échéance (30 jours par défaut)
    const issueDate = new Date()
    const dueDate   = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const invoice = await tx.invoice.create({
      data: {
        tenantId,
        clientId:      quote.clientId,
        quoteId:       quote.id,
        number:        invoiceNumber,
        type:          InvoiceType.INVOICE,
        status:        InvoiceStatus.DRAFT,
        issueDate,
        dueDate,
        subject:       quote.subject,
        notes:         quote.notes,
        footer:        quote.footer,
        discountType:  quote.discountType,
        discountValue: quote.discountValue,
        depositAmount: new Decimal(0),
        subtotalHt:    quote.subtotalHt,
        discountAmount:quote.discountAmount,
        totalHt:       quote.totalHt,
        totalVat:      quote.totalVat,
        totalTtc:      quote.totalTtc,
        amountPaid:    new Decimal(0),
        amountDue:     quote.totalTtc,
        createdBy:     userId,
        lines: {
          create: quote.lines.map((l: any) => ({
            productId:      l.productId,
            description:    l.description,
            quantity:       l.quantity,
            unitPrice:      l.unitPrice,
            vatRate:        l.vatRate,
            discountType:   l.discountType,
            discountValue:  l.discountValue,
            lineBaseHt:     l.lineBaseHt,
            lineDiscountAmt:l.lineDiscountAmt,
            lineTotalHt:    l.lineTotalHt,
            lineVatAmount:  l.lineVatAmount,
            lineTotalTtc:   l.lineTotalTtc,
            position:       l.position,
          })),
        },
        // VatSummary recalculé depuis les lignes du devis
        vatSummary: {
          create: buildVatSummary(quote.lines),
        },
      },
    })

    await tx.quote.update({
      where: { id: quoteId },
      data:  { status: QuoteStatus.CONVERTED, convertedAt: new Date() },
    })

    return invoice
  })
}

// ─── Duplication ──────────────────────────────────────────────────────────────

export async function duplicateQuote(quoteId: string, tenantId: string, userId: string) {
  const source = await findRawOrThrow(quoteId, tenantId)

  return prisma.$transaction(async (tx) => {
    const number = await generateNumber(tenantId)
    const today  = new Date()
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 30)

    const copy = await tx.quote.create({
      data: {
        tenantId,
        clientId:      source.clientId,
        number,
        status:        QuoteStatus.DRAFT,
        issueDate:     today,
        expiryDate:    expiry,
        subject:       `${source.subject} (copie)`,
        notes:         source.notes,
        footer:        source.footer,
        discountType:  source.discountType,
        discountValue: source.discountValue,
        subtotalHt:    source.subtotalHt,
        discountAmount:source.discountAmount,
        totalHt:       source.totalHt,
        totalVat:      source.totalVat,
        totalTtc:      source.totalTtc,
        createdBy:     userId,
        lines: {
          create: source.lines.map((l: any) => ({
            productId:      l.productId,
            description:    l.description,
            quantity:       l.quantity,
            unitPrice:      l.unitPrice,
            vatRate:        l.vatRate,
            discountType:   l.discountType,
            discountValue:  l.discountValue,
            lineBaseHt:     l.lineBaseHt,
            lineDiscountAmt:l.lineDiscountAmt,
            lineTotalHt:    l.lineTotalHt,
            lineVatAmount:  l.lineVatAmount,
            lineTotalTtc:   l.lineTotalTtc,
            position:       l.position,
          })),
        },
      },
      include: QUOTE_INCLUDE,
    })

    return formatQuote(copy)
  })
}

// ─── Formatage réponse ────────────────────────────────────────────────────────

function formatQuote(q: any) {
  const today    = new Date()
  const isExpired = !([QuoteStatus.ACCEPTED, QuoteStatus.CONVERTED, QuoteStatus.REJECTED] as string[]).includes(q.status)
    && new Date(q.expiryDate) < today

  const linkedInvoice = q.invoices?.[0]

  return {
    id:     q.id,
    number: q.number,
    status: q.status as QuoteStatus,
    client: q.client,

    issueDate:  q.issueDate.toISOString().split('T')[0],
    expiryDate: q.expiryDate.toISOString().split('T')[0],
    isExpired,

    subject: q.subject,
    notes:   q.notes,
    footer:  q.footer,

    discountType:  q.discountType,
    discountValue: q.discountValue ? Number(q.discountValue) : undefined,

    lines: q.lines.map((l: any) => ({
      id:             l.id,
      productId:      l.productId,
      product:        l.product,
      description:    l.description,
      quantity:       Number(l.quantity),
      unitPrice:      Number(l.unitPrice),
      vatRate:        Number(l.vatRate),
      discountType:   l.discountType,
      discountValue:  l.discountValue ? Number(l.discountValue) : undefined,
      lineBaseHt:     Number(l.lineBaseHt),
      lineDiscountAmt:Number(l.lineDiscountAmt),
      lineTotalHt:    Number(l.lineTotalHt),
      lineVatAmount:  Number(l.lineVatAmount),
      lineTotalTtc:   Number(l.lineTotalTtc),
      position:       l.position,
    })),

    vatSummary: buildVatSummary(q.lines),

    totals: {
      subtotalHt:     Number(q.subtotalHt),
      discountAmount: Number(q.discountAmount),
      totalHt:        Number(q.totalHt),
      vatSummary:     buildVatSummary(q.lines),
      totalVat:       Number(q.totalVat),
      totalTtc:       Number(q.totalTtc),
    },

    sentAt:         q.sentAt?.toISOString(),
    acceptedAt:     q.acceptedAt?.toISOString(),
    rejectedAt:     q.rejectedAt?.toISOString(),
    rejectedReason: q.rejectedReason,
    convertedAt:    q.convertedAt?.toISOString(),
    invoiceId:      linkedInvoice?.id,
    invoiceNumber:  linkedInvoice?.number,

    pdfUrl:    q.pdfUrl,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  }
}

function buildVatSummary(lines: any[]): VatSummaryLine[] {
  const map = new Map<number, { baseHt: number; vatAmount: number }>()
  for (const l of lines) {
    const rate = Number(l.vatRate)
    const ht   = Number(l.lineTotalHt)
    const vat  = Number(l.lineVatAmount)
    const e    = map.get(rate)
    if (e) { e.baseHt += ht; e.vatAmount += vat }
    else    { map.set(rate, { baseHt: ht, vatAmount: vat }) }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([vatRate, v]) => ({
      vatRate,
      baseHt:    Math.round(v.baseHt * 100) / 100,
      vatAmount: Math.round(v.vatAmount * 100) / 100,
    }))
}

// ─── PDF / Email helper ───────────────────────────────────────────────────────

import type { TenantSettings } from '../invoices/invoices.service'

export async function getQuoteWithSettings(quoteId: string, tenantId: string) {
  const q = await findRawOrThrow(quoteId, tenantId)
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
  return { quote: formatQuote(q), settings: (tenant ?? fallback) as TenantSettings }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findRawOrThrow(quoteId: string, tenantId: string) {
  const q = await prisma.quote.findFirst({
    where:   { id: quoteId, tenantId },
    include: QUOTE_INCLUDE,
  })
  if (!q) throw new Error('Devis introuvable')
  return q
}
