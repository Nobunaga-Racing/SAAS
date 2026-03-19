// ─────────────────────────────────────────────────────────────────────────────
// Routes Express — Module Produits / Services
// ─────────────────────────────────────────────────────────────────────────────
//
//  CATÉGORIES
//  GET    /products/categories                    → Liste des catégories
//  POST   /products/categories                    → Créer une catégorie
//  PUT    /products/categories/:categoryId        → Modifier
//  DELETE /products/categories/:categoryId        → Supprimer (détache les produits)
//
//  PRODUITS
//  GET    /products                               → Liste + recherche + filtres
//  POST   /products                               → Créer un produit
//  GET    /products/:id                           → Détail + prix TTC + marge
//  PUT    /products/:id                           → Modifier
//  DELETE /products/:id                           → Supprimer (si non utilisé)
//  POST   /products/:id/toggle-active             → Activer / désactiver
//  POST   /products/:id/toggle-favorite           → Épingler / désépingler
//  POST   /products/:id/duplicate                 → Dupliquer
//  GET    /products/:id/stats                     → Statistiques d'usage
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, IRouter } from 'express'
import * as ctrl from './products.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router: IRouter = Router()

router.use(authMiddleware)

// Catégories (avant /:id pour éviter la collision)
router.route('/categories')
  .get(ctrl.listCategories)
  .post(ctrl.createCategory)

router.route('/categories/:categoryId')
  .put(ctrl.updateCategory)
  .delete(ctrl.deleteCategory)

// Produits
router.route('/')
  .get(ctrl.list)
  .post(ctrl.create)

router.route('/:id')
  .get(ctrl.show)
  .put(ctrl.update)
  .delete(ctrl.remove)

router.post('/:id/toggle-active',   ctrl.toggleActive)
router.post('/:id/toggle-favorite', ctrl.toggleFavorite)
router.post('/:id/duplicate',       ctrl.duplicate)
router.get ('/:id/stats',           ctrl.showStats)

export default router
