// ─────────────────────────────────────────────────────────────────────────────
// Routes — Module Devis
// ─────────────────────────────────────────────────────────────────────────────

import { Router, IRouter } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import * as ctrl from './quotes.controller'

const router: IRouter = Router()

router.use(authMiddleware)

// ─── CRUD ─────────────────────────────────────────────────────────────────────

router.get('/',     ctrl.list)
router.post('/',    ctrl.create)
router.get('/:id',  ctrl.show)
router.put('/:id',  ctrl.update)
router.delete('/:id', ctrl.remove)

// ─── Transitions de statut ────────────────────────────────────────────────────

router.post('/:id/send',    ctrl.send)
router.post('/:id/accept',  ctrl.accept)
router.post('/:id/reject',  ctrl.reject)

// ─── Actions ──────────────────────────────────────────────────────────────────

router.post('/:id/convert',   ctrl.convert)
router.post('/:id/duplicate', ctrl.duplicate)
router.get( '/:id/pdf',       ctrl.downloadPdf)
router.post('/:id/send-email', ctrl.sendByEmail)

export default router
