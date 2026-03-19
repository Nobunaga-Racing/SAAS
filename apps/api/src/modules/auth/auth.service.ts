import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env';

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

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(payload: {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
}) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn as any });
}

function signRefreshToken(payload: { userId: string }) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn as any });
}

export class AuthService {
  async register(input: RegisterInput) {
    const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingEmail) throw new Error('Email already used');

    const existingSlug = await prisma.tenant.findUnique({ where: { slug: input.tenantSlug } });
    if (existingSlug) throw new Error('Tenant slug already used');

    const passwordHash = await bcrypt.hash(input.password, 12);

    const result = await prisma.$transaction(async (tx) => {
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
          role: UserRole.OWNER,
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

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.isActive) throw new Error('Invalid credentials');

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new Error('Invalid credentials');

    const accessToken = signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    const refreshToken = signRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, accessToken, refreshToken };
  }

  async me(userId: string) {
    return prisma.user.findUnique({
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