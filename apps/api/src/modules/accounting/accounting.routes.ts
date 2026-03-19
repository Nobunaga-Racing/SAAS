// ─────────────────────────────────────────────────────────────────────────────
// Routes — Module Comptabilité
// Accès restreint : OWNER | ADMIN | ACCOUNTANT
// ─────────────────────────────────────────────────────────────────────────────

import { Router, IRouter } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import * as ctrl from './accounting.controller'

const router: IRouter = Router()

router.use(authMiddleware)

// GET /accounting/journal
//   ?year=2026&month=3          → journal mars 2026
//   ?year=2026&quarter=1        → journal T1 2026
//   ?year=2026                  → journal annuel 2026
//   Retourne : liste chronologique des factures avec détail TVA par taux
router.get('/journal', ctrl.salesJournal)

// GET /accounting/vat
//   ?year=2026&month=3          → TVA collectée mars 2026 (CA3)
//   ?year=2026&quarter=1        → TVA T1 (trimestriel)
//   ?year=2026                  → TVA annuelle (CA12)
//   Retourne : totaux par taux, CA HT, encaissements
router.get('/vat', ctrl.vatReport)

// GET /accounting/export/fec?year=2026
//   Téléchargement : FEC_2026_<tenantId>.txt
//   Format DGFiP — séparateur | — encodage UTF-8 CRLF
//   Compatible avec tous les logiciels comptables agréés
router.get('/export/fec', ctrl.fecExport)

// GET /accounting/export/csv?year=2026&month=3
//   Téléchargement : journal_ventes_2026-03.csv
//   Format lisible dans Excel / LibreOffice — séparateur ; — BOM UTF-8
router.get('/export/csv', ctrl.csvExport)

export default router
