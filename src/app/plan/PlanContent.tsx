'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function PlanContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Get started with AI meeting notes',
      features: ['5 meetings/month', 'Basic transcription', 'Email support'],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$15',
      period: '/month',
      description: 'For power users and small teams',
      features: ['Unlimited meetings', 'Advanced AI insights', 'Priority support', 'Team sharing'],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      id: 'custom',
      name: 'Custom',
      price: 'Custom',
      period: '',
      description: 'Enterprise-grade for large teams',
      features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'SSO & SAML', 'SLA guarantee'],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const handleSelectPlan = async (planId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Selected plan:', planId);
    setLoading(planId);

    if (planId === 'free') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ plan: 'free' }).eq('id', user.id);
        }
        router.push('/dashboard');
      } catch (err) {
        console.error('Error selecting free plan:', err);
        setLoading(null);
      }
      return;
    }

    if (planId === 'pro') {
      router.push('/checkout?plan=pro');
      return;
    }

    if (planId === 'custom') {
      router.push('/checkout?plan=custom');
      return;
    }

    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-400 text-lg">Select the plan that works best for your team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-8 flex flex-col ${
              plan.popular
                ? 'border-blue-500 bg-gray-900/50'
                : 'border-gray-800 bg-gray-900/30'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <p className="text-gray-400 mt-2 text-sm">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={(e) => handleSelectPlan(plan.id, e)}
              disabled={loading === plan.id}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                plan.popular
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id ? 'Processing...' : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
