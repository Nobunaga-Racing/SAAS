"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Validators Zod — Module Produits / Services
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.productFiltersSchema = exports.updateProductSchema = exports.createProductSchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const products_types_1 = require("./products.types");
// ─── Catégorie ────────────────────────────────────────────────────────────────
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Le nom est requis').max(100),
    description: zod_1.z.string().max(255).optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format hex invalide (#RRGGBB)').optional(),
    position: zod_1.z.number().int().min(0).default(0),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
// ─── Produit ──────────────────────────────────────────────────────────────────
// Schéma de base sans refinements — permet d'appeler .partial() pour l'update
const productBaseSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(products_types_1.ProductType).default(products_types_1.ProductType.SERVICE),
    sku: zod_1.z.string().max(100).optional(),
    name: zod_1.z.string().min(1, 'Le nom est requis').max(255),
    description: zod_1.z.string().max(10000).optional(),
    descriptionShort: zod_1.z.string().max(500).optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    // Tarification
    unitPrice: zod_1.z.number().min(0, 'Le prix ne peut pas être négatif'),
    unit: zod_1.z.nativeEnum(products_types_1.ProductUnit).default(products_types_1.ProductUnit.PIECE),
    currency: zod_1.z.string().length(3).default('EUR'),
    // TVA
    vatRate: zod_1.z
        .number()
        .refine((v) => products_types_1.VAT_RATES_ALLOWED.includes(v), {
        message: `Taux TVA invalide. Valeurs acceptées : ${products_types_1.VAT_RATES_ALLOWED.join(', ')} %`,
    }),
    vatExempt: zod_1.z.boolean().default(false),
    vatExemptRef: zod_1.z.string().max(255).optional(),
    // Prix de revient
    costPrice: zod_1.z.number().min(0).optional(),
    isActive: zod_1.z.boolean().default(true),
    isFavorite: zod_1.z.boolean().default(false),
});
exports.createProductSchema = productBaseSchema
    .refine((d) => !(d.vatExempt && d.vatRate !== 0), { message: 'Un produit exonéré de TVA doit avoir un taux de 0 %', path: ['vatRate'] })
    .refine((d) => !(d.vatExempt && !d.vatExemptRef), {
    message: 'La mention légale d\'exonération est requise (ex: "TVA non applicable - art. 293B CGI")',
    path: ['vatExemptRef'],
});
// .partial() appelé sur le schéma de base (avant les refinements)
exports.updateProductSchema = productBaseSchema.partial();
// ─── Filtres ──────────────────────────────────────────────────────────────────
exports.productFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().max(100).optional(),
    type: zod_1.z.nativeEnum(products_types_1.ProductType).optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    isFavorite: zod_1.z.coerce.boolean().optional(),
    vatRate: zod_1.z.coerce.number().optional(),
    priceMin: zod_1.z.coerce.number().min(0).optional(),
    priceMax: zod_1.z.coerce.number().min(0).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['name', 'unitPrice', 'createdAt']).default('name'),
    sortDir: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
//# sourceMappingURL=products.validators.js.map