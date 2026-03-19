import { z } from 'zod';
export declare const accountingFiltersSchema: z.ZodObject<{
    year: z.ZodNumber;
    month: z.ZodOptional<z.ZodNumber>;
    quarter: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    year: number;
    month?: number | undefined;
    quarter?: number | undefined;
}, {
    year: number;
    month?: number | undefined;
    quarter?: number | undefined;
}>;
export type AccountingFilters = z.infer<typeof accountingFiltersSchema>;
export declare function getSalesJournal(tenantId: string, filters: AccountingFilters): Promise<{
    date: Date;
    reference: string;
    type: import("@prisma/client").$Enums.InvoiceType;
    status: import("@prisma/client").$Enums.InvoiceStatus;
    clientId: string;
    client: string;
    subject: string;
    totalHt: number;
    totalVat: number;
    totalTtc: number;
    amountPaid: number;
    amountDue: number;
    vatLines: {
        rate: number;
        baseHt: number;
        vatAmount: number;
    }[];
    pcg: {
        debit: "411000";
        credit: "706000" | "709000";
    };
}[]>;
export declare function getVatReport(tenantId: string, filters: AccountingFilters): Promise<{
    period: {
        year: number;
        month: number | undefined;
        quarter: number | undefined;
        from: Date;
        to: Date;
    };
    vatLines: {
        rate: number;
        baseHt: number;
        vatAmount: number;
    }[];
    totals: {
        baseHt: number;
        vatAmount: number;
    };
    revenue: {
        invoiceCount: number;
        creditCount: number;
        totalHt: number;
        totalTtc: number;
    };
    collected: {
        count: number;
        amount: number;
    };
}>;
export declare function exportFec(tenantId: string, year: number): Promise<string>;
export declare function exportCsv(tenantId: string, filters: AccountingFilters): Promise<string>;
export declare function postInvoiceEntries(invoiceId: string, tenantId: string): Promise<void>;
export declare function postPaymentEntry(paymentId: string, tenantId: string): Promise<void>;
//# sourceMappingURL=accounting.service.d.ts.map