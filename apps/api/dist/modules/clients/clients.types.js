"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Types TypeScript — Module Clients
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientStatus = exports.ClientType = void 0;
var ClientType;
(function (ClientType) {
    ClientType["INDIVIDUAL"] = "INDIVIDUAL";
    ClientType["COMPANY"] = "COMPANY";
})(ClientType || (exports.ClientType = ClientType = {}));
var ClientStatus;
(function (ClientStatus) {
    ClientStatus["PROSPECT"] = "PROSPECT";
    ClientStatus["ACTIVE"] = "ACTIVE";
    ClientStatus["INACTIVE"] = "INACTIVE";
    ClientStatus["ARCHIVED"] = "ARCHIVED";
})(ClientStatus || (exports.ClientStatus = ClientStatus = {}));
//# sourceMappingURL=clients.types.js.map