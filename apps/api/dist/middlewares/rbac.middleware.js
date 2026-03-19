"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacMiddleware = rbacMiddleware;
function rbacMiddleware(roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ data: null, meta: null, error: 'Unauthorized' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ data: null, meta: null, error: 'Forbidden' });
        }
        return next();
    };
}
//# sourceMappingURL=rbac.middleware.js.map