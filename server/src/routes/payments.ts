import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10',
});

router.post('/create-intent', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.userId },
    include: { product: true },
  });

  if (!cartItems.length) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  const amount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata: { userId: req.userId! },
  });

  res.json({ clientSecret: paymentIntent.client_secret, amount });
});

router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.json({ received: true });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await prisma.order.updateMany({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: 'PROCESSING' },
      });
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: 'Webhook error' });
  }
});

export default router;
