import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Scrubs', slug: 'scrubs', image: 'https://picsum.photos/seed/scrubs/600/400' },
  { name: 'Lab Coats', slug: 'lab-coats', image: 'https://picsum.photos/seed/labcoats/600/400' },
  { name: 'Surgical Caps', slug: 'surgical-caps', image: 'https://picsum.photos/seed/surgicalcaps/600/400' },
  { name: 'Medical Footwear', slug: 'medical-footwear', image: 'https://picsum.photos/seed/medicalshoes/600/400' },
  { name: 'Accessories', slug: 'accessories', image: 'https://picsum.photos/seed/accessories/600/400' },
];

const productTemplates = [
  { name: 'Classic Comfort Scrub Set', desc: 'Premium stretch fabric scrub set with modern fit. Perfect for long shifts.', price: 58, cat: 'scrubs', featured: true },
  { name: 'ProFlex V-Neck Scrub Top', desc: 'Moisture-wicking V-neck top with ample pocket storage for all essentials.', price: 35, cat: 'scrubs', featured: false },
  { name: 'Signature Jogger Scrub Pants', desc: 'Tapered jogger-style pants with elastic waistband and side pockets.', price: 42, cat: 'scrubs', featured: true },
  { name: 'Luxe 3-Pocket Scrub Top', desc: 'Ultra-soft antimicrobial fabric with minimalist design and flattering cut.', price: 48, cat: 'scrubs', featured: false },
  { name: 'Athletic Performance Scrubs', desc: 'Sport-inspired scrub set with 4-way stretch for ultimate freedom of movement.', price: 65, cat: 'scrubs', featured: true },
  { name: 'Elite Tailored Lab Coat', desc: 'Premium white lab coat with structured shoulders and slim modern silhouette.', price: 89, cat: 'lab-coats', featured: true },
  { name: 'Essential Clinical Coat', desc: 'Classic knee-length lab coat in pure white with side vents and button closure.', price: 72, cat: 'lab-coats', featured: false },
  { name: "Women's Fitted Lab Coat", desc: 'Elegantly fitted lab coat designed specifically for women with princess seams.', price: 95, cat: 'lab-coats', featured: true },
  { name: 'Short Medical Jacket', desc: 'Hip-length medical jacket ideal for dental, pharmacy and clinical settings.', price: 68, cat: 'lab-coats', featured: false },
  { name: 'Bouffant Surgical Cap – Floral', desc: 'Breathable bouffant cap with adjustable tie and charming floral pattern.', price: 18, cat: 'surgical-caps', featured: false },
  { name: 'Scrub Cap – Navy Classic', desc: 'Solid navy surgical cap with sweatband and adjustable back tie.', price: 15, cat: 'surgical-caps', featured: false },
  { name: 'Patterned Chemo Cap Set', desc: 'Set of 3 soft cotton caps in coordinating patterns. Ultra-comfortable.', price: 32, cat: 'surgical-caps', featured: true },
  { name: 'Chef-Style Scrub Cap', desc: 'Chef-style hat for surgeons who prefer full hair coverage with a modern look.', price: 22, cat: 'surgical-caps', featured: false },
  { name: 'CloudStep Nursing Clog', desc: 'Orthopedic-grade clog with memory foam insole and slip-resistant outsole.', price: 110, cat: 'medical-footwear', featured: true },
  { name: 'ProStride Athletic Shoe', desc: 'Lightweight athletic-style shoe with superior arch support for long shifts.', price: 120, cat: 'medical-footwear', featured: true },
  { name: 'EasySlip Comfort Shoe', desc: 'Easy slip-on medical shoe with antimicrobial lining and cushioned sole.', price: 85, cat: 'medical-footwear', featured: false },
  { name: 'StepSafe Closed Toe Clog', desc: 'Closed-toe safety clog meeting hospital slip-resistance standards.', price: 95, cat: 'medical-footwear', featured: false },
  { name: 'Medical ID Badge Reel', desc: 'Retractable badge reel with carabiner clip. Stethoscope charm included.', price: 12, cat: 'accessories', featured: false },
  { name: 'Compression Socks – 3 Pack', desc: 'Graduated compression socks (15-20 mmHg) for shift-long support and comfort.', price: 28, cat: 'accessories', featured: true },
  { name: 'Stethoscope Holder Clip', desc: 'Magnetic stethoscope holder clip compatible with all uniform styles.', price: 16, cat: 'accessories', featured: false },
];

const colorsMap: Record<string, string[]> = {
  scrubs: ['Navy', 'Ceil Blue', 'Hunter Green', 'Black', 'Wine', 'Pewter'],
  'lab-coats': ['White', 'Ivory'],
  'surgical-caps': ['Navy', 'Ceil Blue', 'Floral Pink', 'Black', 'Teal'],
  'medical-footwear': ['White', 'Black', 'Navy'],
  accessories: ['Black', 'Navy', 'White'],
};

async function main() {
  console.log('🌱 Seeding database...');

  const adminHash = await bcrypt.hash('Admin123!', 12);
  const userHash = await bcrypt.hash('User123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@galium.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@galium.com', passwordHash: adminHash, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'user@galium.com' },
    update: {},
    create: { name: 'Jane Doe', email: 'user@galium.com', passwordHash: userHash },
  });

  console.log('✅ Users created');

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    catMap[cat.slug] = created.id;
  }

  console.log('✅ Categories created');

  for (let i = 0; i < productTemplates.length; i++) {
    const t = productTemplates[i];
    const colors = colorsMap[t.cat] || ['White', 'Black', 'Navy'];
    const sizes = ['accessories', 'medical-footwear'].includes(t.cat)
      ? ['36', '37', '38', '39', '40', '41', '42', '43']
      : ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

    const images = JSON.stringify([
      `https://picsum.photos/seed/prod${i}a/600/800`,
      `https://picsum.photos/seed/prod${i}b/600/800`,
      `https://picsum.photos/seed/prod${i}c/600/800`,
    ]);

    await prisma.product.create({
      data: {
        name: t.name,
        description: t.desc,
        price: t.price,
        categoryId: catMap[t.cat],
        images,
        sizes: JSON.stringify(sizes),
        colors: JSON.stringify(colors),
        stock: Math.floor(Math.random() * 80) + 20,
        isFeatured: t.featured,
        isActive: true,
      },
    });
  }

  console.log('✅ 20 products created');
  console.log('🎉 Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
