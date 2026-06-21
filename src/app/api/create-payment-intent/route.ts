import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();

    if (!userId || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const amount = plan === 'pro' ? 1500 : 0;
    const planName = plan === 'pro' ? 'Pro Plan' : 'Custom Plan';

    // Create customer
    const customer = await stripe.customers.create({
      metadata: { userId },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: { userId, plan },
      description: `MeetScribe ${planName}`,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
