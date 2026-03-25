// src/types/index.ts

/** Generic API success response wrapper */
export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}

/** Generic paginated response */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/** JWT payload shape (matches jwtUtils) */
export interface JWTPayload {
  sub: string;
  email: string;
  role: import('@prisma/client').Role;
  iat?: number;
  exp?: number;
}

/** Razorpay webhook event shape */
export interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        email: string;
        contact: string;
      };
    };
  };
}
