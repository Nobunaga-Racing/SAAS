export declare enum InvoiceType {
    INVOICE = "INVOICE",
    CREDIT_NOTE = "CREDIT_NOTE",
    DEPOSIT_INVOICE = "DEPOSIT_INVOICE"
}
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    PARTIAL = "PARTIAL",
    PAID = "PAID",
    CANCELLED = "CANCELLED",
    OVERDUE = "OVERDUE"
}
export declare enum DiscountType {
    PERCENT = "PERCENT",
    FIXED = "FIXED"
}
export declare enum PaymentMethod {
    BANK_TRANSFER = "BANK_TRANSFER",
    CARD = "CARD",
    CHECK = "CHECK",
    CASH = "CASH",
    STRIPE = "STRIPE"
}
export declare enum DepositStatus {
    PENDING = "PENDING",
    INVOICED = "INVOICED",
    RECEIVED = "RECEIVED"
}
export declare const VAT_RATES: {
    readonly ZERO: 0;
    readonly REDUCED_1: 5.5;
    readonly REDUCED_2: 10;
    readonly STANDARD: 20;
};
export type VatRateValue = (typeof VAT_RATES)[keyof typeof VAT_RATES];
export interface InvoiceLineInput {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: VatRateValue;
    discountType?: DiscountType;
    discountValue?: number;
    position: number;
}
export interface InvoiceLineCalculated extends InvoiceLineInput {
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
export interface InvoiceTotals {
    subtotalHt: number;
    discountAmount: number;
    totalHt: number;
    vatSummary: VatSummaryLine[];
    totalVat: number;
    totalTtc: number;
    depositAmount: number;
    amountDue: number;
}
export interface CreateInvoiceDto {
    clientId: string;
    quoteId?: string;
    type?: InvoiceType;
    issueDate: string;
    dueDate: string;
    subject: string;
    notes?: string;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    depositAmount?: number;
    lines: InvoiceLineInput[];
}
export interface UpdateInvoiceDto extends Partial<Omit<CreateInvoiceDto, 'type'>> {
}
export interface CreatePaymentDto {
    amount: number;
    method: PaymentMethod;
    paymentDate: string;
    reference?: string;
    notes?: string;
}
export interface CreateDepositDto {
    amountType: DiscountType;
    amountValue: number;
    dueDate: string;
    notes?: string;
}
export interface InvoiceFilters {
    status?: InvoiceStatus;
    type?: InvoiceType;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    overdue?: boolean;
    page?: number;
    limit?: number;
    search?: string;
}
export interface InvoiceResponse {
    id: string;
    number: string;
    type: InvoiceType;
    status: InvoiceStatus;
    client: {
        id: string;
        name: string;
        email: string;
    };
    issueDate: string;
    dueDate: string;
    subject: string;
    notes?: string;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    lines: InvoiceLineCalculated[];
    vatSummary: VatSummaryLine[];
    totals: InvoiceTotals;
    deposits: DepositResponse[];
    payments: PaymentResponse[];
    pdfUrl?: string;
    sentAt?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface PaymentResponse {
    id: string;
    amount: number;
    method: PaymentMethod;
    paymentDate: string;
    reference?: string;
    stripeReceiptUrl?: string;
    notes?: string;
    createdAt: string;
}
export interface DepositResponse {
    id: string;
    amountType: DiscountType;
    amountValue: number;
    amountResolved: number;
    status: DepositStatus;
    depositInvoiceId?: string;
    depositInvoiceNumber?: string;
    dueDate: string;
    paidAt?: string;
    notes?: string;
}
export interface InvoiceListResponse {
    data: InvoiceResponse[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
//# sourceMappingURL=invoices.types.d.ts.map