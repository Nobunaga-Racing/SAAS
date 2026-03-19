// ─────────────────────────────────────────────────────────────────────────────
// Service PDF — Génération factures & devis avec pdfkit
// ─────────────────────────────────────────────────────────────────────────────

import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'

export interface PdfSettings {
  companyName?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  zipCode?: string | null
  country?: string | null
  phone?: string | null
  siret?: string | null
  vatNumber?: string | null
  logoUrl?: string | null
  invoiceFooter?: string | null
}

export interface PdfLine {
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
  lineTotalHt: number
  lineVatAmount: number
  lineTotalTtc: number
}

export interface PdfData {
  type: 'invoice' | 'quote'
  number: string
  issueDate: string
  dueDate?: string | null
  expiryDate?: string | null
  subject?: string | null
  notes?: string | null
  footer?: string | null
  client: { name: string; email?: string | null; address?: string | null }
  lines: PdfLine[]
  subtotalHt: number
  discountAmount: number
  totalHt: number
  totalVat: number
  totalTtc: number
  amountPaid?: number
  amountDue?: number
  settings: PdfSettings
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtDate(d?: string | null): string {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('fr-FR')
}

function fmtCurrency(n: number): string {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

// ─── Génération ───────────────────────────────────────────────────────────────

export function generateInvoicePdf(data: PdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true })
    const chunks: Buffer[] = []
    doc.on('data', (c) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { settings, client } = data
    const pw = doc.page.width          // 595
    const cw = pw - 100                // content width

    // ─── Company logo ────────────────────────────────────────────────────────
    if (settings.logoUrl) {
      const logoPath = path.join(process.cwd(), settings.logoUrl)
      if (fs.existsSync(logoPath)) {
        try { doc.image(logoPath, 50, 45, { fit: [80, 60] }) } catch { /* skip */ }
      }
    }

    // ─── Company info (top right) ────────────────────────────────────────────
    let cy = 45
    const cx = 350
    if (settings.companyName) {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827')
        .text(settings.companyName, cx, cy, { width: 195, align: 'right' })
      cy += 16
    }
    doc.fontSize(8.5).font('Helvetica').fillColor('#4b5563')
    if (settings.addressLine1) {
      doc.text(settings.addressLine1, cx, cy, { width: 195, align: 'right' }); cy += 12
    }
    if (settings.zipCode || settings.city) {
      doc.text(`${settings.zipCode ?? ''} ${settings.city ?? ''}`.trim(), cx, cy, { width: 195, align: 'right' }); cy += 12
    }
    if (settings.phone) {
      doc.text(settings.phone, cx, cy, { width: 195, align: 'right' }); cy += 12
    }
    if (settings.siret) {
      doc.text(`SIRET : ${settings.siret}`, cx, cy, { width: 195, align: 'right' }); cy += 11
    }
    if (settings.vatNumber) {
      doc.text(`TVA : ${settings.vatNumber}`, cx, cy, { width: 195, align: 'right' })
    }

    // ─── Separator ───────────────────────────────────────────────────────────
    doc.moveTo(50, 140).lineTo(545, 140).strokeColor('#e5e7eb').lineWidth(0.8).stroke()

    // ─── Document title ───────────────────────────────────────────────────────
    const docTitle = data.type === 'invoice' ? 'FACTURE' : 'DEVIS'
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#111827').text(docTitle, 50, 155)
    doc.fontSize(12).font('Helvetica').fillColor('#6b7280').text(data.number, 50, 184)
    if (data.subject) {
      doc.fontSize(10).fillColor('#374151').text(data.subject, 50, 201, { width: 300 })
    }

    // ─── Client + Dates blocks ────────────────────────────────────────────────
    const blockY = 230

    // Client box
    doc.rect(50, blockY, 230, 90).fillColor('#f9fafb').fill()
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#9ca3af')
      .text('FACTURÉ À', 62, blockY + 10)
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827')
      .text(client.name, 62, blockY + 24, { width: 208 })
    if (client.email) {
      doc.fontSize(9).font('Helvetica').fillColor('#4b5563')
        .text(client.email, 62, blockY + 42, { width: 208 })
    }

    // Details box
    doc.rect(315, blockY, 230, 90).fillColor('#f9fafb').fill()
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#9ca3af')
      .text('DÉTAILS', 327, blockY + 10)
    doc.fontSize(9).font('Helvetica').fillColor('#4b5563')

    const endLabel = data.type === 'invoice' ? "Échéance" : "Validité"
    const endDate  = data.type === 'invoice' ? data.dueDate : data.expiryDate

    const rows: [string, string][] = [
      ["Date d'émission", fmtDate(data.issueDate)],
      [endLabel,          fmtDate(endDate)],
      ["Total TTC",       fmtCurrency(data.totalTtc)],
    ]
    rows.forEach(([label, value], i) => {
      const ry = blockY + 24 + i * 18
      doc.font('Helvetica').fillColor('#6b7280').text(label, 327, ry)
      doc.font('Helvetica-Bold').fillColor(i === 2 ? '#4f46e5' : '#111827')
        .text(value, 327, ry, { width: 208, align: 'right' })
    })

    // ─── Lines table ──────────────────────────────────────────────────────────
    const tY = blockY + 110
    const colX   = [50, 280, 330, 410, 460]
    const colW   = [228, 48, 78, 48, 85]
    const hdrs   = ['Description', 'Qté', 'P.U. HT', 'TVA', 'Total TTC']

    // Header
    doc.rect(50, tY, cw, 24).fillColor('#1f2937').fill()
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#f9fafb')
    hdrs.forEach((h, i) => {
      doc.text(h, colX[i], tY + 8, { width: colW[i], align: i === 0 ? 'left' : 'right' })
    })

    let rowY = tY + 24
    data.lines.forEach((line, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb'
      doc.rect(50, rowY, cw, 22).fillColor(bg).fill()
      doc.fontSize(9).font('Helvetica').fillColor('#374151')
      doc.text(line.description, colX[0], rowY + 6, { width: colW[0] })
      doc.text(String(line.quantity),            colX[1], rowY + 6, { width: colW[1], align: 'right' })
      doc.text(fmtCurrency(line.unitPrice),      colX[2], rowY + 6, { width: colW[2], align: 'right' })
      doc.text(`${line.vatRate} %`,              colX[3], rowY + 6, { width: colW[3], align: 'right' })
      doc.text(fmtCurrency(line.lineTotalTtc),   colX[4], rowY + 6, { width: colW[4], align: 'right' })
      rowY += 22
    })

    // Border bottom of table
    doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor('#e5e7eb').lineWidth(0.5).stroke()
    rowY += 20

    // ─── Totals ───────────────────────────────────────────────────────────────
    const tLx = 350   // label x
    const tLw = 115
    const tVw = 80

    const addRow = (label: string, value: string, bold = false, color = '#374151') => {
      doc.fontSize(9)
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(color)
        .text(label, tLx, rowY, { width: tLw })
        .text(value, tLx, rowY, { width: tVw + tLw, align: 'right' })
      rowY += 16
    }

    addRow('Sous-total HT', fmtCurrency(data.subtotalHt))
    if (data.discountAmount > 0) {
      addRow('Remise', `-${fmtCurrency(data.discountAmount)}`, false, '#dc2626')
    }
    addRow('Total HT', fmtCurrency(data.totalHt))
    addRow('TVA', fmtCurrency(data.totalVat))
    rowY += 4

    // TTC highlight
    doc.rect(tLx - 8, rowY, tVw + tLw + 8, 28).fillColor('#4f46e5').fill()
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff')
      .text('TOTAL TTC', tLx, rowY + 8, { width: tLw })
      .text(fmtCurrency(data.totalTtc), tLx, rowY + 8, { width: tVw + tLw, align: 'right' })
    rowY += 38

    if (data.type === 'invoice') {
      if ((data.amountPaid ?? 0) > 0) {
        addRow('Déjà réglé', fmtCurrency(data.amountPaid!))
      }
      if ((data.amountDue ?? 0) > 0) {
        addRow('Solde à payer', fmtCurrency(data.amountDue!), true, '#111827')
      }
    }

    // ─── Notes ───────────────────────────────────────────────────────────────
    if (data.notes) {
      rowY += 16
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#9ca3af').text('NOTES', 50, rowY)
      doc.fontSize(9).font('Helvetica').fillColor('#374151').text(data.notes, 50, rowY + 13, { width: 270 })
    }

    // ─── Footer ───────────────────────────────────────────────────────────────
    const footerTxt = data.footer || settings.invoiceFooter
    if (footerTxt) {
      const fy = doc.page.height - 65
      doc.moveTo(50, fy - 8).lineTo(545, fy - 8).strokeColor('#e5e7eb').lineWidth(0.5).stroke()
      doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
        .text(footerTxt, 50, fy, { width: cw, align: 'center' })
    }

    doc.end()
  })
}
