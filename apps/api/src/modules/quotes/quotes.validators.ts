// ─────────────────────────────────────────────────────────────────────────────
// Validators Zod — Module Devis
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'
import { QuoteStatus, DiscountType, VAT_RATES } from './quotes.types'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD attendu')

// ─── Ligne de devis ───────────────────────────────────────────────────────────

const quoteLineSchema = z
  .object({
    productId:     z.string().uuid().optional(),
    description:   z.string().min(1).max(500),
    quantity:      z.number().positive('La quantité doit être > 0'),
    unitPrice:     z.number().min(0),
    vatRate:       z.number().refine(
      (v) => (VAT_RATES as readonly number[]).includes(v),
      { message: `Taux TVA invalide. Valeurs : ${VAT_RATES.join(', ')} %` }
    ),
    discountType:  z.nativeEnum(DiscountType).optional(),
    discountValue: z.number().positive().optional(),
    position:      z.number().int().min(0),
  })
  .refine((d) => {
    if (d.discountType && d.discountValue === undefined) return false
    if (!d.discountType && d.discountValue !== undefined) return false
    if (d.discountType === DiscountType.PERCENT && d.discountValue! > 100) return false
    if (d.discountType === DiscountType.FIXED) {
      if (d.discountValue! > d.quantity * d.unitPrice) return false
    }
    return true
  }, { message: 'Remise de ligne invalide' })

// ─── Création devis ───────────────────────────────────────────────────────────

const quoteBaseSchema = z.object({
  clientId:      z.string().uuid('Client requis'),
  issueDate:     isoDate,
  expiryDate:    isoDate,
  subject:       z.string().min(1).max(255),
  notes:         z.string().max(5000).optional(),
  footer:        z.string().max(2000).optional(),
  discountType:  z.nativeEnum(DiscountType).optional(),
  discountValue: z.number().positive().optional(),
  lines: z
    .array(quoteLineSchema)
    .min(1, 'Au moins une ligne est requise')
    .max(100),
})

export const createQuoteSchema = quoteBaseSchema
  .refine((d) => d.expiryDate >= d.issueDate, {
    message: "La date d'expiration doit être >= à la date d'émission",
    path: ['expiryDate'],
  })
  .refine((d) => {
    if (d.discountType && d.discountValue === undefined) return false
    if (!d.discountType && d.discountValue !== undefined) return false
    if (d.discountType === DiscountType.PERCENT && d.discountValue! > 100) return false
    return true
  }, { message: 'Remise globale invalide', path: ['discountValue'] })

export type CreateQuoteDto = z.infer<typeof createQuoteSchema>

// ─── Mise à jour (brouillon uniquement) ──────────────────────────────────────

export const updateQuoteSchema = quoteBaseSchema
  .omit({ clientId: true })
  .partial()
  .refine((d) => {
    if (d.issueDate && d.expiryDate) return d.expiryDate >= d.issueDate
    return true
  }, { message: "La date d'expiration doit être >= à la date d'émission", path: ['expiryDate'] })

export type UpdateQuoteDto = z.infer<typeof updateQuoteSchema>

// ─── Refus ────────────────────────────────────────────────────────────────────

export const rejectQuoteSchema = z.object({
  reason: z.string().max(500).optional(),
})

export type RejectQuoteDto = z.infer<typeof rejectQuoteSchema>

// ─── Filtres ──────────────────────────────────────────────────────────────────

export const quoteFiltersSchema = z.object({
  status:      z.nativeEnum(QuoteStatus).optional(),
  clientId:    z.string().uuid().optional(),
  dateFrom:    isoDate.optional(),
  dateTo:      isoDate.optional(),
  expiredOnly: z.coerce.boolean().optional(),
  search:      z.string().max(100).optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
})

export type QuoteFilters = z.infer<typeof quoteFiltersSchema>
