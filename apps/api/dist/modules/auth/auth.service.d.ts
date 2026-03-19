type RegisterInput = {
    tenantName: string;
    tenantSlug: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
};
type LoginInput = {
    email: string;
    password: string;
};
export declare class AuthService {
    register(input: RegisterInput): Promise<{
        tenant: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            plan: import("@prisma/client").$Enums.TenantPlan;
            companyName: string | null;
            siret: string | null;
            vatNumber: string | null;
            addressLine1: string | null;
            addressLine2: string | null;
            city: string | null;
            zipCode: string | null;
            country: string;
            phone: string | null;
            logoUrl: string | null;
            defaultPaymentTermDays: number;
            defaultVatRate: import("@prisma/client/runtime/library").Decimal;
            invoiceFooter: string | null;
            smtpHost: string | null;
            smtpPort: number | null;
            smtpSecure: boolean;
            smtpUser: string | null;
            smtpPass: string | null;
            smtpFrom: string | null;
        };
        user: {
            id: string;
            email: string;
            tenantId: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            avatarUrl: string | null;
            passwordHash: string;
            emailVerified: boolean;
            isActive: boolean;
            failedAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            lastLoginIp: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(input: LoginInput): Promise<{
        user: {
            id: string;
            email: string;
            tenantId: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string | null;
            lastName: string | null;
            avatarUrl: string | null;
            passwordHash: string;
            emailVerified: boolean;
            isActive: boolean;
            failedAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            lastLoginIp: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    me(userId: string): Promise<{
        id: string;
        email: string;
        tenantId: string;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        isActive: boolean;
        createdAt: Date;
    } | null>;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map