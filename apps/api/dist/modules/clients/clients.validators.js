"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Validators Zod — Module Clients
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientFiltersSchema = exports.upsertContactSchema = exports.updateClientSchema = exports.createClientSchema = exports.contactSchema = void 0;
const zod_1 = require("zod");
const clients_types_1 = require("./clients.types");
// ─── Contact ──────────────────────────────────────────────────────────────────
exports.contactSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    role: zod_1.z.string().max(100).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().max(30).optional(),
    isPrimary: zod_1.z.boolean().default(false),
});
// ─── Création client ──────────────────────────────────────────────────────────
exports.createClientSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(clients_types_1.ClientType).default(clients_types_1.ClientType.COMPANY),
    status: zod_1.z.nativeEnum(clients_types_1.ClientStatus).default(clients_types_1.ClientStatus.PROSPECT),
    name: zod_1.z.string().min(1, 'Le nom est requis').max(255),
    email: zod_1.z.string().email('Email invalide').optional(),
    phone: zod_1.z.string().max(30).optional(),
    website: zod_1.z.string().url('URL invalide').optional(),
    // Légal
    siret: zod_1.z.string().regex(/^\d{14}$/, 'SIRET : 14 chiffres').optional(),
    vatNumber: zod_1.z.string().max(30).optional(),
    // Adresse facturation
    addressLine1: zod_1.z.string().max(255).optional(),
    addressLine2: zod_1.z.string().max(255).optional(),
    city: zod_1.z.string().max(100).optional(),
    zipCode: zod_1.z.string().max(20).optional(),
    country: zod_1.z.string().length(2).default('FR'),
    // Adresse livraison
    shippingAddressLine1: zod_1.z.string().max(255).optional(),
    shippingAddressLine2: zod_1.z.string().max(255).optional(),
    shippingCity: zod_1.z.string().max(100).optional(),
    shippingZipCode: zod_1.z.string().max(20).optional(),
    shippingCountry: zod_1.z.string().length(2).optional(),
    // Paramètres commerciaux
    paymentTermDays: zod_1.z.number().int().min(0).max(365).optional(),
    currency: zod_1.z.string().length(3).default('EUR'),
    notes: zod_1.z.string().max(5000).optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50)).max(20).default([]),
    // Contacts initiaux
    contacts: zod_1.z.array(exports.contactSchema).max(10).default([]),
});
// ─── Mise à jour client ───────────────────────────────────────────────────────
exports.updateClientSchema = exports.createClientSchema
    .omit({ contacts: true })
    .partial();
// ─── Contact (ajout / modification) ──────────────────────────────────────────
exports.upsertContactSchema = exports.contactSchema;
// ─── Filtres liste ────────────────────────────────────────────────────────────
const SORT_FIELDS = ['name', 'createdAt', 'status'];
const SORT_DIRS = ['asc', 'desc'];
exports.clientFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().max(100).optional(),
    status: zod_1.z.nativeEnum(clients_types_1.ClientStatus).optional(),
    type: zod_1.z.nativeEnum(clients_types_1.ClientType).optional(),
    tags: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional()
        .transform((v) => (typeof v === 'string' ? [v] : v)),
    city: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().length(2).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(SORT_FIELDS).default('name'),
    sortDir: zod_1.z.enum(SORT_DIRS).default('asc'),
});
//# sourceMappingURL=clients.validators.js.map