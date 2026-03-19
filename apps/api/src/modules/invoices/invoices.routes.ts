// ─────────────────────────────────────────────────────────────────────────────
// Routes Express — Module Factures
// Toutes les routes sont protégées par auth + tenant middleware
// ─────────────────────────────────────────────────────────────────────────────

import { Router, IRouter } from 'express'
import * as ctrl from './invoices.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router: IRouter = Router()

router.use(authMiddleware)

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
  .post(ctrl.create)

router
  .route('/:id')
  .get(ctrl.show)
  .put(ctrl.update)

router.post('/:id/send',        ctrl.send)
router.post('/:id/cancel',      ctrl.cancel)
router.post('/:id/credit-note', ctrl.creditNote)
router.get( '/:id/pdf',         ctrl.downloadPdf)
router.post('/:id/send-email',  ctrl.sendByEmail)

// Paiements
router
  .route('/:id/payments')
  .post(ctrl.addPayment)

router
  .route('/:id/payments/:paymentId')
  .delete(ctrl.removePayment)

// Acomptes
router
  .route('/:id/deposits')
  .post(ctrl.addDeposit)

router
  .route('/:id/deposits/:depositId/invoice')
  .post(ctrl.issueDepositInvoice)

export default router