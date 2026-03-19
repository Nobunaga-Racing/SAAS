// ─────────────────────────────────────────────────────────────────────────────
// Routes Express — Module Clients
// ─────────────────────────────────────────────────────────────────────────────
//
//  GET    /clients                          → Liste + recherche + filtres
//  POST   /clients                          → Créer un client
//  GET    /clients/tags                     → Liste des tags utilisés
//  GET    /clients/:id                      → Détail + stats
//  PUT    /clients/:id                      → Modifier
//  POST   /clients/:id/archive              → Archiver (soft delete)
//  DELETE /clients/:id                      → Supprimer (si aucune facture)
//
//  POST   /clients/:id/contacts             → Ajouter un contact
//  PUT    /clients/:id/contacts/:contactId  → Modifier un contact
//  DELETE /clients/:id/contacts/:contactId  → Supprimer un contact
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, IRouter } from 'express'
import * as ctrl from './clients.controller'
import { authMiddleware } from '../../middlewares/auth.middleware';

const router: IRouter = Router()

router.use(authMiddleware)
// router.use(rbacMiddleware(['OWNER', 'ADMIN', 'USER', 'ACCOUNTANT']))

// Tags (avant /:id pour éviter la collision de routes)
router.get('/tags', ctrl.listTags)

// Clients
router.route('/')
  .get(ctrl.list)
  .post(ctrl.create)

router.route('/:id')
  .get(ctrl.show)
  .put(ctrl.update)
  .delete(ctrl.remove)

router.post('/:id/archive', ctrl.archive)

// Contacts
router.route('/:id/contacts')
  .post(ctrl.addContact)

router.route('/:id/contacts/:contactId')
  .put(ctrl.updateContact)
  .delete(ctrl.deleteContact)

export default router
