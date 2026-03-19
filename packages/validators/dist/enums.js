"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositStatus = exports.PaymentMethod = exports.DiscountType = exports.InvoiceStatus = exports.InvoiceType = void 0;
// Enums partagés entre validators et types
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
