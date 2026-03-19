export declare enum QuoteStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED",
    CONVERTED = "CONVERTED"
}
export declare enum DiscountType {
    PERCENT = "PERCENT",
    FIXED = "FIXED"
}
export declare const VAT_RATES: readonly [0, 5.5, 10, 20];
export type VatRateValue = (typeof VAT_RATES)[number];
export interface QuoteLineInput {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: VatRateValue;
    discountType?: DiscountType;
    discountValue?: number;
    position: number;
}
export interface QuoteLineCalculated extends QuoteLineInput {
    lineBaseHt: number;
    lineDiscountAmt: number;
    lineTotalHt: number;
    lineVatAmount: number;
    lineTotalTtc: number;
}
export interface VatSummaryLine {
    vatRate: number;
    baseHt: number;
    vatAmount: number;
}
export interface QuoteTotals {
    subtotalHt: number;
    discountAmount: number;
    totalHt: number;
    vatSummary: VatSummaryLine[];
    totalVat: number;
    totalTtc: number;
}
export interface CreateQuoteDto {
    clientId: string;
    issueDate: string;
    expiryDate: string;
    subject: string;
    notes?: string;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    lines: QuoteLineInput[];
}
export interface UpdateQuoteDto extends Partial<Omit<CreateQuoteDto, 'clientId'>> {
}
export interface RejectQuoteDto {
    reason?: string;
}
export interface QuoteFilters {
    status?: QuoteStatus;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    expiredOnly?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
export interface QuoteLineResponse extends QuoteLineCalculated {
    id: string;
    productId?: string;
    product?: {
        id: string;
        name: string;
        sku?: string;
    };
}
export interface QuoteResponse {
    id: string;
    number: string;
    status: QuoteStatus;
    client: {
        id: string;
        name: string;
        email?: string;
    };
    issueDate: string;
    expiryDate: string;
    isExpired: boolean;
    subject: string;
    notes?: string;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    lines: QuoteLineResponse[];
    vatSummary: VatSummaryLine[];
    totals: QuoteTotals;
    sentAt?: string;
    acceptedAt?: string;
    rejectedAt?: string;
    rejectedReason?: string;
    convertedAt?: string;
    invoiceId?: string;
    invoiceNumber?: string;
    pdfUrl?: string;
    createdAt: string;
    updatedAt: string;
}
export interface QuoteListResponse {
    data: QuoteResponse[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
//# sourceMappingURL=quotes.types.d.ts.map