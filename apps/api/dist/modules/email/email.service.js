"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Service Email — nodemailer avec SMTP par tenant (stocké en base)
// ─────────────────────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSmtpConfigured = isSmtpConfigured;
exports.sendMail = sendMail;
exports.invoiceEmailHtml = invoiceEmailHtml;
const nodemailer_1 = __importDefault(require("nodemailer"));
function isSmtpConfigured(config) {
    return Boolean(config?.smtpHost && config?.smtpUser && config?.smtpPass);
}
async function sendMail(opts, config) {
    if (!config.smtpHost) {
        throw new Error('SMTP non configuré. Rendez-vous dans Paramètres → Configuration email.');
    }
    const transporter = nodemailer_1.default.createTransport({
        host: config.smtpHost,
        port: config.smtpPort ?? 587,
        secure: config.smtpSecure ?? false,
        auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass ?? '' } : undefined,
    });
    const from = config.smtpFrom ?? config.smtpUser ?? 'noreply@saas-gestion.fr';
    await transporter.sendMail({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        attachments: opts.attachments?.map((a) => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType,
        })),
    });
}
// ─── Templates ────────────────────────────────────────────────────────────────
function invoiceEmailHtml(opts) {
    const { clientName, docType, number, totalTtc, companyName, dueOrExpiry, notes } = opts;
    const Label = docType === 'facture' ? 'Facture' : 'Devis';
    const label = docType === 'facture' ? 'facture' : 'devis';
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #374151; line-height: 1.6; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 580px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
    .header { background: #4f46e5; color: white; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p  { margin: 4px 0 0; opacity: 0.85; font-size: 14px; }
    .body { padding: 28px 32px; }
    .amount-box { background: #f0f0ff; border-left: 4px solid #4f46e5; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .amount-box .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .amount-box .value { font-size: 24px; font-weight: bold; color: #4f46e5; }
    .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${Label} ${number}</h1>
      <p>Envoyé par ${companyName ?? 'votre prestataire'}</p>
    </div>
    <div class="body">
      <p>Bonjour ${clientName},</p>
      <p>Veuillez trouver ci-joint votre ${label} <strong>${number}</strong>${dueOrExpiry ? ` à régler avant le <strong>${dueOrExpiry}</strong>` : ''}.</p>
      <div class="amount-box">
        <div class="label">Montant ${docType === 'facture' ? 'TTC' : 'total TTC'}</div>
        <div class="value">${totalTtc}</div>
      </div>
      ${notes ? `<p style="color:#6b7280;font-size:13px;">${notes}</p>` : ''}
      <p>Cordialement,<br/><strong>${companyName ?? 'Votre prestataire'}</strong></p>
    </div>
    <div class="footer">Ce message a été généré automatiquement.</div>
  </div>
</body>
</html>`;
}
//# sourceMappingURL=email.service.js.map