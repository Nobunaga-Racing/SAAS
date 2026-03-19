"use strict";
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
const ctrl = __importStar(require("./clients.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// router.use(rbacMiddleware(['OWNER', 'ADMIN', 'USER', 'ACCOUNTANT']))
// Tags (avant /:id pour éviter la collision de routes)
router.get('/tags', ctrl.listTags);
// Clients
router.route('/')
    .get(ctrl.list)
    .post(ctrl.create);
router.route('/:id')
    .get(ctrl.show)
    .put(ctrl.update)
    .delete(ctrl.remove);
router.post('/:id/archive', ctrl.archive);
// Contacts
router.route('/:id/contacts')
    .post(ctrl.addContact);
router.route('/:id/contacts/:contactId')
    .put(ctrl.updateContact)
    .delete(ctrl.deleteContact);
exports.default = router;
//# sourceMappingURL=clients.routes.js.map