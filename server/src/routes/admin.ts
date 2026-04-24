import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { parseProduct } from '../utils/transform';

const router = Router();
router.use(authenticate, requireAdmin);

function parseOrder(order: any) {
  return {
    ...order,
    shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
    items: order.items?.map((item: any) => ({
      ...item,
      product: item.product ? parseProduct(item.product) : item.product,
    })),
  };
}

// Dashboard stats
router.get('/stats', async (_req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOrders, totalUsers, newUsersToday, allOrders, pendingOrders] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.order.findMany({ where: { status: { not: 'CANCELLED' } }, select: { totalAmount: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
  ]);

  const revenue = allOrders.reduce((s, o) => s + o.totalAmount, 0);
  res.json({ totalOrders, totalUsers, newUsersToday, revenue, pendingOrders });
});

// Orders
router.get('/orders', async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  const where: any = {};
  if (status) where.status = status;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, parseInt(limit as string));

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { name: true, images: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ orders: orders.map(parseOrder), total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

router.put('/orders/:id', async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({ status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });
  res.json({ order });
});

// Users
router.get('/users', async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search } = req.query;
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { email: { contains: search as string } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, parseInt(limit as string));

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    role: z.enum(['USER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
    name: z.string().min(2).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  res.json({ user });
});

export default router;
