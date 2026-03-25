// src/index.ts
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import compress from '@fastify/compress';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { authRoutes }        from './routes/auth.routes.js';
import { packageRoutes }     from './routes/package.routes.js';
import { bookingRoutes }     from './routes/booking.routes.js';
import { userRoutes }        from './routes/user.routes.js';
import { reviewRoutes }      from './routes/review.routes.js';
import { enquiryRoutes }     from './routes/enquiry.routes.js';
import { wishlistRoutes }    from './routes/wishlist.routes.js';
import { dealRoutes }        from './routes/deal.routes.js';
import { newsletterRoutes }  from './routes/newsletter.routes.js';
import { destinationRoutes } from './routes/destination.routes.js';
import { paymentRoutes }     from './routes/payment.routes.js';
import { flightRoutes }      from './routes/flight.routes.js';
import { errorHandler }      from './middleware/error.middleware.js';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
  trustProxy: true,
});

async function bootstrap() {
  // ── Security
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:5173'];

  // ── CORS
  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow localhost and any trycloudflare.com subdomain
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.trycloudflare.com')) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Cookies
  await app.register(cookie, {
    secret: process.env.JWT_REFRESH_SECRET ?? 'cookie-secret',
    hook: 'onRequest',
  });

  // ── Rate Limiting
  await app.register(rateLimit, {
    global: true,
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000'),
    redis,
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    }),
  });

  // ── Compression
  await app.register(compress, { global: true });

  // ── Multipart / File Uploads
  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  // ── Swagger / API Docs
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'TripInMinutes API',
        description: 'Premium Travel Platform REST API',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${process.env.PORT ?? 4000}` }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  // ── Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(userRoutes, { prefix: '/api/v1/users' });
  await app.register(packageRoutes, { prefix: '/api/v1/packages' });
  await app.register(destinationRoutes, { prefix: '/api/v1/destinations' });
  await app.register(bookingRoutes, { prefix: '/api/v1/bookings' });
  await app.register(reviewRoutes, { prefix: '/api/v1/reviews' });
  await app.register(enquiryRoutes, { prefix: '/api/v1/enquiries' });
  await app.register(wishlistRoutes, { prefix: '/api/v1/wishlist' });
  await app.register(dealRoutes, { prefix: '/api/v1/deals' });
  await app.register(newsletterRoutes, { prefix: '/api/v1/newsletter' });
  await app.register(paymentRoutes,    { prefix: '/api/v1/payments' });
  await app.register(flightRoutes,     { prefix: '/api/v1/flights' });
  
  // ── Root API Route
  app.get('/api/v1', async () => ({
    message: '🚀 TripInMinutes API v1 is running',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health',
    timestamp: new Date().toISOString(),
  }));

  // ── Health Check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  }));

  // ── Error Handler
  app.setErrorHandler(errorHandler);

  // Root route
  app.get('/', async () => {
    return { 
      status: 'ok', 
      message: 'TripInMinutes API is running',
      version: '1.0.0',
      docs: '/api/docs'
    };
  });

  // ── Not Found
  app.setNotFoundHandler((req, reply) => {
    reply.status(404).send({ error: 'Route not found', path: req.url });
  });

  const port = parseInt(process.env.PORT ?? '4000');
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`🚀 TripInMinutes API running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/docs`);
}

// ── Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await app.close();
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
