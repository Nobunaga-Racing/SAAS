// ─────────────────────────────────────────────────────────────────────────────
// Types TypeScript — Module Factures
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum InvoiceType {
  INVOICE         = 'INVOICE',
  CREDIT_NOTE     = 'CREDIT_NOTE',
  DEPOSIT_INVOICE = 'DEPOSIT_INVOICE',
}

export enum InvoiceStatus {
  DRAFT     = 'DRAFT',
  SENT      = 'SENT',
  PARTIAL   = 'PARTIAL',
  PAID      = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE   = 'OVERDUE',
}

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED   = 'FIXED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD          = 'CARD',
  CHECK         = 'CHECK',
  CASH          = 'CASH',
  STRIPE        = 'STRIPE',
}

export enum DepositStatus {
  PENDING  = 'PENDING',
  INVOICED = 'INVOICED',
  RECEIVED = 'RECEIVED',
}

// Taux de TVA applicables en France
export const VAT_RATES = {
  ZERO:      0,
  REDUCED_1: 5.5,
  REDUCED_2: 10,
  STANDARD:  20,
} as const

export type VatRateValue = (typeof VAT_RATES)[keyof typeof VAT_RATES]

// ─── Ligne de facture ─────────────────────────────────────────────────────────

export interface InvoiceLineInput {
  productId?:    string
  description:   string
  quantity:      number
  unitPrice:     number  // HT
  vatRate:       VatRateValue
  discountType?: DiscountType
  discountValue?: number
  position:      number
}

export interface InvoiceLineCalculated extends InvoiceLineInput {
  lineBaseHt:      number // quantity * unitPrice
  lineDiscountAmt: number // montant remise ligne
  lineTotalHt:     number // HT après remise
  lineVatAmount:   number // TVA
  lineTotalTtc:    number // TTC
}

// ─── Récapitulatif TVA ────────────────────────────────────────────────────────

export interface VatSummaryLine {
  vatRate:   number
  baseHt:    number
  vatAmount: number
}

// ─── Totaux facture ───────────────────────────────────────────────────────────

export interface InvoiceTotals {
  subtotalHt:     number // Σ lineTotalHt avant remise globale
  discountAmount: number // Montant remise globale
  totalHt:        number // subtotalHt - discountAmount
  vatSummary:     VatSummaryLine[]
  totalVat:       number // Σ TVA
  totalTtc:       number // totalHt + totalVat
  depositAmount:  number // Acompte déduit
  amountDue:      number // totalTtc - depositAmount - amountPaid
}

// ─── Payload création facture ─────────────────────────────────────────────────

export interface CreateInvoiceDto {
  clientId:      string
  quoteId?:      string
  type?:         InvoiceType
  issueDate:     string // ISO date
  dueDate:       string // ISO date
  subject:       string
  notes?:        string
  footer?:       string
  discountType?: DiscountType
  discountValue?: number
  depositAmount?: number
  lines:         InvoiceLineInput[]
}

export interface UpdateInvoiceDto extends Partial<Omit<CreateInvoiceDto, 'type'>> {}

// ─── Payload paiement ─────────────────────────────────────────────────────────

export interface CreatePaymentDto {
  amount:      number
  method:      PaymentMethod
  paymentDate: string // ISO date
  reference?:  string
  notes?:      string
}

// ─── Payload acompte ──────────────────────────────────────────────────────────

export interface CreateDepositDto {
  amountType:  DiscountType  // FIXED ou PERCENT
  amountValue: number
  dueDate:     string        // ISO date
  notes?:      string
}

// ─── Filtres liste factures ───────────────────────────────────────────────────

export interface InvoiceFilters {
  status?:   InvoiceStatus
  type?:     InvoiceType
  clientId?: string
  dateFrom?: string // ISO date
  dateTo?:   string // ISO date
  overdue?:  boolean
  page?:     number
  limit?:    number
  search?:   string // Recherche sur numéro ou nom client
}

// ─── Réponses API ─────────────────────────────────────────────────────────────

export interface InvoiceResponse {
  id:            string
  number:        string
  type:          InvoiceType
  status:        InvoiceStatus
  client:        { id: string; name: string; email: string }
  issueDate:     string
  dueDate:       string
  subject:       string
  notes?:        string
  footer?:       string
  discountType?: DiscountType
  discountValue?: number
  lines:         InvoiceLineCalculated[]
  vatSummary:    VatSummaryLine[]
  totals:        InvoiceTotals
  deposits:      DepositResponse[]
  payments:      PaymentResponse[]
  pdfUrl?:       string
  sentAt?:       string
  paidAt?:       string
  createdAt:     string
  updatedAt:     string
}

export interface PaymentResponse {
  id:          string
  amount:      number
  method:      PaymentMethod
  paymentDate: string
  reference?:  string
  stripeReceiptUrl?: string
  notes?:      string
  createdAt:   string
}

export interface DepositResponse {
  id:                   string
  amountType:           DiscountType
  amountValue:          number
  amountResolved:       number
  status:               DepositStatus
  depositInvoiceId?:    string
  depositInvoiceNumber?: string
  dueDate:              string
  paidAt?:              string
  notes?:               string
}

export interface InvoiceListResponse {
  data:  InvoiceResponse[]
  meta: {
    total:   number
    page:    number
    limit:   number
    pages:   number
  }
}
