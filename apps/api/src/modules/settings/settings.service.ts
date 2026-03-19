import { prisma } from '../../config/database'

export async function getSettings(tenantId: string) {
  return prisma.tenant.findUnique({
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
  })
}

export async function updateSettings(tenantId: string, data: {
  companyName?: string; siret?: string; vatNumber?: string
  addressLine1?: string; addressLine2?: string
  city?: string; zipCode?: string; country?: string
  phone?: string; defaultPaymentTermDays?: number; invoiceFooter?: string
  smtpHost?: string | null; smtpPort?: number | null; smtpSecure?: boolean
  smtpUser?: string | null; smtpPass?: string | null; smtpFrom?: string | null
}) {
  return prisma.tenant.update({ where: { id: tenantId }, data })
}

export async function updateLogo(tenantId: string, logoUrl: string) {
  return prisma.tenant.update({ where: { id: tenantId }, data: { logoUrl } })
}
