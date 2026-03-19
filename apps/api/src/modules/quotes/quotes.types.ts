// ─────────────────────────────────────────────────────────────────────────────
// Types TypeScript — Module Devis
// ─────────────────────────────────────────────────────────────────────────────

export enum QuoteStatus {
  DRAFT     = 'DRAFT',
  SENT      = 'SENT',
  ACCEPTED  = 'ACCEPTED',
  REJECTED  = 'REJECTED',
  EXPIRED   = 'EXPIRED',
  CONVERTED = 'CONVERTED',
}

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED   = 'FIXED',
}

// Taux de TVA valides
export const VAT_RATES = [0, 5.5, 10, 20] as const
export type VatRateValue = (typeof VAT_RATES)[number]

// ─── Ligne de devis ───────────────────────────────────────────────────────────

export interface QuoteLineInput {
  productId?:     string
  description:    string
  quantity:       number
  unitPrice:      number       // HT
  vatRate:        VatRateValue
  discountType?:  DiscountType
  discountValue?: number
  position:       number
}

export interface QuoteLineCalculated extends QuoteLineInput {
  lineBaseHt:      number
  lineDiscountAmt: number
  lineTotalHt:     number
  lineVatAmount:   number
  lineTotalTtc:    number
}

// ─── Récapitulatif TVA ────────────────────────────────────────────────────────

export interface VatSummaryLine {
  vatRate:   number
  baseHt:    number
  vatAmount: number
}

// ─── Totaux ───────────────────────────────────────────────────────────────────

export interface QuoteTotals {
  subtotalHt:     number
  discountAmount: number
  totalHt:        number
  vatSummary:     VatSummaryLine[]
  totalVat:       number
  totalTtc:       number
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateQuoteDto {
  clientId:       string
  issueDate:      string   // YYYY-MM-DD
  expiryDate:     string   // YYYY-MM-DD
  subject:        string
  notes?:         string
  footer?:        string
  discountType?:  DiscountType
  discountValue?: number
  lines:          QuoteLineInput[]
}

export interface UpdateQuoteDto extends Partial<Omit<CreateQuoteDto, 'clientId'>> {}

export interface RejectQuoteDto {
  reason?: string
}

// ─── Filtres ──────────────────────────────────────────────────────────────────

export interface QuoteFilters {
  status?:   QuoteStatus
  clientId?: string
  dateFrom?: string
  dateTo?:   string
  expiredOnly?: boolean
  search?:   string      // numéro ou objet
  page?:     number
  limit?:    number
}

// ─── Réponses API ─────────────────────────────────────────────────────────────

export interface QuoteLineResponse extends QuoteLineCalculated {
  id:        string
  productId?: string
  product?:  { id: string; name: string; sku?: string }
}

export interface QuoteResponse {
  id:      string
  number:  string
  status:  QuoteStatus
  client:  { id: string; name: string; email?: string }

  issueDate:  string
  expiryDate: string
  isExpired:  boolean   // calculé à la volée

  subject: string
  notes?:  string
  footer?: string

  discountType?:  DiscountType
  discountValue?: number

  lines:      QuoteLineResponse[]
  vatSummary: VatSummaryLine[]
  totals:     QuoteTotals

  // Suivi
  sentAt?:        string
  acceptedAt?:    string
  rejectedAt?:    string
  rejectedReason?: string
  convertedAt?:   string
  invoiceId?:     string   // Facture générée
  invoiceNumber?: string

  pdfUrl?:   string
  createdAt: string
  updatedAt: string
}

export interface QuoteListResponse {
  data: QuoteResponse[]
  meta: { total: number; page: number; limit: number; pages: number }
}
