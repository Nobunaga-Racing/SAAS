export declare enum ClientType {
    INDIVIDUAL = "INDIVIDUAL",
    COMPANY = "COMPANY"
}
export declare enum ClientStatus {
    PROSPECT = "PROSPECT",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    ARCHIVED = "ARCHIVED"
}
export interface ContactInput {
    firstName: string;
    lastName: string;
    role?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
}
export interface ContactResponse extends ContactInput {
    id: string;
    clientId: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateClientDto {
    type?: ClientType;
    status?: ClientStatus;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    siret?: string;
    vatNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    zipCode?: string;
    country?: string;
    shippingAddressLine1?: string;
    shippingAddressLine2?: string;
    shippingCity?: string;
    shippingZipCode?: string;
    shippingCountry?: string;
    paymentTermDays?: number;
    currency?: string;
    notes?: string;
    tags?: string[];
    contacts?: ContactInput[];
}
export interface UpdateClientDto extends Partial<Omit<CreateClientDto, 'contacts'>> {
}
export interface ClientFilters {
    search?: string;
    status?: ClientStatus;
    type?: ClientType;
    tags?: string[];
    city?: string;
    country?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'createdAt' | 'status';
    sortDir?: 'asc' | 'desc';
}
export interface ClientResponse {
    id: string;
    type: ClientType;
    status: ClientStatus;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    siret?: string;
    vatNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    zipCode?: string;
    country: string;
    shippingAddressLine1?: string;
    shippingAddressLine2?: string;
    shippingCity?: string;
    shippingZipCode?: string;
    shippingCountry?: string;
    paymentTermDays?: number;
    currency: string;
    notes?: string;
    tags: string[];
    contacts: ContactResponse[];
    stats?: {
        invoicesCount: number;
        totalRevenue: number;
        outstandingDue: number;
        lastInvoiceDate?: string;
    };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface ClientListResponse {
    data: ClientResponse[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
//# sourceMappingURL=clients.types.d.ts.map