import { z } from 'zod';
import { QuoteStatus, DiscountType } from './quotes.types';
export declare const createQuoteSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    clientId: z.ZodString;
    issueDate: z.ZodString;
    expiryDate: z.ZodString;
    subject: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    footer: z.ZodOptional<z.ZodString>;
    discountType: z.ZodOptional<z.ZodNativeEnum<typeof DiscountType>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
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
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }, {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }>, {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }, {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    issueDate: string;
    subject: string;
    lines: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[];
    expiryDate: string;
    notes?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
}, {
    clientId: string;
    issueDate: string;
    subject: string;
    lines: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[];
    expiryDate: string;
    notes?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
}>, {
    clientId: string;
    issueDate: string;
    subject: string;
    lines: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[];
    expiryDate: string;
    notes?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
}, {
    clientId: string;
    issueDate: string;
    subject: string;
    lines: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[];
    expiryDate: string;
    notes?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
}>, {
    clientId: string;
    issueDate: string;
    subject: string;
    lines: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[];
    expiryDate: string;
    notes?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
}, {
    clientId: string;
    issueDate: string;
    subject: string;
    lines: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[];
    expiryDate: string;
    notes?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
}>;
export type CreateQuoteDto = z.infer<typeof createQuoteSchema>;
export declare const updateQuoteSchema: z.ZodEffects<z.ZodObject<{
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    issueDate: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    footer: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    discountType: z.ZodOptional<z.ZodOptional<z.ZodNativeEnum<typeof DiscountType>>>;
    discountValue: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
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
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }, {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }>, {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }, {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }>, "many">>;
    expiryDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
    issueDate?: string | undefined;
    subject?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
    lines?: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[] | undefined;
    expiryDate?: string | undefined;
}, {
    notes?: string | undefined;
    issueDate?: string | undefined;
    subject?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
    lines?: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[] | undefined;
    expiryDate?: string | undefined;
}>, {
    notes?: string | undefined;
    issueDate?: string | undefined;
    subject?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
    lines?: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[] | undefined;
    expiryDate?: string | undefined;
}, {
    notes?: string | undefined;
    issueDate?: string | undefined;
    subject?: string | undefined;
    footer?: string | undefined;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
    lines?: {
        description: string;
        position: number;
        unitPrice: number;
        vatRate: number;
        quantity: number;
        discountType?: DiscountType | undefined;
        discountValue?: number | undefined;
        productId?: string | undefined;
    }[] | undefined;
    expiryDate?: string | undefined;
}>;
export type UpdateQuoteDto = z.infer<typeof updateQuoteSchema>;
export declare const rejectQuoteSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export type RejectQuoteDto = z.infer<typeof rejectQuoteSchema>;
export declare const quoteFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof QuoteStatus>>;
    clientId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    expiredOnly: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    status?: QuoteStatus | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    expiredOnly?: boolean | undefined;
}, {
    search?: string | undefined;
    status?: QuoteStatus | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    expiredOnly?: boolean | undefined;
}>;
export type QuoteFilters = z.infer<typeof quoteFiltersSchema>;
//# sourceMappingURL=quotes.validators.d.ts.map