// ─────────────────────────────────────────────────────────────────────────────
// Validators Zod — Module Factures
// Partagés entre frontend (Next.js) et backend (Express)
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'
import { DiscountType, InvoiceType, PaymentMethod } from './enums'

// ─── Taux de TVA valides ──────────────────────────────────────────────────────

const VAT_RATE_VALUES = [0, 5.5, 10, 20] as const

const vatRateSchema = z
  .number()
  .refine((v) => (VAT_RATE_VALUES as readonly number[]).includes(v), {
    message: `Taux de TVA invalide. Valeurs acceptées : ${VAT_RATE_VALUES.join(', ')}`,
  })

// ─── Ligne de facture ─────────────────────────────────────────────────────────

export const invoiceLineSchema = z
  .object({
    productId:     z.string().uuid().optional(),
    description:   z.string().min(1, 'Description requise').max(500),
    quantity:      z.number().positive('La quantité doit être > 0'),
    unitPrice:     z.number().min(0, 'Le prix unitaire ne peut pas être négatif'),
    vatRate:       vatRateSchema,
    discountType:  z.nativeEnum(DiscountType).optional(),
    discountValue: z.number().positive().optional(),
    position:      z.number().int().min(0),
  })
  .refine(
    (d) => {
      // Si discountType défini, discountValue doit l'être aussi
      if (d.discountType && d.discountValue === undefined) return false
      if (!d.discountType && d.discountValue !== undefined) return false
      // Remise % : max 100
      if (d.discountType === DiscountType.PERCENT && d.discountValue! > 100) return false
      // Remise fixe : max prix total ligne
      if (d.discountType === DiscountType.FIXED) {
        const lineTotal = d.quantity * d.unitPrice
        if (d.discountValue! > lineTotal) return false
      }
      return true
    },
    { message: 'Remise invalide sur la ligne' }
  )

export type InvoiceLineInput = z.infer<typeof invoiceLineSchema>

// ─── Création facture ─────────────────────────────────────────────────────────

// Schéma de base sans refinements — permet .omit() et .partial() pour l'update
const invoiceBaseSchema = z.object({
  clientId: z.string().uuid('Client requis'),
  quoteId:  z.string().uuid().optional(),
  type:     z.nativeEnum(InvoiceType).default(InvoiceType.INVOICE),

  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date : YYYY-MM-DD'),
  dueDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date : YYYY-MM-DD'),

  subject: z.string().min(1, 'Objet requis').max(255),
  notes:   z.string().max(2000).optional(),
  footer:  z.string().max(1000).optional(),

  discountType:  z.nativeEnum(DiscountType).optional(),
  discountValue: z.number().positive().optional(),

  depositAmount: z.number().min(0).default(0),

  lines: z
    .array(invoiceLineSchema)
    .min(1, 'Au moins une ligne est requise')
    .max(100, 'Maximum 100 lignes par facture'),
})

export const createInvoiceSchema = invoiceBaseSchema
  .refine((d) => d.dueDate >= d.issueDate, {
    message: "La date d'échéance doit être >= à la date d'émission",
    path:    ['dueDate'],
  })
  .refine(
    (d) => {
      if (d.discountType && d.discountValue === undefined) return false
      if (!d.discountType && d.discountValue !== undefined) return false
      if (d.discountType === DiscountType.PERCENT && d.discountValue! > 100) return false
      return true
    },
    { message: 'Remise globale invalide', path: ['discountValue'] }
  )

export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>

// ─── Mise à jour facture (brouillon uniquement) ───────────────────────────────

export const updateInvoiceSchema = invoiceBaseSchema
  .omit({ type: true, clientId: true })
  .partial()
  .refine(
    (d) => {
      if (d.issueDate && d.dueDate) return d.dueDate >= d.issueDate
      return true
    },
    { message: "La date d'échéance doit être >= à la date d'émission", path: ['dueDate'] }
  )

export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>

// ─── Enregistrement paiement ──────────────────────────────────────────────────

export const createPaymentSchema = z.object({
  amount:      z.number().positive('Le montant doit être > 0'),
  method:      z.nativeEnum(PaymentMethod),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date : YYYY-MM-DD'),
  reference:   z.string().max(255).optional(),
  notes:       z.string().max(500).optional(),
})

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>

// ─── Acompte ──────────────────────────────────────────────────────────────────

export const createDepositSchema = z
  .object({
    amountType:  z.nativeEnum(DiscountType),
    amountValue: z.number().positive('Le montant de l\'acompte doit être > 0'),
    dueDate:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date : YYYY-MM-DD'),
    notes:       z.string().max(500).optional(),
  })
  .refine(
    (d) => {
      if (d.amountType === DiscountType.PERCENT && d.amountValue > 100) return false
      return true
    },
    { message: "Le pourcentage d'acompte ne peut dépasser 100%", path: ['amountValue'] }
  )

export type CreateDepositDto = z.infer<typeof createDepositSchema>

// ─── Filtres liste ────────────────────────────────────────────────────────────

export const invoiceFiltersSchema = z.object({
  status:   z.string().optional(),
  type:     z.string().optional(),
  clientId: z.string().uuid().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  overdue:  z.coerce.boolean().optional(),
  search:   z.string().max(100).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
})

export type InvoiceFilters = z.infer<typeof invoiceFiltersSchema>
