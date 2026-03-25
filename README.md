# TripInMinutes — Full-Stack Travel Platform

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | **React 18** + **TypeScript 5** |
| Build Tool | **Vite 5** (10x faster than CRA) |
| Styling | **Tailwind CSS 3** + **CSS Modules** + **Framer Motion** |
| State | **Zustand** (global) + **TanStack Query v5** (server state) |
| Forms | **React Hook Form** + **Zod** validation |
| Routing | **React Router v6** |
| UI Components | **Radix UI** primitives + custom design system |
| Icons | **Lucide React** |
| HTTP | **Axios** with interceptors |
| Auth | **JWT** + **HTTP-only cookies** |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | **Node.js 22** + **TypeScript 5** |
| Framework | **Fastify 4** (3x faster than Express) |
| ORM | **Prisma 5** (type-safe DB client) |
| Database | **PostgreSQL 16** |
| Cache | **Redis 7** |
| Auth | **JWT** (access + refresh tokens) + **bcrypt** |
| Email | **Nodemailer** + **Resend** |
| Validation | **Zod** schemas |
| File Upload | **Multer** + **Cloudinary** |
| Docs | **Swagger/OpenAPI 3** |

### DevOps / Infrastructure
| Layer | Technology |
|-------|-----------|
| Containerization | **Docker** + **Docker Compose** |
| Reverse Proxy | **Nginx** |
| CI/CD | **GitHub Actions** |
| Hosting (Frontend) | **Vercel** |
| Hosting (Backend) | **Railway** or **Render** |
| DB Hosting | **Supabase** (PostgreSQL) |
| Cache Hosting | **Upstash** (Redis) |
| CDN / Images | **Cloudinary** |

---

## Project Structure

```
tripinminutes/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable design system components
│   │   │   ├── layout/          # Header, Footer, Sidebar
│   │   │   ├── auth/            # Login, Register, ForgotPassword
│   │   │   ├── home/            # Hero, SearchStrip, PackageCard, etc.
│   │   │   ├── packages/        # Package listing, detail, filters
│   │   │   ├── flights/         # Flight search & results
│   │   │   ├── hotels/          # Hotel search & results
│   │   │   └── dashboard/       # User dashboard, bookings
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand stores
│   │   ├── types/               # TypeScript interfaces & types
│   │   ├── lib/                 # Axios instance, utilities, constants
│   │   ├── styles/              # Global CSS, CSS modules
│   │   └── App.tsx
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                     # Fastify + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/              # Route definitions
│   │   ├── controllers/         # Business logic handlers
│   │   ├── middleware/          # Auth, rate-limit, error handlers
│   │   ├── models/              # Prisma model helpers
│   │   ├── services/            # External APIs, email, payments
│   │   ├── utils/               # JWT, bcrypt, pagination helpers
│   │   └── types/               # Shared TypeScript types
│   ├── prisma/
│   │   └── schema.prisma        # Complete DB schema
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml           # PostgreSQL + Redis + pgAdmin
├── nginx.conf                   # Reverse proxy config
└── .env.example                 # All required env variables
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- pnpm (`npm i -g pnpm`)

### 1. Clone & Install
```bash
git clone https://github.com/yourorg/tripinminutes.git
cd tripinminutes

# Install all deps
cd frontend && pnpm install
cd ../backend && pnpm install
```

### 2. Start Database & Redis
```bash
# From root
docker-compose up -d
# PostgreSQL on :5432, Redis on :6379, pgAdmin on :5050
```

### 3. Set Environment Variables
```bash
cp .env.example .env
# Fill in your values (see .env.example)
```

### 4. Run Database Migrations
```bash
cd backend
pnpm prisma migrate dev --name init
pnpm prisma db seed      # Seeds demo packages, users
```

### 5. Start Dev Servers
```bash
# Terminal 1 — Backend (port 4000)
cd backend && pnpm dev

# Terminal 2 — Frontend (port 5173)
cd frontend && pnpm dev
```

### 6. Open
- Frontend: http://localhost:5173
- API: http://localhost:4000
- API Docs: http://localhost:4000/docs
- pgAdmin: http://localhost:5050

---

## Demo Credentials (after seeding)
```
Admin:    admin@tripinminutes.com / Admin@123
User:     demo@tripinminutes.com  / Demo@123
```
