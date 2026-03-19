"use strict";
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
const ctrl = __importStar(require("./products.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Catégories (avant /:id pour éviter la collision)
router.route('/categories')
    .get(ctrl.listCategories)
    .post(ctrl.createCategory);
router.route('/categories/:categoryId')
    .put(ctrl.updateCategory)
    .delete(ctrl.deleteCategory);
// Produits
router.route('/')
    .get(ctrl.list)
    .post(ctrl.create);
router.route('/:id')
    .get(ctrl.show)
    .put(ctrl.update)
    .delete(ctrl.remove);
router.post('/:id/toggle-active', ctrl.toggleActive);
router.post('/:id/toggle-favorite', ctrl.toggleFavorite);
router.post('/:id/duplicate', ctrl.duplicate);
router.get('/:id/stats', ctrl.showStats);
exports.default = router;
//# sourceMappingURL=products.routes.js.map