"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const clients_routes_1 = __importDefault(require("./modules/clients/clients.routes"));
const products_routes_1 = __importDefault(require("./modules/products/products.routes"));
const invoices_routes_1 = __importDefault(require("./modules/invoices/invoices.routes"));
const quotes_routes_1 = __importDefault(require("./modules/quotes/quotes.routes"));
const payments_routes_1 = __importDefault(require("./modules/payments/payments.routes"));
const accounting_routes_1 = __importDefault(require("./modules/accounting/accounting.routes"));
const settings_routes_1 = __importDefault(require("./modules/settings/settings.routes"));
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.get('/health', (_req, res) => res.json({ ok: true }));
exports.app.use('/api/auth', auth_routes_1.default);
exports.app.use('/api/clients', clients_routes_1.default);
exports.app.use('/api/products', products_routes_1.default);
exports.app.use('/api/invoices', invoices_routes_1.default);
exports.app.use('/api/quotes', quotes_routes_1.default);
exports.app.use('/api/payments', payments_routes_1.default);
exports.app.use('/api/accounting', accounting_routes_1.default);
exports.app.use('/api/settings', settings_routes_1.default);
exports.app.use('/uploads', express_1.default.static('uploads'));
exports.app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});
//# sourceMappingURL=app.js.map