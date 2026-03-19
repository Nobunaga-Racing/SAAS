import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';
export declare const createPaymentSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    amount: z.ZodNumber;
    method: z.ZodNativeEnum<{
        BANK_TRANSFER: "BANK_TRANSFER";
        CARD: "CARD";
        CHECK: "CHECK";
        CASH: "CASH";
        STRIPE: "STRIPE";
    }>;
    paymentDate: z.ZodString;
    reference: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    invoiceId: string;
    amount: number;
    method: "BANK_TRANSFER" | "CARD" | "CHECK" | "CASH" | "STRIPE";
    paymentDate: string;
    notes?: string | undefined;
    reference?: string | undefined;
}, {
    invoiceId: string;
    amount: number;
    method: "BANK_TRANSFER" | "CARD" | "CHECK" | "CASH" | "STRIPE";
    paymentDate: string;
    notes?: string | undefined;
    reference?: string | undefined;
}>;
export declare const paymentFiltersSchema: z.ZodObject<{
    invoiceId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodNativeEnum<{
        BANK_TRANSFER: "BANK_TRANSFER";
        CARD: "CARD";
        CHECK: "CHECK";
        CASH: "CASH";
        STRIPE: "STRIPE";
    }>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    clientId?: string | undefined;
    invoiceId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    method?: "BANK_TRANSFER" | "CARD" | "CHECK" | "CASH" | "STRIPE" | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    clientId?: string | undefined;
    invoiceId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    method?: "BANK_TRANSFER" | "CARD" | "CHECK" | "CASH" | "STRIPE" | undefined;
}>;
export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type PaymentFilters = z.infer<typeof paymentFiltersSchema>;
export declare function findAll(tenantId: string, filters: PaymentFilters): Promise<{
    data: ({
        invoice: {
            number: string;
            id: string;
            client: {
                id: string;
                name: string;
            };
            status: import("@prisma/client").$Enums.InvoiceStatus;
            totalTtc: Decimal;
            amountDue: Decimal;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        notes: string | null;
        invoiceId: string;
        amount: Decimal;
        method: import("@prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        paymentDate: Date;
        stripeId: string | null;
        stripeReceiptUrl: string | null;
    })[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare function findById(paymentId: string, tenantId: string): Promise<({
    invoice: {
        number: string;
        id: string;
        client: {
            id: string;
            name: string;
        };
        status: import("@prisma/client").$Enums.InvoiceStatus;
        totalTtc: Decimal;
        amountDue: Decimal;
        amountPaid: Decimal;
    };
} & {
    id: string;
    tenantId: string;
    createdAt: Date;
    notes: string | null;
    invoiceId: string;
    amount: Decimal;
    method: import("@prisma/client").$Enums.PaymentMethod;
    reference: string | null;
    paymentDate: Date;
    stripeId: string | null;
    stripeReceiptUrl: string | null;
}) | null>;
export declare function recordPayment(dto: CreatePaymentDto, tenantId: string): Promise<{
    id: string;
    tenantId: string;
    createdAt: Date;
    notes: string | null;
    invoiceId: string;
    amount: Decimal;
    method: import("@prisma/client").$Enums.PaymentMethod;
    reference: string | null;
    paymentDate: Date;
    stripeId: string | null;
    stripeReceiptUrl: string | null;
}>;
export declare function removePayment(paymentId: string, tenantId: string): Promise<void>;
export declare function getStats(tenantId: string, dateFrom?: string, dateTo?: string): Promise<{
    totalCollected: number;
    totalPayments: number;
    byMethod: {
        method: import("@prisma/client").$Enums.PaymentMethod;
        total: number;
        count: number;
    }[];
    monthly: {
        month: string;
        total: number;
        count: number;
    }[];
    outstanding: {
        amount: number;
        count: number;
    };
    overdue: {
        amount: number;
        count: number;
    };
}>;
//# sourceMappingURL=payments.service.d.ts.map