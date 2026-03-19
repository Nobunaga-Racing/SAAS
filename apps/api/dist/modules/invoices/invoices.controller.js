"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Factures
// Gère les requêtes HTTP, délègue au service, formate les réponses
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
exports.send = send;
exports.cancel = cancel;
exports.creditNote = creditNote;
exports.addPayment = addPayment;
exports.removePayment = removePayment;
exports.addDeposit = addDeposit;
exports.issueDepositInvoice = issueDepositInvoice;
exports.downloadPdf = downloadPdf;
exports.sendByEmail = sendByEmail;
const invoicesService = __importStar(require("./invoices.service"));
const invoice_pdf_1 = require("../pdf/invoice.pdf");
const email_service_1 = require("../email/email.service");
const validators_1 = require("@saas-gestion/validators");
// ─── Helpers ──────────────────────────────────────────────────────────────────
const ok = (res, data, status = 200) => res.status(status).json({ data });
const fail = (res, message, status = 400) => res.status(status).json({ error: { message } });
function getTenant(req) {
    return req.user.tenantId;
}
function getUser(req) {
    return req.user.userId;
}
const p = (req, key) => req.params[key];
// ─── Factures ─────────────────────────────────────────────────────────────────
async function list(req, res, next) {
    try {
        const filters = validators_1.invoiceFiltersSchema.parse(req.query);
        const result = await invoicesService.findAll(getTenant(req), filters);
        ok(res, result);
    }
    catch (e) {
        next(e);
    }
}
async function show(req, res, next) {
    try {
        const raw = await invoicesService.findById(p(req, 'id'), getTenant(req));
        if (!raw) {
            fail(res, 'Facture introuvable', 404);
            return;
        }
        ok(res, invoicesService.formatInvoice(raw));
    }
    catch (e) {
        next(e);
    }
}
async function create(req, res, next) {
    try {
        const dto = validators_1.createInvoiceSchema.parse(req.body);
        const invoice = await invoicesService.createInvoice(dto, getTenant(req), getUser(req));
        ok(res, invoice, 201);
    }
    catch (e) {
        next(e);
    }
}
async function update(req, res, next) {
    try {
        const dto = validators_1.updateInvoiceSchema.parse(req.body);
        const invoice = await invoicesService.updateInvoice(p(req, 'id'), dto, getTenant(req));
        ok(res, invoice);
    }
    catch (e) {
        next(e);
    }
}
async function send(req, res, next) {
    try {
        const invoice = await invoicesService.sendInvoice(p(req, 'id'), getTenant(req));
        ok(res, invoice);
    }
    catch (e) {
        next(e);
    }
}
async function cancel(req, res, next) {
    try {
        const invoice = await invoicesService.cancelInvoice(p(req, 'id'), getTenant(req));
        ok(res, invoice);
    }
    catch (e) {
        next(e);
    }
}
async function creditNote(req, res, next) {
    try {
        const avoir = await invoicesService.createCreditNote(p(req, 'id'), getTenant(req), getUser(req));
        ok(res, avoir, 201);
    }
    catch (e) {
        next(e);
    }
}
// ─── Paiements ────────────────────────────────────────────────────────────────
async function addPayment(req, res, next) {
    try {
        const dto = validators_1.createPaymentSchema.parse(req.body);
        const invoice = await invoicesService.recordPayment(p(req, 'id'), dto, getTenant(req));
        ok(res, invoice, 201);
    }
    catch (e) {
        next(e);
    }
}
async function removePayment(req, res, next) {
    try {
        await invoicesService.deletePayment(p(req, 'paymentId'), p(req, 'id'), getTenant(req));
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
// ─── Acomptes ─────────────────────────────────────────────────────────────────
async function addDeposit(req, res, next) {
    try {
        const dto = validators_1.createDepositSchema.parse(req.body);
        const deposit = await invoicesService.createDeposit(p(req, 'id'), dto, getTenant(req));
        ok(res, deposit, 201);
    }
    catch (e) {
        next(e);
    }
}
async function issueDepositInvoice(req, res, next) {
    try {
        const depInvoice = await invoicesService.generateDepositInvoice(p(req, 'depositId'), getTenant(req), getUser(req));
        ok(res, depInvoice, 201);
    }
    catch (e) {
        next(e);
    }
}
// ─── PDF ──────────────────────────────────────────────────────────────────────
async function downloadPdf(req, res, next) {
    try {
        const { invoice, settings } = await invoicesService.getInvoiceWithSettings(p(req, 'id'), getTenant(req));
        const pdfBuffer = await (0, invoice_pdf_1.generateInvoicePdf)({
            type: 'invoice',
            number: invoice.number,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            subject: invoice.subject,
            notes: invoice.notes,
            footer: invoice.footer,
            client: invoice.client ?? { name: 'Client' },
            lines: invoice.lines,
            subtotalHt: invoice.subtotalHt,
            discountAmount: invoice.discountAmount,
            totalHt: invoice.totalHt,
            totalVat: invoice.totalVat,
            totalTtc: invoice.totalTtc,
            amountPaid: invoice.amountPaid,
            amountDue: invoice.amountDue,
            settings,
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoice.number}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (e) {
        next(e);
    }
}
// ─── Email ────────────────────────────────────────────────────────────────────
async function sendByEmail(req, res, next) {
    try {
        const { invoice, settings } = await invoicesService.getInvoiceWithSettings(p(req, 'id'), getTenant(req));
        if (!(0, email_service_1.isSmtpConfigured)(settings)) {
            fail(res, 'Email non configuré. Rendez-vous dans Paramètres → Configuration email.', 503);
            return;
        }
        if (!invoice.client?.email && !req.body.to) {
            fail(res, 'Adresse email destinataire manquante', 400);
            return;
        }
        const to = req.body.to ?? invoice.client.email;
        const pdfBuffer = await (0, invoice_pdf_1.generateInvoicePdf)({
            type: 'invoice', number: invoice.number,
            issueDate: invoice.issueDate, dueDate: invoice.dueDate,
            subject: invoice.subject, notes: invoice.notes, footer: invoice.footer,
            client: invoice.client ?? { name: 'Client' }, lines: invoice.lines,
            subtotalHt: invoice.subtotalHt, discountAmount: invoice.discountAmount,
            totalHt: invoice.totalHt, totalVat: invoice.totalVat, totalTtc: invoice.totalTtc,
            amountPaid: invoice.amountPaid, amountDue: invoice.amountDue, settings,
        });
        const ttc = invoice.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
        const due = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : undefined;
        await (0, email_service_1.sendMail)({
            to,
            subject: `Facture ${invoice.number} — ${settings.companyName ?? ''}`,
            html: (0, email_service_1.invoiceEmailHtml)({
                clientName: invoice.client?.name ?? to,
                docType: 'facture', number: invoice.number,
                totalTtc: ttc, companyName: settings.companyName, dueOrExpiry: due,
                notes: invoice.notes,
            }),
            attachments: [{ filename: `${invoice.number}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
        }, settings);
        // Marquer comme envoyé si brouillon
        if (invoice.status === 'DRAFT') {
            await invoicesService.sendInvoice(invoice.id, getTenant(req));
        }
        ok(res, { sent: true, to });
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=invoices.controller.js.map