// src/utils/helpers.ts

import { randomInt } from 'crypto';

/** Generate a numeric OTP of given length */
export function generateOTP(length = 6): string {
  return Array.from({ length }, () => randomInt(0, 10)).join('');
}

/** Prisma skip/take from page & limit */
export function paginate(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

/** Build consistent pagination meta object */
export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

/** Format a number as Indian currency string */
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Sleep helper for retries */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Truncate a string safely */
export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

/** Convert a slug back to title case */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
