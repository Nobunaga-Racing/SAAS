"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Routes — Module Paiements
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
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const ctrl = __importStar(require("./payments.controller"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// GET  /payments         → liste paginée + filtres (invoiceId, clientId, method, date)
// GET  /payments/stats   → KPIs : total encaissé, par méthode, mensuel, impayés
// GET  /payments/:id     → détail paiement + facture liée
// POST /payments         → enregistrer un paiement (body: invoiceId + données paiement)
// DELETE /payments/:id   → annuler un paiement (recalcule le solde facture)
router.get('/stats', ctrl.stats); // avant /:id pour éviter le conflit de route
router.get('/', ctrl.list);
router.get('/:id', ctrl.show);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map