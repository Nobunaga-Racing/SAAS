"use strict";
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
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
exports.uploadLogo = uploadLogo;
const service = __importStar(require("./settings.service"));
const ok = (res, data) => res.json({ data });
async function getSettings(req, res, next) {
    try {
        ok(res, await service.getSettings(req.user.tenantId));
    }
    catch (e) {
        next(e);
    }
}
async function updateSettings(req, res, next) {
    try {
        ok(res, await service.updateSettings(req.user.tenantId, req.body));
    }
    catch (e) {
        next(e);
    }
}
async function uploadLogo(req, res, next) {
    try {
        if (!req.file) {
            res.status(400).json({ error: { message: 'Aucun fichier reçu' } });
            return;
        }
        const logoUrl = `/uploads/${req.file.filename}`;
        ok(res, await service.updateLogo(req.user.tenantId, logoUrl));
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=settings.controller.js.map