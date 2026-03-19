export interface PdfSettings {
    companyName?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    zipCode?: string | null;
    country?: string | null;
    phone?: string | null;
    siret?: string | null;
    vatNumber?: string | null;
    logoUrl?: string | null;
    invoiceFooter?: string | null;
}
export interface PdfLine {
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    lineTotalHt: number;
    lineVatAmount: number;
    lineTotalTtc: number;
}
export interface PdfData {
    type: 'invoice' | 'quote';
    number: string;
    issueDate: string;
    dueDate?: string | null;
    expiryDate?: string | null;
    subject?: string | null;
    notes?: string | null;
    footer?: string | null;
    client: {
        name: string;
        email?: string | null;
        address?: string | null;
    };
    lines: PdfLine[];
    subtotalHt: number;
    discountAmount: number;
    totalHt: number;
    totalVat: number;
    totalTtc: number;
    amountPaid?: number;
    amountDue?: number;
    settings: PdfSettings;
}
export declare function generateInvoicePdf(data: PdfData): Promise<Buffer>;
//# sourceMappingURL=invoice.pdf.d.ts.map