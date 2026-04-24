import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  image: z.string().url().optional(),
});

router.get('/', async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  res.json({ categories });
});

router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const category = await prisma.category.create({ data: parsed.data });
  res.status(201).json({ category });
});

router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const category = await prisma.category.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ category });
});

router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: 'Category deleted' });
});

export default router;
