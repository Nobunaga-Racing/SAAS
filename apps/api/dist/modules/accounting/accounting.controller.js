"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Comptabilité
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
exports.salesJournal = salesJournal;
exports.vatReport = vatReport;
exports.fecExport = fecExport;
exports.csvExport = csvExport;
const service = __importStar(require("./accounting.service"));
const accounting_service_1 = require("./accounting.service");
const ok = (res, data, status = 200) => res.status(status).json({ data });
const fail = (res, message, status = 400) => res.status(status).json({ error: { message } });
const getTenant = (req) => req.user.tenantId;
// ─── Journal des ventes ───────────────────────────────────────────────────────
async function salesJournal(req, res, next) {
    try {
        const filters = accounting_service_1.accountingFiltersSchema.parse(req.query);
        ok(res, await service.getSalesJournal(getTenant(req), filters));
    }
    catch (e) {
        next(e);
    }
}
// ─── Rapport TVA ──────────────────────────────────────────────────────────────
async function vatReport(req, res, next) {
    try {
        const filters = accounting_service_1.accountingFiltersSchema.parse(req.query);
        ok(res, await service.getVatReport(getTenant(req), filters));
    }
    catch (e) {
        next(e);
    }
}
// ─── Export FEC ───────────────────────────────────────────────────────────────
async function fecExport(req, res, next) {
    try {
        const year = Number(req.query.year);
        if (!year || year < 2020 || year > 2099) {
            fail(res, 'Paramètre year requis (2020-2099)', 400);
            return;
        }
        const content = await service.exportFec(getTenant(req), year);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="FEC_${year}_${getTenant(req)}.txt"`);
        res.send(content);
    }
    catch (e) {
        next(e);
    }
}
// ─── Export CSV ───────────────────────────────────────────────────────────────
async function csvExport(req, res, next) {
    try {
        const filters = accounting_service_1.accountingFiltersSchema.parse(req.query);
        const content = await service.exportCsv(getTenant(req), filters);
        const suffix = filters.month
            ? `${filters.year}-${String(filters.month).padStart(2, '0')}`
            : filters.quarter
                ? `${filters.year}-T${filters.quarter}`
                : String(filters.year);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="journal_ventes_${suffix}.csv"`);
        res.send('\uFEFF' + content); // BOM UTF-8 pour compatibilité Excel
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=accounting.controller.js.map