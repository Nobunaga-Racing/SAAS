// ─────────────────────────────────────────────────────────────────────────────
// Service — Module Clients
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, ClientStatus, InvoiceStatus, Prisma } from '@prisma/client'
import type { CreateClientDto, UpdateClientDto, ClientFilters, UpsertContactDto } from './clients.validators'

const prisma = new PrismaClient()

// ─── Include standard (utilisé dans toutes les requêtes) ─────────────────────

const CLIENT_INCLUDE = {
  contacts: {
    orderBy: [{ isPrimary: 'desc' }, { lastName: 'asc' }] as any,
  },
} satisfies Prisma.ClientInclude

// ─── Recherche & liste ────────────────────────────────────────────────────────

export async function findAll(tenantId: string, filters: ClientFilters) {
  const { search, status, type, tags, city, country, page, limit, sortBy, sortDir } = filters
  const skip = (page - 1) * limit

  const where: Prisma.ClientWhereInput = {
    tenantId,
    // Soft delete : exclure les archivés sauf si demandé explicitement
    ...(status ? { status } : { status: { not: ClientStatus.ARCHIVED } }),
    ...(type    && { type }),
    ...(city    && { city:    { contains: city,    mode: 'insensitive' } }),
    ...(country && { country: { equals:  country } }),
    // Filtre par tags : le client doit avoir TOUS les tags demandés
    ...(tags?.length && { tags: { hasEvery: tags } }),
    // Recherche full-text sur name, email, siret, city
    ...(search && {
      OR: [
        { name:   { contains: search, mode: 'insensitive' } },
        { email:  { contains: search, mode: 'insensitive' } },
        { siret:  { contains: search, mode: 'insensitive' } },
        { city:   { contains: search, mode: 'insensitive' } },
        { contacts: { some: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName:  { contains: search, mode: 'insensitive' } },
            { email:     { contains: search, mode: 'insensitive' } },
          ],
        }}},
      ],
    }),
  }

  const orderBy: Prisma.ClientOrderByWithRelationInput =
    sortBy === 'status'    ? { status:    sortDir } :
    sortBy === 'createdAt' ? { createdAt: sortDir } :
                             { name:      sortDir }

  const [total, data] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      skip,
      take:    limit,
      orderBy,
      include: CLIENT_INCLUDE,
    }),
  ])

  return {
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  }
}

export async function findById(clientId: string, tenantId: string) {
  return prisma.client.findFirst({
    where:   { id: clientId, tenantId },
    include: CLIENT_INCLUDE,
  })
}

// ─── Statistiques client ──────────────────────────────────────────────────────

export async function getClientStats(clientId: string, tenantId: string) {
  const [invoicesCount, revenue, outstanding, lastInvoice] = await Promise.all([
    prisma.invoice.count({
      where: { clientId, tenantId, status: { not: InvoiceStatus.CANCELLED } },
    }),
    prisma.invoice.aggregate({
      where:  { clientId, tenantId, status: InvoiceStatus.PAID },
      _sum:   { totalTtc: true },
    }),
    prisma.invoice.aggregate({
      where:  { clientId, tenantId, status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] } },
      _sum:   { amountDue: true },
    }),
    prisma.invoice.findFirst({
      where:   { clientId, tenantId, status: { not: InvoiceStatus.CANCELLED } },
      orderBy: { issueDate: 'desc' },
      select:  { issueDate: true },
    }),
  ])

  return {
    invoicesCount,
    totalRevenue:   Number(revenue._sum.totalTtc ?? 0),
    outstandingDue: Number(outstanding._sum.amountDue ?? 0),
    lastInvoiceDate: lastInvoice?.issueDate?.toISOString().split('T')[0],
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createClient(dto: CreateClientDto, tenantId: string, userId: string) {
  const { contacts, ...clientData } = dto

  return prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        ...clientData,
        tenantId,
        createdBy: userId,
        contacts: contacts?.length
          ? { create: contacts }
          : undefined,
      },
      include: CLIENT_INCLUDE,
    })

    // Si plusieurs contacts créés, on s'assure qu'un seul est "primary"
    await enforceSinglePrimary(tx, client.id)

    return client
  })
}

export async function updateClient(
  clientId: string,
  dto: UpdateClientDto,
  tenantId: string
) {
  await findByIdOrThrow(clientId, tenantId)

  return prisma.client.update({
    where:   { id: clientId },
    data:    dto,
    include: CLIENT_INCLUDE,
  })
}

export async function archiveClient(clientId: string, tenantId: string) {
  await findByIdOrThrow(clientId, tenantId)

  // Vérifie qu'il n'y a pas de factures ouvertes avant d'archiver
  const openInvoices = await prisma.invoice.count({
    where: {
      clientId,
      tenantId,
      status: { in: [InvoiceStatus.DRAFT, InvoiceStatus.SENT, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
    },
  })

  if (openInvoices > 0) {
    throw new Error(`Impossible d'archiver : ${openInvoices} facture(s) ouverte(s) sur ce client`)
  }

  return prisma.client.update({
    where: { id: clientId },
    data:  { status: ClientStatus.ARCHIVED },
  })
}

export async function deleteClient(clientId: string, tenantId: string) {
  await findByIdOrThrow(clientId, tenantId)

  // Suppression physique uniquement si aucune facture n'est liée
  const hasInvoices = await prisma.invoice.count({ where: { clientId, tenantId } })
  if (hasInvoices > 0) {
    throw new Error('Ce client a des factures associées. Utilisez l\'archivage à la place.')
  }

  return prisma.client.delete({ where: { id: clientId } })
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export async function addContact(
  clientId: string,
  dto: UpsertContactDto,
  tenantId: string
) {
  await findByIdOrThrow(clientId, tenantId)

  return prisma.$transaction(async (tx) => {
    const contact = await tx.clientContact.create({
      data: { ...dto, clientId },
    })
    await enforceSinglePrimary(tx, clientId)
    return contact
  })
}

export async function updateContact(
  contactId: string,
  clientId: string,
  dto: UpsertContactDto,
  tenantId: string
) {
  await findByIdOrThrow(clientId, tenantId)

  return prisma.$transaction(async (tx) => {
    const contact = await tx.clientContact.update({
      where: { id: contactId },
      data:  dto,
    })
    await enforceSinglePrimary(tx, clientId)
    return contact
  })
}

export async function deleteContact(contactId: string, clientId: string, tenantId: string) {
  await findByIdOrThrow(clientId, tenantId)
  return prisma.clientContact.delete({ where: { id: contactId } })
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function getAllTags(tenantId: string): Promise<string[]> {
  // Récupère tous les tags distincts utilisés dans ce tenant
  const clients = await prisma.client.findMany({
    where:  { tenantId, status: { not: ClientStatus.ARCHIVED } },
    select: { tags: true },
  })

  const tagSet = new Set<string>()
  clients.forEach((c) => c.tags.forEach((t) => tagSet.add(t)))
  return Array.from(tagSet).sort()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findByIdOrThrow(clientId: string, tenantId: string) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId },
  })
  if (!client) throw new Error('Client introuvable')
  return client
}

// Garantit qu'un seul contact est isPrimary=true par client
async function enforceSinglePrimary(
  tx: Prisma.TransactionClient,
  clientId: string
) {
  const primaries = await tx.clientContact.findMany({
    where:   { clientId, isPrimary: true },
    orderBy: { createdAt: 'asc' },
  })

  if (primaries.length > 1) {
    // Garde uniquement le premier, retire le flag aux autres
    const toReset = primaries.slice(1).map((c) => c.id)
    await tx.clientContact.updateMany({
      where: { id: { in: toReset } },
      data:  { isPrimary: false },
    })
  }
}
