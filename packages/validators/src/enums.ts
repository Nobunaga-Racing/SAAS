// Enums partagés entre validators et types
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
