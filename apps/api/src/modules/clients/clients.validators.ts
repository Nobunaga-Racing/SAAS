// ─────────────────────────────────────────────────────────────────────────────
// Validators Zod — Module Clients
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'
import { ClientType, ClientStatus } from './clients.types'

// ─── Contact ──────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName:  z.string().min(1).max(100),
  role:      z.string().max(100).optional(),
  email:     z.string().email().optional(),
  phone:     z.string().max(30).optional(),
  isPrimary: z.boolean().default(false),
})

// ─── Création client ──────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  type:   z.nativeEnum(ClientType).default(ClientType.COMPANY),
  status: z.nativeEnum(ClientStatus).default(ClientStatus.PROSPECT),

  name:    z.string().min(1, 'Le nom est requis').max(255),
  email:   z.string().email('Email invalide').optional(),
  phone:   z.string().max(30).optional(),
  website: z.string().url('URL invalide').optional(),

  // Légal
  siret:     z.string().regex(/^\d{14}$/, 'SIRET : 14 chiffres').optional(),
  vatNumber: z.string().max(30).optional(),

  // Adresse facturation
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city:         z.string().max(100).optional(),
  zipCode:      z.string().max(20).optional(),
  country:      z.string().length(2).default('FR'),

  // Adresse livraison
  shippingAddressLine1: z.string().max(255).optional(),
  shippingAddressLine2: z.string().max(255).optional(),
  shippingCity:         z.string().max(100).optional(),
  shippingZipCode:      z.string().max(20).optional(),
  shippingCountry:      z.string().length(2).optional(),

  // Paramètres commerciaux
  paymentTermDays: z.number().int().min(0).max(365).optional(),
  currency:        z.string().length(3).default('EUR'),
  notes:           z.string().max(5000).optional(),
  tags:            z.array(z.string().max(50)).max(20).default([]),

  // Contacts initiaux
  contacts: z.array(contactSchema).max(10).default([]),
})

export type CreateClientDto = z.infer<typeof createClientSchema>

// ─── Mise à jour client ───────────────────────────────────────────────────────

export const updateClientSchema = createClientSchema
  .omit({ contacts: true })
  .partial()

export type UpdateClientDto = z.infer<typeof updateClientSchema>

// ─── Contact (ajout / modification) ──────────────────────────────────────────

export const upsertContactSchema = contactSchema
export type UpsertContactDto = z.infer<typeof upsertContactSchema>

// ─── Filtres liste ────────────────────────────────────────────────────────────

const SORT_FIELDS  = ['name', 'createdAt', 'status'] as const
const SORT_DIRS    = ['asc', 'desc'] as const

export const clientFiltersSchema = z.object({
  search:  z.string().max(100).optional(),
  status:  z.nativeEnum(ClientStatus).optional(),
  type:    z.nativeEnum(ClientType).optional(),
  tags:    z.union([z.string(), z.array(z.string())]).optional()
             .transform((v) => (typeof v === 'string' ? [v] : v)),
  city:    z.string().max(100).optional(),
  country: z.string().length(2).optional(),
  page:    z.coerce.number().int().min(1).default(1),
  limit:   z.coerce.number().int().min(1).max(100).default(20),
  sortBy:  z.enum(SORT_FIELDS).default('name'),
  sortDir: z.enum(SORT_DIRS).default('asc'),
})

export type ClientFilters = z.infer<typeof clientFiltersSchema>
