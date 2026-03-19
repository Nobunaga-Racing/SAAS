// ─────────────────────────────────────────────────────────────────────────────
// Types TypeScript — Module Produits / Services
// ─────────────────────────────────────────────────────────────────────────────

export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  DIGITAL = 'DIGITAL',
}

export enum ProductUnit {
  PIECE  = 'PIECE',
  HOUR   = 'HOUR',
  DAY    = 'DAY',
  MONTH  = 'MONTH',
  KG     = 'KG',
  LITER  = 'LITER',
  METER  = 'METER',
  FLAT   = 'FLAT',
}

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  PIECE:  'Pièce',
  HOUR:   'Heure',
  DAY:    'Jour',
  MONTH:  'Mois',
  KG:     'kg',
  LITER:  'L',
  METER:  'm',
  FLAT:   'Forfait',
}

export const VAT_RATES_ALLOWED = [0, 5.5, 10, 20] as const
export type VatRateValue = (typeof VAT_RATES_ALLOWED)[number]

// ─── Catégories ───────────────────────────────────────────────────────────────

export interface CreateCategoryDto {
  name:         string
  description?: string
  color?:       string // ex: "#6366f1"
  position?:    number
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryResponse {
  id:           string
  name:         string
  description?: string
  color?:       string
  position:     number
  productCount: number
  createdAt:    string
  updatedAt:    string
}

// ─── Création / mise à jour produit ──────────────────────────────────────────

export interface CreateProductDto {
  type:              ProductType
  sku?:              string
  name:              string
  description?:      string
  descriptionShort?: string
  categoryId?:       string

  // Tarification
  unitPrice: number
  unit?:     ProductUnit
  currency?: string

  // TVA
  vatRate:       VatRateValue
  vatExempt?:    boolean
  vatExemptRef?: string

  // Prix de revient (privé)
  costPrice?: number

  isActive?:   boolean
  isFavorite?: boolean
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// ─── Filtres ──────────────────────────────────────────────────────────────────

export interface ProductFilters {
  search?:     string   // name, sku, description
  type?:       ProductType
  categoryId?: string
  isActive?:   boolean
  isFavorite?: boolean
  vatRate?:    number
  priceMin?:   number
  priceMax?:   number
  page?:       number
  limit?:      number
  sortBy?:     'name' | 'unitPrice' | 'createdAt'
  sortDir?:    'asc' | 'desc'
}

// ─── Réponse API ──────────────────────────────────────────────────────────────

export interface ProductResponse {
  id:                string
  type:              ProductType
  sku?:              string
  name:              string
  description?:      string
  descriptionShort?: string
  category?:         { id: string; name: string; color?: string }

  unitPrice:  number
  unit:       ProductUnit
  unitLabel:  string       // Libellé lisible de l'unité
  currency:   string

  vatRate:       number
  vatExempt:     boolean
  vatExemptRef?: string

  // Prix TTC calculé
  unitPriceTtc: number

  // Marge (uniquement si costPrice défini)
  costPrice?:     number
  marginAmount?:  number   // unitPrice - costPrice
  marginPercent?: number   // (marge / unitPrice) * 100

  isActive:   boolean
  isFavorite: boolean

  createdAt: string
  updatedAt: string
}

export interface ProductListResponse {
  data: ProductResponse[]
  meta: {
    total:  number
    page:   number
    limit:  number
    pages:  number
  }
}
