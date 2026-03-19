"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Controller — Module Clients
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
exports.list = list;
exports.show = show;
exports.create = create;
exports.update = update;
exports.archive = archive;
exports.remove = remove;
exports.addContact = addContact;
exports.updateContact = updateContact;
exports.deleteContact = deleteContact;
exports.listTags = listTags;
const service = __importStar(require("./clients.service"));
const clients_validators_1 = require("./clients.validators");
// ─── Helpers ──────────────────────────────────────────────────────────────────
const ok = (res, data, status = 200) => res.status(status).json({ data });
const fail = (res, message, status = 400) => res.status(status).json({ error: { message } });
const getTenant = (req) => req.user.tenantId;
const getUser = (req) => req.user.userId;
const p = (req, key) => req.params[key];
// ─── Clients ──────────────────────────────────────────────────────────────────
async function list(req, res, next) {
    try {
        const filters = clients_validators_1.clientFiltersSchema.parse(req.query);
        const result = await service.findAll(getTenant(req), filters);
        ok(res, result);
    }
    catch (e) {
        next(e);
    }
}
async function show(req, res, next) {
    try {
        const client = await service.findById(p(req, 'id'), getTenant(req));
        if (!client) {
            fail(res, 'Client introuvable', 404);
            return;
        }
        const stats = await service.getClientStats(p(req, 'id'), getTenant(req));
        ok(res, { ...client, stats });
    }
    catch (e) {
        next(e);
    }
}
async function create(req, res, next) {
    try {
        const dto = clients_validators_1.createClientSchema.parse(req.body);
        const client = await service.createClient(dto, getTenant(req), getUser(req));
        ok(res, client, 201);
    }
    catch (e) {
        next(e);
    }
}
async function update(req, res, next) {
    try {
        const dto = clients_validators_1.updateClientSchema.parse(req.body);
        const client = await service.updateClient(p(req, 'id'), dto, getTenant(req));
        ok(res, client);
    }
    catch (e) {
        next(e);
    }
}
async function archive(req, res, next) {
    try {
        const client = await service.archiveClient(p(req, 'id'), getTenant(req));
        ok(res, client);
    }
    catch (e) {
        next(e);
    }
}
async function remove(req, res, next) {
    try {
        await service.deleteClient(p(req, 'id'), getTenant(req));
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
// ─── Contacts ─────────────────────────────────────────────────────────────────
async function addContact(req, res, next) {
    try {
        const dto = clients_validators_1.upsertContactSchema.parse(req.body);
        const contact = await service.addContact(p(req, 'id'), dto, getTenant(req));
        ok(res, contact, 201);
    }
    catch (e) {
        next(e);
    }
}
async function updateContact(req, res, next) {
    try {
        const dto = clients_validators_1.upsertContactSchema.parse(req.body);
        const contact = await service.updateContact(p(req, 'contactId'), p(req, 'id'), dto, getTenant(req));
        ok(res, contact);
    }
    catch (e) {
        next(e);
    }
}
async function deleteContact(req, res, next) {
    try {
        await service.deleteContact(p(req, 'contactId'), p(req, 'id'), getTenant(req));
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
// ─── Tags ─────────────────────────────────────────────────────────────────────
async function listTags(req, res, next) {
    try {
        const tags = await service.getAllTags(getTenant(req));
        ok(res, tags);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=clients.controller.js.map