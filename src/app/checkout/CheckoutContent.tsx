'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createClient } from '@/utils/supabase/client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ plan, clientSecret }: { plan: string; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?payment=success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
      >
        {isLoading ? 'Processing...' : plan === 'custom' ? 'Submit Request' : 'Pay $15.00'}
      </button>

      <button
        type="button"
        onClick={() => router.push('/plan')}
        className="w-full text-gray-400 hover:text-white text-sm py-2"
      >
        ← Back to plans
      </button>
    </form>
  );
}

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!plan || (plan !== 'pro' && plan !== 'custom')) {
      setLoading(false);
      setError('Invalid plan selected. Please go back and select a valid plan.');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not authenticated. Please log in.');
          setLoading(false);
          return;
        }

        const baseUrl = window.location.origin;
        const apiUrl = `${baseUrl}/api/create-payment-intent`;
        
        console.log('Base URL:', baseUrl);
        console.log('API URL:', apiUrl);
        console.log('Plan:', plan);
        console.log('User ID:', user.id);

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, userId: user.id }),
        });

        console.log('Response status:', res.status);
        console.log('Response URL:', res.url);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('API error response:', errorText);
          throw new Error(`API returned ${res.status}: ${errorText || 'No response body'}`);
        }

        const data = await res.json();
        console.log('Response data:', data);

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error('No client secret returned');
        }
      } catch (err: any) {
        console.error('Payment intent error:', err);
        setError(err.message || 'Failed to load payment form');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [plan, supabase]);

  if (!plan || (plan !== 'pro' && plan !== 'custom')) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Invalid plan selected</p>
          <button 
            onClick={() => window.location.href = '/plan'}
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to plans
          </button>
        </div>
      </div>
    );
  }

  const planDetails = {
    pro: { name: 'Pro Plan', price: '$15/month', description: 'Unlimited meetings & advanced AI insights' },
    custom: { name: 'Custom Plan', price: 'Custom pricing', description: 'Enterprise solution - we will contact you' },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-gray-400">{planDetails[plan as keyof typeof planDetails].description}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Plan</span>
            <span className="font-semibold">{planDetails[plan as keyof typeof planDetails].name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Price</span>
            <span className="font-semibold text-xl">{planDetails[plan as keyof typeof planDetails].price}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading payment form...</div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = '/plan'}
              className="text-blue-400 hover:text-blue-300"
            >
              ← Back to plans
            </button>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <CheckoutForm plan={plan} clientSecret={clientSecret} />
          </Elements>
        ) : (
          <div className="text-center py-8 text-red-400">Failed to load payment form</div>
        )}
      </div>
    </div>
  );
}
