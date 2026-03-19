// Point d'entrée du package @saas-gestion/shared-types
// Types partagés entre le frontend (Next.js) et le backend (Express)

// Re-export des enums depuis validators pour éviter les doublons
export {
  InvoiceType,
  InvoiceStatus,
  DiscountType,
  PaymentMethod,
  DepositStatus,
} from '@saas-gestion/validators'

// Types communs
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page:  number
    limit: number
    pages: number
  }
}

export interface ApiError {
  error: {
    code:    string
    message: string
  }
}

export interface ApiResponse<T> {
  data: T
}
