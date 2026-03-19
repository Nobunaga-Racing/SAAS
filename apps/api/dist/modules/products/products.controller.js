"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Produits / Services
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
exports.listCategories = listCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.list = list;
exports.show = show;
exports.showStats = showStats;
exports.create = create;
exports.update = update;
exports.toggleActive = toggleActive;
exports.toggleFavorite = toggleFavorite;
exports.duplicate = duplicate;
exports.remove = remove;
const service = __importStar(require("./products.service"));
const products_validators_1 = require("./products.validators");
const ok = (res, data, status = 200) => res.status(status).json({ data });
const fail = (res, message, status = 400) => res.status(status).json({ error: { message } });
const getTenant = (req) => req.user.tenantId;
const getUser = (req) => req.user.userId;
const param = (req, key) => req.params[key];
// ─── Catégories ───────────────────────────────────────────────────────────────
async function listCategories(req, res, next) {
    try {
        ok(res, await service.findAllCategories(getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
async function createCategory(req, res, next) {
    try {
        const dto = products_validators_1.createCategorySchema.parse(req.body);
        ok(res, await service.createCategory(dto, getTenant(req)), 201);
    }
    catch (e) {
        next(e);
    }
}
async function updateCategory(req, res, next) {
    try {
        const dto = products_validators_1.updateCategorySchema.parse(req.body);
        ok(res, await service.updateCategory(param(req, 'categoryId'), dto, getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
async function deleteCategory(req, res, next) {
    try {
        await service.deleteCategory(param(req, 'categoryId'), getTenant(req));
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
// ─── Produits ─────────────────────────────────────────────────────────────────
async function list(req, res, next) {
    try {
        const filters = products_validators_1.productFiltersSchema.parse(req.query);
        ok(res, await service.findAll(getTenant(req), filters));
    }
    catch (e) {
        next(e);
    }
}
async function show(req, res, next) {
    try {
        const product = await service.findById(param(req, 'id'), getTenant(req));
        if (!product) {
            fail(res, 'Produit introuvable', 404);
            return;
        }
        ok(res, product);
    }
    catch (e) {
        next(e);
    }
}
async function showStats(req, res, next) {
    try {
        ok(res, await service.getProductStats(param(req, 'id'), getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
async function create(req, res, next) {
    try {
        const dto = products_validators_1.createProductSchema.parse(req.body);
        ok(res, await service.createProduct(dto, getTenant(req), getUser(req)), 201);
    }
    catch (e) {
        next(e);
    }
}
async function update(req, res, next) {
    try {
        const dto = products_validators_1.updateProductSchema.parse(req.body);
        ok(res, await service.updateProduct(param(req, 'id'), dto, getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
async function toggleActive(req, res, next) {
    try {
        ok(res, await service.toggleActive(param(req, 'id'), getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
async function toggleFavorite(req, res, next) {
    try {
        ok(res, await service.toggleFavorite(param(req, 'id'), getTenant(req)));
    }
    catch (e) {
        next(e);
    }
}
async function duplicate(req, res, next) {
    try {
        ok(res, await service.duplicateProduct(param(req, 'id'), getTenant(req), getUser(req)), 201);
    }
    catch (e) {
        next(e);
    }
}
async function remove(req, res, next) {
    try {
        await service.deleteProduct(param(req, 'id'), getTenant(req));
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=products.controller.js.map