# MedStyle — Premium Medical Apparel E-Commerce

A full-stack e-commerce application for fashionable medical clothing, built with React, Node.js, PostgreSQL and Stripe.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (httpOnly cookies) + bcrypt |
| Payments | Stripe (test mode) |
| Forms | React Hook Form + Zod |

## Features

- **Public**: Hero, catalog with filters/sorting/pagination, product gallery, cart drawer
- **Auth**: Register, login, refresh token rotation, httpOnly cookie security
- **Client Account**: Order history + tracking timeline, wishlist, profile/address management
- **Admin Panel**: Dashboard stats, product CRUD, order status management, user role control, category management
- **Cart**: Zustand-powered, synced with backend, slide-out drawer
- **Checkout**: Shipping form + Stripe test payment

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm or pnpm

---

## Quick Start

### 1. Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Variables

```bash
# In server/
cp ../.env.example .env
# Edit .env with your values
```

Required variables:
```
DATABASE_URL=postgresql://medstyle:medstyle_pass@localhost:5432/medstyle_db
JWT_ACCESS_SECRET=your-32-char-secret-here
JWT_REFRESH_SECRET=your-other-32-char-secret
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:3000
```

### 3. Start Database

**Option A: Docker (recommended)**
```bash
docker-compose up postgres -d
```

**Option B: Manual**
Create a PostgreSQL database named `medstyle_db` with user `medstyle`.

### 4. Run Migrations & Seed

```bash
cd server
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:seed        # Seed demo data
```

### 5. Start Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 3000)
cd client && npm run dev
```

Visit: **http://localhost:3000**

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medstyle.com | Admin123! |
| User | user@medstyle.com | User123! |

---

## Stripe Test Payment

Use test card `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Project Structure

```
/
├── client/                  React frontend
│   └── src/
│       ├── components/      Layout, ProductCard, CartDrawer, etc.
│       ├── pages/           All route pages
│       │   ├── account/     User dashboard, orders, profile, wishlist
│       │   └── admin/       Admin dashboard, products, orders, users
│       ├── store/           Zustand stores (auth, cart)
│       ├── api/             Axios instance with auto-refresh
│       └── types/           TypeScript interfaces
│
├── server/                  Express backend
│   ├── src/
│   │   ├── routes/          auth, products, cart, orders, payments, admin
│   │   ├── middleware/       JWT auth + admin guard
│   │   ├── utils/           Token generation/cookies
│   │   └── prisma/          Prisma client singleton
│   └── prisma/
│       ├── schema.prisma    Database models
│       └── seed.ts          Demo data seeder
│
├── docker-compose.yml       PostgreSQL container
├── .env.example             All required environment variables
└── README.md
```

---

## API Routes Summary

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me

GET    /api/products              (filters: category, size, color, price, search)
GET    /api/products/:id
POST   /api/products              (admin)
PUT    /api/products/:id          (admin)
DELETE /api/products/:id          (admin)

GET    /api/categories
POST   /api/categories            (admin)
PUT    /api/categories/:id        (admin)
DELETE /api/categories/:id        (admin)

GET    /api/cart
POST   /api/cart
PUT    /api/cart/:itemId
DELETE /api/cart/:itemId
DELETE /api/cart                  (clear all)

POST   /api/orders
GET    /api/orders
GET    /api/orders/:id

POST   /api/payments/create-intent
POST   /api/payments/webhook

GET    /api/admin/stats
GET    /api/admin/orders
PUT    /api/admin/orders/:id
GET    /api/admin/users
PUT    /api/admin/users/:id

GET    /api/wishlist
POST   /api/wishlist/:productId
DELETE /api/wishlist/:productId
```

---

## Security

- JWTs stored in **httpOnly cookies** (not localStorage)
- Refresh token rotation on every access token renewal
- Admin routes protected by role middleware
- All inputs validated with **Zod** before reaching the database
- Rate limiting on auth endpoints (10 req / 15 min)
- CORS restricted to frontend origin
- SQL injection protection via Prisma's parameterized queries
- bcrypt with cost factor 12 for password hashing

---

## Production Deployment

```bash
# Build server
cd server && npm run build

# Build client
cd client && npm run build

# Start server
cd server && npm start
```

Use `docker-compose up` to run the full stack with PostgreSQL.
