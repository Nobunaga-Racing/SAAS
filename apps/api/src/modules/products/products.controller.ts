// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Produits / Services
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express'
import * as service from './products.service'
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
  createCategorySchema,
  updateCategorySchema,
} from './products.validators'

const ok   = (res: Response, data: unknown, status = 200) => res.status(status).json({ data })
const fail = (res: Response, message: string, status = 400) => res.status(status).json({ error: { message } })

const getTenant = (req: Request) => req.user!.tenantId
const getUser   = (req: Request) => req.user!.userId
const param     = (req: Request, key: string) => req.params[key] as string

// ─── Catégories ───────────────────────────────────────────────────────────────

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await service.findAllCategories(getTenant(req)))
  } catch (e) { next(e) }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createCategorySchema.parse(req.body)
    ok(res, await service.createCategory(dto, getTenant(req)), 201)
  } catch (e) { next(e) }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateCategorySchema.parse(req.body)
    ok(res, await service.updateCategory(param(req, 'categoryId'), dto, getTenant(req)))
  } catch (e) { next(e) }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteCategory(param(req, 'categoryId'), getTenant(req))
    res.status(204).send()
  } catch (e) { next(e) }
}

// ─── Produits ─────────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = productFiltersSchema.parse(req.query)
    ok(res, await service.findAll(getTenant(req), filters))
  } catch (e) { next(e) }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await service.findById(param(req, 'id'), getTenant(req))
    if (!product) { fail(res, 'Produit introuvable', 404); return }
    ok(res, product)
  } catch (e) { next(e) }
}

export async function showStats(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await service.getProductStats(param(req, 'id'), getTenant(req)))
  } catch (e) { next(e) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createProductSchema.parse(req.body)
    ok(res, await service.createProduct(dto, getTenant(req), getUser(req)), 201)
  } catch (e) { next(e) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateProductSchema.parse(req.body)
    ok(res, await service.updateProduct(param(req, 'id'), dto, getTenant(req)))
  } catch (e) { next(e) }
}

export async function toggleActive(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await service.toggleActive(param(req, 'id'), getTenant(req)))
  } catch (e) { next(e) }
}

export async function toggleFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await service.toggleFavorite(param(req, 'id'), getTenant(req)))
  } catch (e) { next(e) }
}

export async function duplicate(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await service.duplicateProduct(param(req, 'id'), getTenant(req), getUser(req)), 201)
  } catch (e) { next(e) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteProduct(param(req, 'id'), getTenant(req))
    res.status(204).send()
  } catch (e) { next(e) }
}
