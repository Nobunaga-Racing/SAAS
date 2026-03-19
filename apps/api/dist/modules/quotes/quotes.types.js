"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Types TypeScript — Module Devis
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAT_RATES = exports.DiscountType = exports.QuoteStatus = void 0;
var QuoteStatus;
(function (QuoteStatus) {
    QuoteStatus["DRAFT"] = "DRAFT";
    QuoteStatus["SENT"] = "SENT";
    QuoteStatus["ACCEPTED"] = "ACCEPTED";
    QuoteStatus["REJECTED"] = "REJECTED";
    QuoteStatus["EXPIRED"] = "EXPIRED";
    QuoteStatus["CONVERTED"] = "CONVERTED";
})(QuoteStatus || (exports.QuoteStatus = QuoteStatus = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENT"] = "PERCENT";
    DiscountType["FIXED"] = "FIXED";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
// Taux de TVA valides
exports.VAT_RATES = [0, 5.5, 10, 20];
//# sourceMappingURL=quotes.types.js.map