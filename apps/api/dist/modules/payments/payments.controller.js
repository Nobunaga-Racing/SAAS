"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Paiements
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
exports.remove = remove;
exports.stats = stats;
const service = __importStar(require("./payments.service"));
const payments_service_1 = require("./payments.service");
const ok = (res, data, status = 200) => res.status(status).json({ data });
const fail = (res, message, status = 400) => res.status(status).json({ error: { message } });
const getTenant = (req) => req.user.tenantId;
const p = (req, key) => req.params[key];
// ─── Liste paginée ────────────────────────────────────────────────────────────
async function list(req, res, next) {
    try {
        ok(res, await service.findAll(getTenant(req), payments_service_1.paymentFiltersSchema.parse(req.query)));
    }
    catch (e) {
        next(e);
    }
}
// ─── Détail ───────────────────────────────────────────────────────────────────
async function show(req, res, next) {
    try {
        const payment = await service.findById(p(req, 'id'), getTenant(req));
        if (!payment) {
            fail(res, 'Paiement introuvable', 404);
            return;
        }
        ok(res, payment);
    }
    catch (e) {
        next(e);
    }
}
// ─── Enregistrer un paiement ─────────────────────────────────────────────────
async function create(req, res, next) {
    try {
        const dto = payments_service_1.createPaymentSchema.parse(req.body);
        ok(res, await service.recordPayment(dto, getTenant(req)), 201);
    }
    catch (e) {
        next(e);
    }
}
// ─── Supprimer un paiement ────────────────────────────────────────────────────
async function remove(req, res, next) {
    try {
        await service.removePayment(p(req, 'id'), getTenant(req));
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
// ─── Statistiques ─────────────────────────────────────────────────────────────
async function stats(req, res, next) {
    try {
        const { dateFrom, dateTo } = req.query;
        ok(res, await service.getStats(getTenant(req), dateFrom, dateTo));
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=payments.controller.js.map