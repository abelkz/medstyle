import 'dotenv/config';
import { execSync } from 'child_process';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { rateLimit } from 'express-rate-limit';

// Push DB schema and seed on startup in production
if (process.env.NODE_ENV === 'production') {
  const serverRoot = path.join(__dirname, '..');
  try {
    console.log('Running prisma db push...');
    execSync('npx prisma db push --accept-data-loss', { cwd: serverRoot, stdio: 'inherit' });
    console.log('DB schema up to date.');
  } catch (e) {
    console.error('prisma db push failed:', e);
  }
  try {
    console.log('Running seed...');
    execSync('npx tsx prisma/seed.ts', { cwd: serverRoot, stdio: 'inherit' });
    console.log('Seed complete.');
  } catch (e) {
    console.error('Seed failed:', e);
  }
}

import { prisma } from './prisma/client';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import wishlistRoutes from './routes/wishlist';

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

// Serve React build in production
if (isProd) {
  const clientDist = path.join(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Galium server running on http://localhost:${PORT}`);
});

export default app;
