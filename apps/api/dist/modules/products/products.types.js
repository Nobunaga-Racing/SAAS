"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Types TypeScript — Module Produits / Services
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAT_RATES_ALLOWED = exports.PRODUCT_UNIT_LABELS = exports.ProductUnit = exports.ProductType = void 0;
var ProductType;
(function (ProductType) {
    ProductType["PRODUCT"] = "PRODUCT";
    ProductType["SERVICE"] = "SERVICE";
    ProductType["DIGITAL"] = "DIGITAL";
})(ProductType || (exports.ProductType = ProductType = {}));
var ProductUnit;
(function (ProductUnit) {
    ProductUnit["PIECE"] = "PIECE";
    ProductUnit["HOUR"] = "HOUR";
    ProductUnit["DAY"] = "DAY";
    ProductUnit["MONTH"] = "MONTH";
    ProductUnit["KG"] = "KG";
    ProductUnit["LITER"] = "LITER";
    ProductUnit["METER"] = "METER";
    ProductUnit["FLAT"] = "FLAT";
})(ProductUnit || (exports.ProductUnit = ProductUnit = {}));
exports.PRODUCT_UNIT_LABELS = {
    PIECE: 'Pièce',
    HOUR: 'Heure',
    DAY: 'Jour',
    MONTH: 'Mois',
    KG: 'kg',
    LITER: 'L',
    METER: 'm',
    FLAT: 'Forfait',
};
exports.VAT_RATES_ALLOWED = [0, 5.5, 10, 20];
//# sourceMappingURL=products.types.js.map