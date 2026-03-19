// ─────────────────────────────────────────────────────────────────────────────
// Validators Zod — Module Produits / Services
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'
import { ProductType, ProductUnit, VAT_RATES_ALLOWED } from './products.types'

// ─── Catégorie ────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name:        z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().max(255).optional(),
  color:       z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format hex invalide (#RRGGBB)').optional(),
  position:    z.number().int().min(0).default(0),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryDto = z.infer<typeof createCategorySchema>
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>

// ─── Produit ──────────────────────────────────────────────────────────────────

// Schéma de base sans refinements — permet d'appeler .partial() pour l'update
const productBaseSchema = z.object({
  type:             z.nativeEnum(ProductType).default(ProductType.SERVICE),
  sku:              z.string().max(100).optional(),
  name:             z.string().min(1, 'Le nom est requis').max(255),
  description:      z.string().max(10000).optional(),
  descriptionShort: z.string().max(500).optional(),
  categoryId:       z.string().uuid().optional(),

  // Tarification
  unitPrice: z.number().min(0, 'Le prix ne peut pas être négatif'),
  unit:      z.nativeEnum(ProductUnit).default(ProductUnit.PIECE),
  currency:  z.string().length(3).default('EUR'),

  // TVA
  vatRate: z
    .number()
    .refine((v) => (VAT_RATES_ALLOWED as readonly number[]).includes(v), {
      message: `Taux TVA invalide. Valeurs acceptées : ${VAT_RATES_ALLOWED.join(', ')} %`,
    }),
  vatExempt:    z.boolean().default(false),
  vatExemptRef: z.string().max(255).optional(),

  // Prix de revient
  costPrice: z.number().min(0).optional(),

  isActive:   z.boolean().default(true),
  isFavorite: z.boolean().default(false),
})

export const createProductSchema = productBaseSchema
  .refine(
    (d) => !(d.vatExempt && d.vatRate !== 0),
    { message: 'Un produit exonéré de TVA doit avoir un taux de 0 %', path: ['vatRate'] }
  )
  .refine(
    (d) => !(d.vatExempt && !d.vatExemptRef),
    {
      message: 'La mention légale d\'exonération est requise (ex: "TVA non applicable - art. 293B CGI")',
      path:    ['vatExemptRef'],
    }
  )

export type CreateProductDto = z.infer<typeof createProductSchema>

// .partial() appelé sur le schéma de base (avant les refinements)
export const updateProductSchema = productBaseSchema.partial()

export type UpdateProductDto = z.infer<typeof updateProductSchema>

// ─── Filtres ──────────────────────────────────────────────────────────────────

export const productFiltersSchema = z.object({
  search:     z.string().max(100).optional(),
  type:       z.nativeEnum(ProductType).optional(),
  categoryId: z.string().uuid().optional(),
  isActive:   z.coerce.boolean().optional(),
  isFavorite: z.coerce.boolean().optional(),
  vatRate:    z.coerce.number().optional(),
  priceMin:   z.coerce.number().min(0).optional(),
  priceMax:   z.coerce.number().min(0).optional(),
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  sortBy:     z.enum(['name', 'unitPrice', 'createdAt']).default('name'),
  sortDir:    z.enum(['asc', 'desc']).default('asc'),
})

export type ProductFilters = z.infer<typeof productFiltersSchema>
