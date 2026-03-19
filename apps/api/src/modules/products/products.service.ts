// ─────────────────────────────────────────────────────────────────────────────
// Service — Module Produits / Services
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { CreateProductDto, UpdateProductDto, ProductFilters } from './products.validators'
import type { CreateCategoryDto, UpdateCategoryDto } from './products.validators'
import { PRODUCT_UNIT_LABELS } from './products.types'

const prisma = new PrismaClient()

// ─── Helpers de calcul ────────────────────────────────────────────────────────

function round2(n: number) { return Math.round(n * 100) / 100 }

function buildProductResponse(p: any) {
  const unitPrice    = Number(p.unitPrice)
  const vatRate      = Number(p.vatRate)
  const unitPriceTtc = round2(unitPrice * (1 + vatRate / 100))

  const costPrice      = p.costPrice ? Number(p.costPrice) : undefined
  const marginAmount   = costPrice !== undefined ? round2(unitPrice - costPrice) : undefined
  const marginPercent  = costPrice !== undefined && unitPrice > 0
    ? round2(((unitPrice - costPrice) / unitPrice) * 100)
    : undefined

  return {
    ...p,
    unitPrice,
    vatRate,
    unitPriceTtc,
    costPrice,
    marginAmount,
    marginPercent,
    unitLabel: PRODUCT_UNIT_LABELS[p.unit as keyof typeof PRODUCT_UNIT_LABELS] ?? p.unit,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.category
      ? { id: p.category.id, name: p.category.name, color: p.category.color }
      : undefined,
  }
}

// ─── Catégories ───────────────────────────────────────────────────────────────

export async function findAllCategories(tenantId: string) {
  const categories = await prisma.productCategory.findMany({
    where:   { tenantId },
    orderBy: { position: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  })

  return categories.map((c) => ({
    id:           c.id,
    name:         c.name,
    description:  c.description,
    color:        c.color,
    position:     c.position,
    productCount: c._count.products,
    createdAt:    c.createdAt.toISOString(),
    updatedAt:    c.updatedAt.toISOString(),
  }))
}

export async function createCategory(dto: CreateCategoryDto, tenantId: string) {
  const exists = await prisma.productCategory.findFirst({
    where: { tenantId, name: { equals: dto.name, mode: 'insensitive' } },
  })
  if (exists) throw new Error(`La catégorie "${dto.name}" existe déjà`)

  return prisma.productCategory.create({ data: { ...dto, tenantId } })
}

export async function updateCategory(
  categoryId: string, dto: UpdateCategoryDto, tenantId: string
) {
  await findCategoryOrThrow(categoryId, tenantId)

  if (dto.name) {
    const conflict = await prisma.productCategory.findFirst({
      where: { tenantId, name: { equals: dto.name, mode: 'insensitive' }, id: { not: categoryId } },
    })
    if (conflict) throw new Error(`La catégorie "${dto.name}" existe déjà`)
  }

  return prisma.productCategory.update({ where: { id: categoryId }, data: dto })
}

export async function deleteCategory(categoryId: string, tenantId: string) {
  await findCategoryOrThrow(categoryId, tenantId)

  // Retire la catégorie des produits liés plutôt que de bloquer
  await prisma.product.updateMany({
    where: { categoryId, tenantId },
    data:  { categoryId: null },
  })

  return prisma.productCategory.delete({ where: { id: categoryId } })
}

// ─── Produits — Lecture ───────────────────────────────────────────────────────

export async function findAll(tenantId: string, filters: ProductFilters) {
  const {
    search, type, categoryId, isActive, isFavorite,
    vatRate, priceMin, priceMax,
    page, limit, sortBy, sortDir,
  } = filters
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {
    tenantId,
    // Par défaut n'affiche que les actifs — sauf si isActive est explicitement false
    ...(isActive !== undefined ? { isActive } : { isActive: true }),
    ...(type       && { type }),
    ...(categoryId && { categoryId }),
    ...(isFavorite !== undefined && { isFavorite }),
    ...(vatRate    !== undefined && { vatRate: new Decimal(vatRate) }),
    ...(priceMin !== undefined || priceMax !== undefined
      ? { unitPrice: {
          ...(priceMin !== undefined && { gte: new Decimal(priceMin) }),
          ...(priceMax !== undefined && { lte: new Decimal(priceMax) }),
        }}
      : {}
    ),
    ...(search && {
      OR: [
        { name:             { contains: search, mode: 'insensitive' } },
        { sku:              { contains: search, mode: 'insensitive' } },
        { descriptionShort: { contains: search, mode: 'insensitive' } },
        { description:      { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sortBy === 'unitPrice' ? { unitPrice: sortDir } :
    sortBy === 'createdAt' ? { createdAt: sortDir } :
                             { name:      sortDir }

  const [total, data] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take:    limit,
      orderBy,
      include: { category: true },
    }),
  ])

  return {
    data: data.map(buildProductResponse),
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  }
}

export async function findById(productId: string, tenantId: string) {
  const product = await prisma.product.findFirst({
    where:   { id: productId, tenantId },
    include: { category: true },
  })
  return product ? buildProductResponse(product) : null
}

// ─── Produits — Écriture ──────────────────────────────────────────────────────

export async function createProduct(dto: CreateProductDto, tenantId: string, userId: string) {
  if (dto.sku) await checkSkuUnique(dto.sku, tenantId)
  if (dto.categoryId) await findCategoryOrThrow(dto.categoryId, tenantId)

  const product = await prisma.product.create({
    data: {
      tenantId,
      createdBy:        userId,
      type:             dto.type,
      sku:              dto.sku,
      name:             dto.name,
      description:      dto.description,
      descriptionShort: dto.descriptionShort,
      categoryId:       dto.categoryId,
      unitPrice:        new Decimal(dto.unitPrice),
      unit:             dto.unit ?? 'PIECE',
      currency:         dto.currency ?? 'EUR',
      vatRate:          new Decimal(dto.vatRate),
      vatExempt:        dto.vatExempt ?? false,
      vatExemptRef:     dto.vatExemptRef,
      costPrice:        dto.costPrice !== undefined ? new Decimal(dto.costPrice) : null,
      isActive:         dto.isActive  ?? true,
      isFavorite:       dto.isFavorite ?? false,
    },
    include: { category: true },
  })

  return buildProductResponse(product)
}

export async function updateProduct(
  productId: string, dto: UpdateProductDto, tenantId: string
) {
  await findByIdOrThrow(productId, tenantId)
  if (dto.sku) await checkSkuUnique(dto.sku, tenantId, productId)
  if (dto.categoryId) await findCategoryOrThrow(dto.categoryId, tenantId)

  const product = await prisma.product.update({
    where: { id: productId },
    data:  {
      ...dto,
      ...(dto.unitPrice  !== undefined && { unitPrice:  new Decimal(dto.unitPrice) }),
      ...(dto.vatRate    !== undefined && { vatRate:    new Decimal(dto.vatRate) }),
      ...(dto.costPrice  !== undefined && { costPrice:  dto.costPrice !== null ? new Decimal(dto.costPrice) : null }),
    },
    include: { category: true },
  })

  return buildProductResponse(product)
}

export async function toggleActive(productId: string, tenantId: string) {
  const product = await findByIdOrThrow(productId, tenantId)
  return prisma.product.update({
    where: { id: productId },
    data:  { isActive: !product.isActive },
  })
}

export async function toggleFavorite(productId: string, tenantId: string) {
  const product = await findByIdOrThrow(productId, tenantId)
  return prisma.product.update({
    where: { id: productId },
    data:  { isFavorite: !product.isFavorite },
  })
}

export async function deleteProduct(productId: string, tenantId: string) {
  await findByIdOrThrow(productId, tenantId)

  // Vérifie si le produit est utilisé dans des lignes de facture
  const usageCount = await prisma.invoiceLine.count({ where: { productId } })
  if (usageCount > 0) {
    throw new Error(
      `Ce produit est référencé dans ${usageCount} ligne(s) de facture. Désactivez-le plutôt que de le supprimer.`
    )
  }

  return prisma.product.delete({ where: { id: productId } })
}

// ─── Duplication ─────────────────────────────────────────────────────────────

export async function duplicateProduct(productId: string, tenantId: string, userId: string) {
  const source = await findByIdOrThrow(productId, tenantId)

  const newSku = source.sku ? `${source.sku}-COPIE` : undefined

  return prisma.product.create({
    data: {
      tenantId,
      createdBy:        userId,
      type:             source.type,
      sku:              newSku,
      name:             `${source.name} (copie)`,
      description:      source.description,
      descriptionShort: source.descriptionShort,
      categoryId:       source.categoryId,
      unitPrice:        source.unitPrice,
      unit:             source.unit,
      currency:         source.currency,
      vatRate:          source.vatRate,
      vatExempt:        source.vatExempt,
      vatExemptRef:     source.vatExemptRef,
      costPrice:        source.costPrice,
      isActive:         false,  // Copie en brouillon
      isFavorite:       false,
    },
    include: { category: true },
  }).then(buildProductResponse)
}

// ─── Statistiques d'usage ─────────────────────────────────────────────────────

export async function getProductStats(productId: string, tenantId: string) {
  await findByIdOrThrow(productId, tenantId)

  const [usageCount, lastUsed, revenue] = await Promise.all([
    prisma.invoiceLine.count({
      where: { productId },
    }),
    prisma.invoiceLine.findFirst({
      where:   { productId },
      orderBy: { invoice: { issueDate: 'desc' } },
      select:  { invoice: { select: { issueDate: true, number: true } } },
    }),
    prisma.invoiceLine.aggregate({
      where: { productId },
      _sum:  { lineTotalHt: true, lineTotalTtc: true },
    }),
  ])

  return {
    usageCount,
    lastUsedDate:   lastUsed?.invoice.issueDate?.toISOString().split('T')[0],
    lastInvoiceRef: lastUsed?.invoice.number,
    totalRevenueHt: Number(revenue._sum.lineTotalHt ?? 0),
    totalRevenueTtc:Number(revenue._sum.lineTotalTtc ?? 0),
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findByIdOrThrow(productId: string, tenantId: string) {
  const p = await prisma.product.findFirst({ where: { id: productId, tenantId } })
  if (!p) throw new Error('Produit introuvable')
  return p
}

async function findCategoryOrThrow(categoryId: string, tenantId: string) {
  const c = await prisma.productCategory.findFirst({ where: { id: categoryId, tenantId } })
  if (!c) throw new Error('Catégorie introuvable')
  return c
}

async function checkSkuUnique(sku: string, tenantId: string, excludeId?: string) {
  const conflict = await prisma.product.findFirst({
    where: { tenantId, sku, ...(excludeId && { id: { not: excludeId } }) },
  })
  if (conflict) throw new Error(`La référence SKU "${sku}" est déjà utilisée`)
}
