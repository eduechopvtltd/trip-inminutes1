// src/controllers/auth.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/redis.js';
import { jwtUtils } from '../utils/jwt.js';
import { emailService } from '../services/email.service.js';
import { generateOTP } from '../utils/helpers.js';

// ── Schemas
const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-]{10,20}$/).optional(), // More permissive regex
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
      message: 'Password must contain uppercase, lowercase, number and special character',
    }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

const forgotSchema = z.object({ email: z.string().email() });

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});

// ── Helpers
const REFRESH_COOKIE = 'tim_refresh_token';
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

function setRefreshCookie(reply: FastifyReply, token: string) {
  reply.setCookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none', // Maximally compatible for Cloudflare/Proxy setups
    path: '/',
    maxAge: REFRESH_TTL,
  });
}

// ── Register
export async function register(req: FastifyRequest, reply: FastifyReply) {
  const body = registerSchema.safeParse(req.body);
  if (!body.success) {
    req.log.warn({ validationErrors: body.error.flatten() }, 'Signup validation failed');
    return reply.status(400).send({ 
      error: 'Validation failed', 
      message: 'Please check your information and try again.',
      details: body.error.flatten().fieldErrors 
    });
  }

  const { firstName, lastName, email, phone, password } = body.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return reply.status(409).send({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { firstName, lastName, email, phone, passwordHash },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  // Send verification OTP
  const otp = generateOTP();
  await prisma.oTPCode.create({
    data: {
      email,
      code: otp,
      purpose: 'email_verify',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    },
  });
  await emailService.sendVerificationEmail(email, firstName, otp);

  const accessToken = jwtUtils.signAccess({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = jwtUtils.signRefresh({ sub: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TTL * 1000),
    },
  });

  setRefreshCookie(reply, refreshToken);

  return reply.status(201).send({
    message: 'Registration successful. Please verify your email.',
    user,
    accessToken,
  });
}

// ── Login
export async function login(req: FastifyRequest, reply: FastifyReply) {
  const body = loginSchema.safeParse(req.body);
  if (!body.success) {
    return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
  }

  const { email, password } = body.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  const accessToken = jwtUtils.signAccess({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = jwtUtils.signRefresh({ sub: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TTL * 1000),
    },
  });

  setRefreshCookie(reply, refreshToken);
  req.log.info({ 
    userId: user.id, 
    email: user.email,
    headers: req.headers,
    hostname: req.hostname 
  }, 'Login successful, refresh cookie set');

  return reply.send({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
  });
}

// ── Refresh Token
export async function refreshToken(req: FastifyRequest, reply: FastifyReply) {
  const tokenFromCookie = req.cookies[REFRESH_COOKIE];
  const tokenFromBody = refreshSchema.safeParse(req.body).data?.refreshToken;
  const token = tokenFromCookie ?? tokenFromBody;

  if (!token) {
    req.log.warn({ cookies: req.cookies }, 'No refresh token provided');
    return reply.status(401).send({ error: 'No refresh token provided' });
  }

  try {
    const payload = jwtUtils.verifyRefresh(token);

    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return reply.status(401).send({ error: 'Invalid or expired refresh token' });
    }

    // Rotate: revoke old, issue new
    await prisma.refreshToken.update({ where: { token }, data: { isRevoked: true } });

    const newRefresh = jwtUtils.signRefresh({ sub: payload.sub, email: payload.email, role: payload.role });
    const newAccess = jwtUtils.signAccess({ sub: payload.sub, email: payload.email, role: payload.role });

    await prisma.refreshToken.create({
      data: {
        token: newRefresh,
        userId: payload.sub,
        expiresAt: new Date(Date.now() + REFRESH_TTL * 1000),
      },
    });

    setRefreshCookie(reply, newRefresh);
    return reply.send({ accessToken: newAccess });
  } catch {
    return reply.status(401).send({ error: 'Invalid refresh token' });
  }
}

// ── Logout
export async function logout(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies[REFRESH_COOKIE];
  if (token) {
    await prisma.refreshToken.updateMany({ where: { token }, data: { isRevoked: true } });
  }

  // Blacklist access token
  const accessToken = jwtUtils.extractFromHeader(req.headers.authorization);
  if (accessToken) {
    await cache.set(`blacklist:${accessToken}`, true, 15 * 60); // 15 min TTL
  }

  reply.clearCookie(REFRESH_COOKIE, { path: '/' });
  return reply.send({ message: 'Logged out successfully' });
}

// ── Verify Email
export async function verifyEmail(req: FastifyRequest, reply: FastifyReply) {
  const { email, otp } = z.object({ email: z.string().email(), otp: z.string().length(6) }).parse(req.body);

  const record = await prisma.oTPCode.findFirst({
    where: { email, code: otp, purpose: 'email_verify', usedAt: null, expiresAt: { gt: new Date() } },
  });

  if (!record) {
    return reply.status(400).send({ error: 'Invalid or expired OTP' });
  }

  await prisma.oTPCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  await prisma.user.update({ where: { email }, data: { isEmailVerified: true } });

  return reply.send({ message: 'Email verified successfully' });
}

// ── Forgot Password
export async function forgotPassword(req: FastifyRequest, reply: FastifyReply) {
  const { email } = forgotSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond 200 (security: don't reveal if email exists)
  if (!user) return reply.send({ message: 'If the email exists, you will receive a reset OTP.' });

  const otp = generateOTP();
  await prisma.oTPCode.create({
    data: {
      email,
      code: otp,
      purpose: 'password_reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    },
  });

  await emailService.sendPasswordResetEmail(email, user.firstName, otp);
  return reply.send({ message: 'If the email exists, you will receive a reset OTP.' });
}

// ── Reset Password
export async function resetPassword(req: FastifyRequest, reply: FastifyReply) {
  const { email, otp, newPassword } = resetSchema.parse(req.body);

  const record = await prisma.oTPCode.findFirst({
    where: { email, code: otp, purpose: 'password_reset', usedAt: null, expiresAt: { gt: new Date() } },
  });

  if (!record) {
    return reply.status(400).send({ error: 'Invalid or expired OTP' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.oTPCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  await prisma.user.update({ where: { email }, data: { passwordHash } });

  // Revoke all refresh tokens for security
  await prisma.refreshToken.updateMany({ where: { user: { email } }, data: { isRevoked: true } });

  return reply.send({ message: 'Password reset successfully. Please log in.' });
}
