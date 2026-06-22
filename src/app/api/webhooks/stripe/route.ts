export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const userId = session.client_reference_id;

    if (userId) {
      const supabase = await createClient();
      await supabase
        .from('profiles')
        .update({
          plan: session.metadata?.plan || 'pro',
          plan_status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        })
        .eq('id', userId);

      await supabase.from('payments').insert({
        user_id: userId,
        plan: session.metadata?.plan || 'pro',
        amount: session.amount_total,
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent as string,
      });
    }
  }

  return NextResponse.json({ received: true });
}
