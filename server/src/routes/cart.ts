import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
  size: z.string(),
  color: z.string(),
});

const cartInclude = {
  product: {
    select: { id: true, name: true, price: true, images: true, stock: true },
  },
};

router.get('/', async (req: AuthRequest, res: Response) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.userId },
    include: cartInclude,
  });
  res.json({ items });
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = cartItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { productId, quantity, size, color } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_productId_size_color: { userId: req.userId!, productId, size, color } },
    update: { quantity: { increment: quantity } },
    create: { userId: req.userId!, productId, quantity, size, color },
    include: cartInclude,
  });

  res.json({ item });
});

router.put('/:itemId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    res.status(400).json({ error: 'Invalid quantity' });
    return;
  }

  const item = await prisma.cartItem.updateMany({
    where: { id: req.params.itemId, userId: req.userId },
    data: { quantity },
  });

  if (!item.count) {
    res.status(404).json({ error: 'Cart item not found' });
    return;
  }

  res.json({ message: 'Updated' });
});

router.delete('/:itemId', async (req: AuthRequest, res: Response) => {
  await prisma.cartItem.deleteMany({
    where: { id: req.params.itemId, userId: req.userId },
  });
  res.json({ message: 'Removed' });
});

router.delete('/', async (req: AuthRequest, res: Response) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.userId } });
  res.json({ message: 'Cart cleared' });
});

export default router;
