"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
exports.updateLogo = updateLogo;
const database_1 = require("../../config/database");
async function getSettings(tenantId) {
    return database_1.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
            id: true, name: true, slug: true,
            companyName: true, siret: true, vatNumber: true,
            addressLine1: true, addressLine2: true,
            city: true, zipCode: true, country: true,
            phone: true, logoUrl: true,
            defaultPaymentTermDays: true, defaultVatRate: true, invoiceFooter: true,
            smtpHost: true, smtpPort: true, smtpSecure: true,
            smtpUser: true, smtpFrom: true,
            // smtpPass volontairement exclu de la réponse (sécurité)
        },
    });
}
async function updateSettings(tenantId, data) {
    return database_1.prisma.tenant.update({ where: { id: tenantId }, data });
}
async function updateLogo(tenantId, logoUrl) {
    return database_1.prisma.tenant.update({ where: { id: tenantId }, data: { logoUrl } });
}
//# sourceMappingURL=settings.service.js.map