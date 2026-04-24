import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { parseProduct } from '../utils/transform';

const router = Router();
router.use(authenticate);

const shippingSchema = z.object({
  fullName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2),
  phone: z.string().min(7),
});

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

const orderInclude = {
  items: {
    include: {
      product: { select: { id: true, name: true, images: true } },
    },
  },
};

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = shippingSchema.safeParse(req.body.shippingAddress);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.userId },
    include: { product: true },
  });

  if (!cartItems.length) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      totalAmount,
      shippingAddress: JSON.stringify(parsed.data),
      items: {
        create: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color,
        })),
      },
    },
    include: orderInclude,
  });

  await prisma.cartItem.deleteMany({ where: { userId: req.userId } });

  res.status(201).json({ order: parseOrder(order) });
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ orders: orders.map(parseOrder) });
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: orderInclude,
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ order: parseOrder(order) });
});

export default router;
