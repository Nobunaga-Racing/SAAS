"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Validators Zod — Module Factures
// Partagés entre frontend (Next.js) et backend (Express)
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceFiltersSchema = exports.createDepositSchema = exports.createPaymentSchema = exports.updateInvoiceSchema = exports.createInvoiceSchema = exports.invoiceLineSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
// ─── Taux de TVA valides ──────────────────────────────────────────────────────
const VAT_RATE_VALUES = [0, 5.5, 10, 20];
const vatRateSchema = zod_1.z
    .number()
    .refine((v) => VAT_RATE_VALUES.includes(v), {
    message: `Taux de TVA invalide. Valeurs acceptées : ${VAT_RATE_VALUES.join(', ')}`,
});
// ─── Ligne de facture ─────────────────────────────────────────────────────────
exports.invoiceLineSchema = zod_1.z
    .object({
    productId: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().min(1, 'Description requise').max(500),
    quantity: zod_1.z.number().positive('La quantité doit être > 0'),
    unitPrice: zod_1.z.number().min(0, 'Le prix unitaire ne peut pas être négatif'),
    vatRate: vatRateSchema,
    discountType: zod_1.z.nativeEnum(enums_1.DiscountType).optional(),
    discountValue: zod_1.z.number().positive().optional(),
    position: zod_1.z.number().int().min(0),
})
    .refine((d) => {
    // Si discountType défini, discountValue doit l'être aussi
    if (d.discountType && d.discountValue === undefined)
        return false;
    if (!d.discountType && d.discountValue !== undefined)
        return false;
    // Remise % : max 100
    if (d.discountType === enums_1.DiscountType.PERCENT && d.discountValue > 100)
        return false;
    // Remise fixe : max prix total ligne
    if (d.discountType === enums_1.DiscountType.FIXED) {
        const lineTotal = d.quantity * d.unitPrice;
        if (d.discountValue > lineTotal)
            return false;
    }
    return true;
}, { message: 'Remise invalide sur la ligne' });
// ─── Création facture ─────────────────────────────────────────────────────────
// Schéma de base sans refinements — permet .omit() et .partial() pour l'update
const invoiceBaseSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Client requis'),
    quoteId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.nativeEnum(enums_1.InvoiceType).default(enums_1.InvoiceType.INVOICE),
    issueDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date : YYYY-MM-DD'),
    dueDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date : YYYY-MM-DD'),
    subject: zod_1.z.string().min(1, 'Objet requis').max(255),
    notes: zod_1.z.string().max(2000).optional(),
    footer: zod_1.z.string().max(1000).optional(),
    discountType: zod_1.z.nativeEnum(enums_1.DiscountType).optional(),
    discountValue: zod_1.z.number().positive().optional(),
    depositAmount: zod_1.z.number().min(0).default(0),
    lines: zod_1.z
        .array(exports.invoiceLineSchema)
        .min(1, 'Au moins une ligne est requise')
        .max(100, 'Maximum 100 lignes par facture'),
});
exports.createInvoiceSchema = invoiceBaseSchema
    .refine((d) => d.dueDate >= d.issueDate, {
    message: "La date d'échéance doit être >= à la date d'émission",
    path: ['dueDate'],
})
    .refine((d) => {
    if (d.discountType && d.discountValue === undefined)
        return false;
    if (!d.discountType && d.discountValue !== undefined)
        return false;
    if (d.discountType === enums_1.DiscountType.PERCENT && d.discountValue > 100)
        return false;
    return true;
}, { message: 'Remise globale invalide', path: ['discountValue'] });
// ─── Mise à jour facture (brouillon uniquement) ───────────────────────────────
exports.updateInvoiceSchema = invoiceBaseSchema
    .omit({ type: true, clientId: true })
    .partial()
    .refine((d) => {
    if (d.issueDate && d.dueDate)
        return d.dueDate >= d.issueDate;
    return true;
}, { message: "La date d'échéance doit être >= à la date d'émission", path: ['dueDate'] });
// ─── Enregistrement paiement ──────────────────────────────────────────────────
exports.createPaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Le montant doit être > 0'),
    method: zod_1.z.nativeEnum(enums_1.PaymentMethod),
    paymentDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date : YYYY-MM-DD'),
    reference: zod_1.z.string().max(255).optional(),
    notes: zod_1.z.string().max(500).optional(),
});
// ─── Acompte ──────────────────────────────────────────────────────────────────
exports.createDepositSchema = zod_1.z
    .object({
    amountType: zod_1.z.nativeEnum(enums_1.DiscountType),
    amountValue: zod_1.z.number().positive('Le montant de l\'acompte doit être > 0'),
    dueDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date : YYYY-MM-DD'),
    notes: zod_1.z.string().max(500).optional(),
})
    .refine((d) => {
    if (d.amountType === enums_1.DiscountType.PERCENT && d.amountValue > 100)
        return false;
    return true;
}, { message: "Le pourcentage d'acompte ne peut dépasser 100%", path: ['amountValue'] });
// ─── Filtres liste ────────────────────────────────────────────────────────────
exports.invoiceFiltersSchema = zod_1.z.object({
    status: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    clientId: zod_1.z.string().uuid().optional(),
    dateFrom: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateTo: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    overdue: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(100).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
