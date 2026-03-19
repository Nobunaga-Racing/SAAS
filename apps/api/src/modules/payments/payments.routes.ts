// ─────────────────────────────────────────────────────────────────────────────
// Routes — Module Paiements
// ─────────────────────────────────────────────────────────────────────────────

import { Router, IRouter } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import * as ctrl from './payments.controller'

const router: IRouter = Router()

router.use(authMiddleware)

// GET  /payments         → liste paginée + filtres (invoiceId, clientId, method, date)
// GET  /payments/stats   → KPIs : total encaissé, par méthode, mensuel, impayés
// GET  /payments/:id     → détail paiement + facture liée
// POST /payments         → enregistrer un paiement (body: invoiceId + données paiement)
// DELETE /payments/:id   → annuler un paiement (recalcule le solde facture)

router.get('/stats', ctrl.stats)   // avant /:id pour éviter le conflit de route

router.get('/',     ctrl.list)
router.get('/:id',  ctrl.show)
router.post('/',    ctrl.create)
router.delete('/:id', ctrl.remove)

export default router
