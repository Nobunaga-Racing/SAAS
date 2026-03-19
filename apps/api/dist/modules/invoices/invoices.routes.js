"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Routes Express — Module Factures
// Toutes les routes sont protégées par auth + tenant middleware
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
const express_1 = require("express");
const ctrl = __importStar(require("./invoices.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// ─── Factures ─────────────────────────────────────────────────────────────────
//
//  GET    /invoices              → Liste paginée + filtres
//  POST   /invoices              → Créer une facture (brouillon)
//  GET    /invoices/:id          → Détail d'une facture
//  PUT    /invoices/:id          → Modifier un brouillon
//  POST   /invoices/:id/send     → Envoyer (DRAFT → SENT)
//  POST   /invoices/:id/cancel   → Annuler
//  POST   /invoices/:id/credit-note → Générer un avoir
//
// ─── Paiements ────────────────────────────────────────────────────────────────
//
//  POST   /invoices/:id/payments              → Enregistrer un paiement
//  DELETE /invoices/:id/payments/:paymentId   → Supprimer un paiement
//
// ─── Acomptes ─────────────────────────────────────────────────────────────────
//
//  POST   /invoices/:id/deposits                        → Créer un acompte
//  POST   /invoices/:id/deposits/:depositId/invoice     → Émettre facture d'acompte
router
    .route('/')
    .get(ctrl.list)
    .post(ctrl.create);
router
    .route('/:id')
    .get(ctrl.show)
    .put(ctrl.update);
router.post('/:id/send', ctrl.send);
router.post('/:id/cancel', ctrl.cancel);
router.post('/:id/credit-note', ctrl.creditNote);
router.get('/:id/pdf', ctrl.downloadPdf);
router.post('/:id/send-email', ctrl.sendByEmail);
// Paiements
router
    .route('/:id/payments')
    .post(ctrl.addPayment);
router
    .route('/:id/payments/:paymentId')
    .delete(ctrl.removePayment);
// Acomptes
router
    .route('/:id/deposits')
    .post(ctrl.addDeposit);
router
    .route('/:id/deposits/:depositId/invoice')
    .post(ctrl.issueDepositInvoice);
exports.default = router;
//# sourceMappingURL=invoices.routes.js.map