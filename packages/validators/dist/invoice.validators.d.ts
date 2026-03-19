import { z } from 'zod';
import { DiscountType, InvoiceType, PaymentMethod } from './enums';
export declare const invoiceLineSchema: z.ZodEffects<z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    vatRate: z.ZodEffects<z.ZodNumber, number, number>;
    discountType: z.ZodOptional<z.ZodNativeEnum<typeof DiscountType>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    position: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    position?: number;
    description?: string;
    productId?: string;
    quantity?: number;
    unitPrice?: number;
    vatRate?: number;
    discountType?: DiscountType;
    discountValue?: number;
}, {
    position?: number;
    description?: string;
    productId?: string;
    quantity?: number;
    unitPrice?: number;
    vatRate?: number;
    discountType?: DiscountType;
    discountValue?: number;
}>, {
    position?: number;
    description?: string;
    productId?: string;
    quantity?: number;
    unitPrice?: number;
    vatRate?: number;
    discountType?: DiscountType;
    discountValue?: number;
}, {
    position?: number;
    description?: string;
    productId?: string;
    quantity?: number;
    unitPrice?: number;
    vatRate?: number;
    discountType?: DiscountType;
    discountValue?: number;
}>;
export type InvoiceLineInput = z.infer<typeof invoiceLineSchema>;
export declare const createInvoiceSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    clientId: z.ZodString;
    quoteId: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodNativeEnum<typeof InvoiceType>>;
    issueDate: z.ZodString;
    dueDate: z.ZodString;
    subject: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    footer: z.ZodOptional<z.ZodString>;
    discountType: z.ZodOptional<z.ZodNativeEnum<typeof DiscountType>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    depositAmount: z.ZodDefault<z.ZodNumber>;
    lines: z.ZodArray<z.ZodEffects<z.ZodObject<{
        productId: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        vatRate: z.ZodEffects<z.ZodNumber, number, number>;
        discountType: z.ZodOptional<z.ZodNativeEnum<typeof DiscountType>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        position: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }, {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }>, {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }, {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type?: InvoiceType;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    clientId?: string;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}, {
    type?: InvoiceType;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    clientId?: string;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}>, {
    type?: InvoiceType;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    clientId?: string;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}, {
    type?: InvoiceType;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    clientId?: string;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}>, {
    type?: InvoiceType;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    clientId?: string;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}, {
    type?: InvoiceType;
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    clientId?: string;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}>;
export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>;
export declare const updateInvoiceSchema: z.ZodEffects<z.ZodObject<{
    footer: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    discountType: z.ZodOptional<z.ZodOptional<z.ZodNativeEnum<typeof DiscountType>>>;
    discountValue: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    quoteId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    issueDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    depositAmount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    lines: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        productId: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        vatRate: z.ZodEffects<z.ZodNumber, number, number>;
        discountType: z.ZodOptional<z.ZodNativeEnum<typeof DiscountType>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        position: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }, {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }>, {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }, {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}, {
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}>, {
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}, {
    footer?: string;
    discountType?: DiscountType;
    discountValue?: number;
    quoteId?: string;
    issueDate?: string;
    dueDate?: string;
    subject?: string;
    notes?: string;
    depositAmount?: number;
    lines?: {
        position?: number;
        description?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        vatRate?: number;
        discountType?: DiscountType;
        discountValue?: number;
    }[];
}>;
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>;
export declare const createPaymentSchema: z.ZodObject<{
    amount: z.ZodNumber;
    method: z.ZodNativeEnum<typeof PaymentMethod>;
    paymentDate: z.ZodString;
    reference: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    method?: PaymentMethod;
    notes?: string;
    amount?: number;
    paymentDate?: string;
    reference?: string;
}, {
    method?: PaymentMethod;
    notes?: string;
    amount?: number;
    paymentDate?: string;
    reference?: string;
}>;
export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export declare const createDepositSchema: z.ZodEffects<z.ZodObject<{
    amountType: z.ZodNativeEnum<typeof DiscountType>;
    amountValue: z.ZodNumber;
    dueDate: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dueDate?: string;
    notes?: string;
    amountType?: DiscountType;
    amountValue?: number;
}, {
    dueDate?: string;
    notes?: string;
    amountType?: DiscountType;
    amountValue?: number;
}>, {
    dueDate?: string;
    notes?: string;
    amountType?: DiscountType;
    amountValue?: number;
}, {
    dueDate?: string;
    notes?: string;
    amountType?: DiscountType;
    amountValue?: number;
}>;
export type CreateDepositDto = z.infer<typeof createDepositSchema>;
export declare const invoiceFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    overdue: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    type?: string;
    page?: number;
    status?: string;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    overdue?: boolean;
    limit?: number;
}, {
    search?: string;
    type?: string;
    page?: number;
    status?: string;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    overdue?: boolean;
    limit?: number;
}>;
export type InvoiceFilters = z.infer<typeof invoiceFiltersSchema>;
