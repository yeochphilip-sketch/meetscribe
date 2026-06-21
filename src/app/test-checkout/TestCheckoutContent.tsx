'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
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
        return_url: `${window.location.origin}/test-checkout?success=true`,
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
        <h3 className="text-lg font-semibold mb-4">Test Card Details</h3>
        <p className="text-sm text-gray-400 mb-4">
          Use test card: <code className="bg-gray-800 px-2 py-1 rounded">4242 4242 4242 4242</code><br/>
          Any future date (e.g., 12/30) and any CVC (e.g., 123)
        </p>
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
        {isLoading ? 'Processing...' : 'Pay $15.00 Test'}
      </button>
    </form>
  );
}

function SuccessMessage() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
      <p className="text-gray-400 mb-6">Your test transaction worked perfectly.</p>
      <div className="space-y-3">
        <p className="text-sm text-gray-500">Check your Stripe Dashboard for the payment intent.</p>
        <p className="text-sm text-gray-500">Check your Supabase database — the user plan should be updated to "pro".</p>
      </div>
    </div>
  );
}

export default function TestCheckoutContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      setLoading(false);
      return;
    }

    const createTestPayment = async () => {
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            plan: 'pro', 
            userId: 'test-user-123' 
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API returned ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret returned');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    createTestPayment();
  }, [success]);

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <SuccessMessage />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Test Stripe Checkout</h1>
          <p className="text-gray-400">Direct test without login flow</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Plan</span>
            <span className="font-semibold">Pro Plan (Test)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Price</span>
            <span className="font-semibold text-xl">$15.00</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading payment form...</div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        ) : (
          <div className="text-center py-8 text-red-400">Failed to load payment form</div>
        )}
      </div>
    </div>
  );
}
