"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Routes — Module Comptabilité
// Accès restreint : OWNER | ADMIN | ACCOUNTANT
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
const ctrl = __importStar(require("./accounting.controller"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// GET /accounting/journal
//   ?year=2026&month=3          → journal mars 2026
//   ?year=2026&quarter=1        → journal T1 2026
//   ?year=2026                  → journal annuel 2026
//   Retourne : liste chronologique des factures avec détail TVA par taux
router.get('/journal', ctrl.salesJournal);
// GET /accounting/vat
//   ?year=2026&month=3          → TVA collectée mars 2026 (CA3)
//   ?year=2026&quarter=1        → TVA T1 (trimestriel)
//   ?year=2026                  → TVA annuelle (CA12)
//   Retourne : totaux par taux, CA HT, encaissements
router.get('/vat', ctrl.vatReport);
// GET /accounting/export/fec?year=2026
//   Téléchargement : FEC_2026_<tenantId>.txt
//   Format DGFiP — séparateur | — encodage UTF-8 CRLF
//   Compatible avec tous les logiciels comptables agréés
router.get('/export/fec', ctrl.fecExport);
// GET /accounting/export/csv?year=2026&month=3
//   Téléchargement : journal_ventes_2026-03.csv
//   Format lisible dans Excel / LibreOffice — séparateur ; — BOM UTF-8
router.get('/export/csv', ctrl.csvExport);
exports.default = router;
//# sourceMappingURL=accounting.routes.js.map