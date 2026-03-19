export declare enum ProductType {
    PRODUCT = "PRODUCT",
    SERVICE = "SERVICE",
    DIGITAL = "DIGITAL"
}
export declare enum ProductUnit {
    PIECE = "PIECE",
    HOUR = "HOUR",
    DAY = "DAY",
    MONTH = "MONTH",
    KG = "KG",
    LITER = "LITER",
    METER = "METER",
    FLAT = "FLAT"
}
export declare const PRODUCT_UNIT_LABELS: Record<ProductUnit, string>;
export declare const VAT_RATES_ALLOWED: readonly [0, 5.5, 10, 20];
export type VatRateValue = (typeof VAT_RATES_ALLOWED)[number];
export interface CreateCategoryDto {
    name: string;
    description?: string;
    color?: string;
    position?: number;
}
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
}
export interface CategoryResponse {
    id: string;
    name: string;
    description?: string;
    color?: string;
    position: number;
    productCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface CreateProductDto {
    type: ProductType;
    sku?: string;
    name: string;
    description?: string;
    descriptionShort?: string;
    categoryId?: string;
    unitPrice: number;
    unit?: ProductUnit;
    currency?: string;
    vatRate: VatRateValue;
    vatExempt?: boolean;
    vatExemptRef?: string;
    costPrice?: number;
    isActive?: boolean;
    isFavorite?: boolean;
}
export interface UpdateProductDto extends Partial<CreateProductDto> {
}
export interface ProductFilters {
    search?: string;
    type?: ProductType;
    categoryId?: string;
    isActive?: boolean;
    isFavorite?: boolean;
    vatRate?: number;
    priceMin?: number;
    priceMax?: number;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'unitPrice' | 'createdAt';
    sortDir?: 'asc' | 'desc';
}
export interface ProductResponse {
    id: string;
    type: ProductType;
    sku?: string;
    name: string;
    description?: string;
    descriptionShort?: string;
    category?: {
        id: string;
        name: string;
        color?: string;
    };
    unitPrice: number;
    unit: ProductUnit;
    unitLabel: string;
    currency: string;
    vatRate: number;
    vatExempt: boolean;
    vatExemptRef?: string;
    unitPriceTtc: number;
    costPrice?: number;
    marginAmount?: number;
    marginPercent?: number;
    isActive: boolean;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ProductListResponse {
    data: ProductResponse[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
//# sourceMappingURL=products.types.d.ts.map