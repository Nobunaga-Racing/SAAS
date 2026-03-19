export interface SmtpConfig {
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpSecure?: boolean | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
    smtpFrom?: string | null;
}
export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: {
        filename: string;
        content: Buffer;
        contentType: string;
    }[];
}
export declare function isSmtpConfigured(config: SmtpConfig | null | undefined): boolean;
export declare function sendMail(opts: SendMailOptions, config: SmtpConfig): Promise<void>;
export declare function invoiceEmailHtml(opts: {
    clientName: string;
    docType: 'facture' | 'devis';
    number: string;
    totalTtc: string;
    companyName?: string | null;
    dueOrExpiry?: string;
    notes?: string | null;
}): string;
//# sourceMappingURL=email.service.d.ts.map