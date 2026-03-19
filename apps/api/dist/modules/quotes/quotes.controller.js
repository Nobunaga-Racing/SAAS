"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Devis
// ─────────────────────────────────────────────────────────────────────────────
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.show = show;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.send = send;
exports.accept = accept;
exports.reject = reject;
exports.convert = convert;
exports.duplicate = duplicate;
exports.downloadPdf = downloadPdf;
exports.sendByEmail = sendByEmail;
const service = __importStar(require("./quotes.service"));
const invoice_pdf_1 = require("../pdf/invoice.pdf");
const email_service_1 = require("../email/email.service");
const quotes_validators_1 = require("./quotes.validators");
const ok = (res, data, status = 200) => res.status(status).json({ data });
const fail = (res, message, status = 400) => res.status(status).json({ error: { message } });
const getTenant = (req) => req.user.tenantId;
const getUser = (req) => req.user.userId;
const p = (req, key) => req.params[key];
// ─── CRUD ─────────────────────────────────────────────────────────────────────
async function list(req, res, next) {
    try {
        ok(res, await service.findAll(getTenant(req), quotes_validators_1.quoteFiltersSchema.parse(req.query)));
    }
    catch (e) {
        next(e);
    }
}
async function show(req, res, next) {
    try {
        const quote = await service.findById(p(req, 'id'), getTenant(req));
        if (!quote) {
            fail(res, 'Devis introuvable', 404);
            return;
        }
        ok(res, quote);
    }
    catch (e) {
        next(e);
    }
}
async function create(req, res, next) {
    try {
        const dto = quotes_validators_1.createQuoteSchema.parse(req.body);
        ok(res, await service.createQuote(dto, getTenant(req), getUser(req)), 201);
    }
    catch (e) {
        next(e);
    }
}
async function update(req, res, next) {
    try {
        const dto = quotes_validators_1.updateQuoteSchema.parse(req.body);
        ok(res, await service.updateQuote(p(req, 'id'), dto, getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
async function remove(req, res, next) {
    try {
        await service.deleteQuote(p(req, 'id'), getTenant(req));
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
// ─── Transitions de statut ────────────────────────────────────────────────────
async function send(req, res, next) {
    try {
        ok(res, await service.sendQuote(p(req, 'id'), getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
async function accept(req, res, next) {
    try {
        ok(res, await service.acceptQuote(p(req, 'id'), getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
async function reject(req, res, next) {
    try {
        const dto = quotes_validators_1.rejectQuoteSchema.parse(req.body);
        ok(res, await service.rejectQuote(p(req, 'id'), dto, getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
// ─── Actions ──────────────────────────────────────────────────────────────────
async function convert(req, res, next) {
    try {
        ok(res, await service.convertToInvoice(p(req, 'id'), getTenant(req), getUser(req)), 201);
    }
    catch (e) {
        next(e);
    }
}
async function duplicate(req, res, next) {
    try {
        ok(res, await service.duplicateQuote(p(req, 'id'), getTenant(req), getUser(req)), 201);
    }
    catch (e) {
        next(e);
    }
}
// ─── PDF ──────────────────────────────────────────────────────────────────────
async function downloadPdf(req, res, next) {
    try {
        const { quote, settings } = await service.getQuoteWithSettings(p(req, 'id'), getTenant(req));
        const pdfBuffer = await (0, invoice_pdf_1.generateInvoicePdf)({
            type: 'quote',
            number: quote.number,
            issueDate: quote.issueDate,
            expiryDate: quote.expiryDate,
            subject: quote.subject,
            notes: quote.notes,
            footer: quote.footer,
            client: quote.client ?? { name: 'Client' },
            lines: quote.lines,
            subtotalHt: quote.totals.subtotalHt,
            discountAmount: quote.totals.discountAmount,
            totalHt: quote.totals.totalHt,
            totalVat: quote.totals.totalVat,
            totalTtc: quote.totals.totalTtc,
            settings,
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${quote.number}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (e) {
        next(e);
    }
}
// ─── Email ────────────────────────────────────────────────────────────────────
async function sendByEmail(req, res, next) {
    try {
        const { quote, settings } = await service.getQuoteWithSettings(p(req, 'id'), getTenant(req));
        if (!(0, email_service_1.isSmtpConfigured)(settings)) {
            fail(res, 'Email non configuré. Rendez-vous dans Paramètres → Configuration email.', 503);
            return;
        }
        if (!quote.client?.email && !req.body.to) {
            fail(res, 'Adresse email destinataire manquante', 400);
            return;
        }
        const to = req.body.to ?? quote.client.email;
        const pdfBuffer = await (0, invoice_pdf_1.generateInvoicePdf)({
            type: 'quote', number: quote.number,
            issueDate: quote.issueDate, expiryDate: quote.expiryDate,
            subject: quote.subject, notes: quote.notes, footer: quote.footer,
            client: quote.client ?? { name: 'Client' }, lines: quote.lines,
            subtotalHt: quote.totals.subtotalHt, discountAmount: quote.totals.discountAmount,
            totalHt: quote.totals.totalHt, totalVat: quote.totals.totalVat,
            totalTtc: quote.totals.totalTtc, settings,
        });
        const ttc = quote.totals.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
        const expiry = quote.expiryDate ? new Date(quote.expiryDate).toLocaleDateString('fr-FR') : undefined;
        await (0, email_service_1.sendMail)({
            to,
            subject: `Devis ${quote.number} — ${settings.companyName ?? ''}`,
            html: (0, email_service_1.invoiceEmailHtml)({
                clientName: quote.client?.name ?? to,
                docType: 'devis', number: quote.number,
                totalTtc: ttc, companyName: settings.companyName, dueOrExpiry: expiry,
                notes: quote.notes,
            }),
            attachments: [{ filename: `${quote.number}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
        }, settings);
        if (quote.status === 'DRAFT') {
            await service.sendQuote(quote.id, getTenant(req));
        }
        ok(res, { sent: true, to });
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=quotes.controller.js.map