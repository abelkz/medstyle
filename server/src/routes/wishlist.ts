import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const wishlistInclude = {
  product: {
    include: { category: { select: { name: true, slug: true } } },
  },
};

router.get('/', async (req: AuthRequest, res: Response) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.userId },
    include: wishlistInclude,
  });
  res.json({ items });
});

router.post('/:productId', async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: req.userId!, productId: req.params.productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    res.json({ added: false });
    return;
  }

  await prisma.wishlist.create({
    data: { userId: req.userId!, productId: req.params.productId },
  });
  res.status(201).json({ added: true });
});

router.delete('/:productId', async (req: AuthRequest, res: Response) => {
  await prisma.wishlist.deleteMany({
    where: { userId: req.userId, productId: req.params.productId },
  });
  res.json({ message: 'Removed from wishlist' });
});

export default router;
