"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ data: null, meta: null, error: 'Missing bearer token' });
    }
    const token = auth.slice('Bearer '.length);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
        req.user = {
            userId: payload.userId,
            tenantId: payload.tenantId,
            role: payload.role,
            email: payload.email,
        };
        return next();
    }
    catch {
        return res.status(401).json({ data: null, meta: null, error: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=auth.middleware.js.map