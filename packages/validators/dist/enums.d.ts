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
