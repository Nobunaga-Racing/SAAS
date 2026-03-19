// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Clients
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express'
import * as service from './clients.service'
import {
  createClientSchema,
  updateClientSchema,
  upsertContactSchema,
  clientFiltersSchema,
} from './clients.validators'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok   = (res: Response, data: unknown, status = 200) => res.status(status).json({ data })
const fail = (res: Response, message: string, status = 400) => res.status(status).json({ error: { message } })

const getTenant = (req: Request): string => req.user!.tenantId
const getUser   = (req: Request): string => req.user!.userId
const p         = (req: Request, key: string): string => req.params[key] as string

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = clientFiltersSchema.parse(req.query)
    const result  = await service.findAll(getTenant(req), filters)
    ok(res, result)
  } catch (e) { next(e) }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const client = await service.findById(p(req, 'id'), getTenant(req))
    if (!client) { fail(res, 'Client introuvable', 404); return }

    const stats = await service.getClientStats(p(req, 'id'), getTenant(req))
    ok(res, { ...client, stats })
  } catch (e) { next(e) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto    = createClientSchema.parse(req.body)
    const client = await service.createClient(dto, getTenant(req), getUser(req))
    ok(res, client, 201)
  } catch (e) { next(e) }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto    = updateClientSchema.parse(req.body)
    const client = await service.updateClient(p(req, 'id'), dto, getTenant(req))
    ok(res, client)
  } catch (e) { next(e) }
}

export async function archive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const client = await service.archiveClient(p(req, 'id'), getTenant(req))
    ok(res, client)
  } catch (e) { next(e) }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.deleteClient(p(req, 'id'), getTenant(req))
    res.status(204).send()
  } catch (e) { next(e) }
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export async function addContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto     = upsertContactSchema.parse(req.body)
    const contact = await service.addContact(p(req, 'id'), dto, getTenant(req))
    ok(res, contact, 201)
  } catch (e) { next(e) }
}

export async function updateContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto     = upsertContactSchema.parse(req.body)
    const contact = await service.updateContact(
      p(req, 'contactId'),
      p(req, 'id'),
      dto,
      getTenant(req)
    )
    ok(res, contact)
  } catch (e) { next(e) }
}

export async function deleteContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.deleteContact(p(req, 'contactId'), p(req, 'id'), getTenant(req))
    res.status(204).send()
  } catch (e) { next(e) }
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function listTags(req: Request, res: Response, next: NextFunction) {
  try {
    const tags = await service.getAllTags(getTenant(req))
    ok(res, tags)
  } catch (e) { next(e) }
}
