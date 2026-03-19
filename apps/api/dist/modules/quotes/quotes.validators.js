"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Validators Zod — Module Devis
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteFiltersSchema = exports.rejectQuoteSchema = exports.updateQuoteSchema = exports.createQuoteSchema = void 0;
const zod_1 = require("zod");
const quotes_types_1 = require("./quotes.types");
const isoDate = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD attendu');
// ─── Ligne de devis ───────────────────────────────────────────────────────────
const quoteLineSchema = zod_1.z
    .object({
    productId: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().min(1).max(500),
    quantity: zod_1.z.number().positive('La quantité doit être > 0'),
    unitPrice: zod_1.z.number().min(0),
    vatRate: zod_1.z.number().refine((v) => quotes_types_1.VAT_RATES.includes(v), { message: `Taux TVA invalide. Valeurs : ${quotes_types_1.VAT_RATES.join(', ')} %` }),
    discountType: zod_1.z.nativeEnum(quotes_types_1.DiscountType).optional(),
    discountValue: zod_1.z.number().positive().optional(),
    position: zod_1.z.number().int().min(0),
})
    .refine((d) => {
    if (d.discountType && d.discountValue === undefined)
        return false;
    if (!d.discountType && d.discountValue !== undefined)
        return false;
    if (d.discountType === quotes_types_1.DiscountType.PERCENT && d.discountValue > 100)
        return false;
    if (d.discountType === quotes_types_1.DiscountType.FIXED) {
        if (d.discountValue > d.quantity * d.unitPrice)
            return false;
    }
    return true;
}, { message: 'Remise de ligne invalide' });
// ─── Création devis ───────────────────────────────────────────────────────────
const quoteBaseSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Client requis'),
    issueDate: isoDate,
    expiryDate: isoDate,
    subject: zod_1.z.string().min(1).max(255),
    notes: zod_1.z.string().max(5000).optional(),
    footer: zod_1.z.string().max(2000).optional(),
    discountType: zod_1.z.nativeEnum(quotes_types_1.DiscountType).optional(),
    discountValue: zod_1.z.number().positive().optional(),
    lines: zod_1.z
        .array(quoteLineSchema)
        .min(1, 'Au moins une ligne est requise')
        .max(100),
});
exports.createQuoteSchema = quoteBaseSchema
    .refine((d) => d.expiryDate >= d.issueDate, {
    message: "La date d'expiration doit être >= à la date d'émission",
    path: ['expiryDate'],
})
    .refine((d) => {
    if (d.discountType && d.discountValue === undefined)
        return false;
    if (!d.discountType && d.discountValue !== undefined)
        return false;
    if (d.discountType === quotes_types_1.DiscountType.PERCENT && d.discountValue > 100)
        return false;
    return true;
}, { message: 'Remise globale invalide', path: ['discountValue'] });
// ─── Mise à jour (brouillon uniquement) ──────────────────────────────────────
exports.updateQuoteSchema = quoteBaseSchema
    .omit({ clientId: true })
    .partial()
    .refine((d) => {
    if (d.issueDate && d.expiryDate)
        return d.expiryDate >= d.issueDate;
    return true;
}, { message: "La date d'expiration doit être >= à la date d'émission", path: ['expiryDate'] });
// ─── Refus ────────────────────────────────────────────────────────────────────
exports.rejectQuoteSchema = zod_1.z.object({
    reason: zod_1.z.string().max(500).optional(),
});
// ─── Filtres ──────────────────────────────────────────────────────────────────
exports.quoteFiltersSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(quotes_types_1.QuoteStatus).optional(),
    clientId: zod_1.z.string().uuid().optional(),
    dateFrom: isoDate.optional(),
    dateTo: isoDate.optional(),
    expiredOnly: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(100).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=quotes.validators.js.map