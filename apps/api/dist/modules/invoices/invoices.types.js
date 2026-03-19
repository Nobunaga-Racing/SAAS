"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Types TypeScript — Module Factures
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAT_RATES = exports.DepositStatus = exports.PaymentMethod = exports.DiscountType = exports.InvoiceStatus = exports.InvoiceType = void 0;
// ─── Enums ───────────────────────────────────────────────────────────────────
var InvoiceType;
(function (InvoiceType) {
    InvoiceType["INVOICE"] = "INVOICE";
    InvoiceType["CREDIT_NOTE"] = "CREDIT_NOTE";
    InvoiceType["DEPOSIT_INVOICE"] = "DEPOSIT_INVOICE";
})(InvoiceType || (exports.InvoiceType = InvoiceType = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["SENT"] = "SENT";
    InvoiceStatus["PARTIAL"] = "PARTIAL";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENT"] = "PERCENT";
    DiscountType["FIXED"] = "FIXED";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["CHECK"] = "CHECK";
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["STRIPE"] = "STRIPE";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var DepositStatus;
(function (DepositStatus) {
    DepositStatus["PENDING"] = "PENDING";
    DepositStatus["INVOICED"] = "INVOICED";
    DepositStatus["RECEIVED"] = "RECEIVED";
})(DepositStatus || (exports.DepositStatus = DepositStatus = {}));
// Taux de TVA applicables en France
exports.VAT_RATES = {
    ZERO: 0,
    REDUCED_1: 5.5,
    REDUCED_2: 10,
    STANDARD: 20,
};
//# sourceMappingURL=invoices.types.js.map