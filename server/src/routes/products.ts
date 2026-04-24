import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { parseProduct, parseProducts } from '../utils/transform';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

const productSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  categoryId: z.string(),
  sizes: z.union([z.array(z.string()), z.string()]),
  colors: z.union([z.array(z.string()), z.string()]),
  stock: z.coerce.number().int().min(0),
  isFeatured: z.union([z.boolean(), z.string().transform(s => s === 'true')]).optional(),
});

const categoryInclude = { category: { select: { name: true, slug: true } } };

router.get('/', async (req: Request, res: Response) => {
  const { category, size, color, minPrice, maxPrice, sort, search, featured, page = '1', limit = '12' } = req.query;

  const where: any = { isActive: true };
  if (featured === 'true') where.isFeatured = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (search) where.name = { contains: search as string };

  const orderBy: any =
    sort === 'price-asc' ? { price: 'asc' }
    : sort === 'price-desc' ? { price: 'desc' }
    : { createdAt: 'desc' };

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  let products = await prisma.product.findMany({
    where,
    include: categoryInclude,
    orderBy,
    skip,
    take: limitNum,
  });

  // SQLite: filter by category slug, size, color in JS (no relational filters on JSON)
  if (category) products = products.filter((p: any) => p.category?.slug === category);
  if (size) products = products.filter((p: any) => JSON.parse(p.sizes).includes(size));
  if (color) products = products.filter((p: any) => JSON.parse(p.colors).includes(color));

  const total = products.length;

  res.json({ products: parseProducts(products), total, page: pageNum, totalPages: Math.ceil(total / limitNum) || 1 });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: categoryInclude,
  });

  if (!product || !product.isActive) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
    take: 4,
    include: categoryInclude,
  });

  res.json({ product: parseProduct(product), related: parseProducts(related) });
});

router.post('/', authenticate, requireAdmin, upload.array('images', 5), async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const files = req.files as Express.Multer.File[];
  const images = files?.length
    ? JSON.stringify(files.map(f => `/uploads/${f.filename}`))
    : JSON.stringify([`https://picsum.photos/seed/${Date.now()}/600/800`]);

  const { sizes, colors, ...rest } = parsed.data;
  const sizesStr = Array.isArray(sizes) ? JSON.stringify(sizes) : sizes;
  const colorsStr = Array.isArray(colors) ? JSON.stringify(colors) : colors;

  const product = await prisma.product.create({
    data: { ...rest, images, sizes: sizesStr, colors: colorsStr },
    include: categoryInclude,
  });

  res.status(201).json({ product: parseProduct(product) });
});

router.put('/:id', authenticate, requireAdmin, upload.array('images', 5), async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const files = req.files as Express.Multer.File[];
  const updateData: any = { ...parsed.data };
  if (files?.length) updateData.images = JSON.stringify(files.map(f => `/uploads/${f.filename}`));
  if (updateData.sizes && Array.isArray(updateData.sizes)) updateData.sizes = JSON.stringify(updateData.sizes);
  if (updateData.colors && Array.isArray(updateData.colors)) updateData.colors = JSON.stringify(updateData.colors);

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: updateData,
    include: categoryInclude,
  });

  res.json({ product: parseProduct(product) });
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Product deleted' });
});

export default router;
