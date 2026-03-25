// src/utils/jwt.ts
import { createSigner, createVerifier } from 'fast-jwt';
import type { Role } from '@prisma/client';

export interface JWTPayload {
  sub: string;       // userId
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

const accessSigner = createSigner({
  key: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
  expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  algorithm: 'HS256',
});

const refreshSigner = createSigner({
  key: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
  expiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  algorithm: 'HS256',
});

const accessVerifier = createVerifier({
  key: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
});

const refreshVerifier = createVerifier({
  key: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
});

export const jwtUtils = {
  signAccess: (payload: Omit<JWTPayload, 'iat' | 'exp'>): string =>
    accessSigner(payload) as string,

  signRefresh: (payload: Omit<JWTPayload, 'iat' | 'exp'>): string =>
    refreshSigner(payload) as string,

  verifyAccess: (token: string): JWTPayload => accessVerifier(token) as JWTPayload,

  verifyRefresh: (token: string): JWTPayload => refreshVerifier(token) as JWTPayload,

  extractFromHeader: (authHeader?: string): string | null => {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
  },
};
