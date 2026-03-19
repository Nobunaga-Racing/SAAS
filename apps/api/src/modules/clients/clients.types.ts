// ─────────────────────────────────────────────────────────────────────────────
// Types TypeScript — Module Clients
// ─────────────────────────────────────────────────────────────────────────────

export enum ClientType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY    = 'COMPANY',
}

export enum ClientStatus {
  PROSPECT = 'PROSPECT',
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export interface ContactInput {
  firstName: string
  lastName:  string
  role?:     string
  email?:    string
  phone?:    string
  isPrimary?: boolean
}

export interface ContactResponse extends ContactInput {
  id:        string
  clientId:  string
  createdAt: string
  updatedAt: string
}

// ─── Création / mise à jour ───────────────────────────────────────────────────

export interface CreateClientDto {
  type?:    ClientType
  status?:  ClientStatus
  name:     string
  email?:   string
  phone?:   string
  website?: string

  // Légal
  siret?:     string
  vatNumber?: string

  // Adresse facturation
  addressLine1?: string
  addressLine2?: string
  city?:         string
  zipCode?:      string
  country?:      string

  // Adresse livraison
  shippingAddressLine1?: string
  shippingAddressLine2?: string
  shippingCity?:         string
  shippingZipCode?:      string
  shippingCountry?:      string

  // Paramètres commerciaux
  paymentTermDays?: number
  currency?:        string
  notes?:           string
  tags?:            string[]

  // Contacts à créer en même temps (optionnel)
  contacts?: ContactInput[]
}

export interface UpdateClientDto extends Partial<Omit<CreateClientDto, 'contacts'>> {}

// ─── Filtres de recherche ─────────────────────────────────────────────────────

export interface ClientFilters {
  search?:  string       // Recherche full-text : name, email, siret, ville
  status?:  ClientStatus
  type?:    ClientType
  tags?:    string[]     // Filtre par tag (ET logique)
  city?:    string
  country?: string
  page?:    number
  limit?:   number
  sortBy?:  'name' | 'createdAt' | 'status'
  sortDir?: 'asc' | 'desc'
}

// ─── Réponse API ──────────────────────────────────────────────────────────────

export interface ClientResponse {
  id:       string
  type:     ClientType
  status:   ClientStatus
  name:     string
  email?:   string
  phone?:   string
  website?: string

  siret?:     string
  vatNumber?: string

  addressLine1?: string
  addressLine2?: string
  city?:         string
  zipCode?:      string
  country:       string

  shippingAddressLine1?: string
  shippingAddressLine2?: string
  shippingCity?:         string
  shippingZipCode?:      string
  shippingCountry?:      string

  paymentTermDays?: number
  currency:         string
  notes?:           string
  tags:             string[]

  contacts:  ContactResponse[]

  // Statistiques calculées à la volée
  stats?: {
    invoicesCount:  number
    totalRevenue:   number   // Σ totalTtc des factures PAID
    outstandingDue: number   // Σ amountDue des factures ouvertes
    lastInvoiceDate?: string
  }

  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ClientListResponse {
  data: ClientResponse[]
  meta: {
    total: number
    page:  number
    limit: number
    pages: number
  }
}
