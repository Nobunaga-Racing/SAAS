"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const service = new auth_service_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const data = await service.register(req.body);
            return res.status(201).json({
                data: {
                    tenant: data.tenant,
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                },
                meta: null,
                error: null,
            });
        }
        catch (e) {
            return res.status(400).json({ data: null, meta: null, error: e.message });
        }
    }
    async login(req, res) {
        try {
            const data = await service.login(req.body);
            return res.status(200).json({
                data: {
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                },
                meta: null,
                error: null,
            });
        }
        catch (e) {
            return res.status(401).json({ data: null, meta: null, error: e.message });
        }
    }
    async me(req, res) {
        try {
            if (!req.user)
                return res.status(401).json({ data: null, meta: null, error: 'Unauthorized' });
            const data = await service.me(req.user.userId);
            return res.status(200).json({ data, meta: null, error: null });
        }
        catch (e) {
            return res.status(400).json({ data: null, meta: null, error: e.message });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map