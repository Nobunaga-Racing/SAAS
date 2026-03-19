"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtAccessSecret, { expiresIn: env_1.env.jwtAccessExpiresIn });
}
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtRefreshSecret, { expiresIn: env_1.env.jwtRefreshExpiresIn });
}
class AuthService {
    async register(input) {
        const existingEmail = await database_1.prisma.user.findUnique({ where: { email: input.email } });
        if (existingEmail)
            throw new Error('Email already used');
        const existingSlug = await database_1.prisma.tenant.findUnique({ where: { slug: input.tenantSlug } });
        if (existingSlug)
            throw new Error('Tenant slug already used');
        const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
        const result = await database_1.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: input.tenantName,
                    slug: input.tenantSlug,
                },
            });
            const user = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    email: input.email,
                    passwordHash,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    role: client_1.UserRole.OWNER,
                },
            });
            const accessToken = signAccessToken({
                userId: user.id,
                tenantId: user.tenantId,
                role: user.role,
                email: user.email,
            });
            const refreshToken = signRefreshToken({ userId: user.id });
            await tx.refreshToken.create({
                data: {
                    userId: user.id,
                    tokenHash: hashToken(refreshToken),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            return { tenant, user, accessToken, refreshToken };
        });
        return result;
    }
    async login(input) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: input.email },
        });
        if (!user || !user.isActive)
            throw new Error('Invalid credentials');
        const ok = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!ok)
            throw new Error('Invalid credentials');
        const accessToken = signAccessToken({
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            email: user.email,
        });
        const refreshToken = signRefreshToken({ userId: user.id });
        await database_1.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(refreshToken),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return { user, accessToken, refreshToken };
    }
    async me(userId) {
        return database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                tenantId: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                isActive: true,
                createdAt: true,
            },
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map