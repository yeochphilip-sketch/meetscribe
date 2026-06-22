'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LandingAuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const [status, setStatus] = useState<'idle' | 'exchanging' | 'redirecting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!code || status !== 'idle') return;

    console.log('[LandingAuthHandler] Auth code detected on /:', code);
    setStatus('exchanging');

    const exchangeCode = async () => {
      try {
        const supabase = createClient();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('[LandingAuthHandler] Exchange error:', exchangeError);
          setErrorMsg(exchangeError.message);
          setStatus('error');
          return;
        }

        console.log('[LandingAuthHandler] Code exchanged successfully');

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error('[LandingAuthHandler] No user after exchange');
          setErrorMsg('Authentication failed. Please try again.');
          setStatus('error');
          return;
        }

        console.log('[LandingAuthHandler] User:', user.id);

        // Check if user has a profile with a plan
        let hasPlan = false;
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError) {
            console.error('[LandingAuthHandler] Profile query error:', profileError);
          }

          hasPlan = !!profile?.plan;
          console.log('[LandingAuthHandler] Has plan:', hasPlan);
        } catch (err) {
          console.error('[LandingAuthHandler] Profile check failed:', err);
          hasPlan = false;
        }

        setStatus('redirecting');

        // Save onboarding data if exists
        const onboardingData = localStorage.getItem('onboardingData');
        if (onboardingData && !hasPlan) {
          try {
            const { name, company, role } = JSON.parse(onboardingData);
            await supabase.from('profiles').upsert({
              id: user.id,
              full_name: name,
              company,
              role,
              email: user.email,
            });
            localStorage.removeItem('onboardingData');
          } catch (err) {
            console.error('[LandingAuthHandler] Failed to save onboarding:', err);
          }
        }

        // Redirect based on plan status
        if (hasPlan) {
          router.push('/dashboard');
        } else {
          router.push('/plan');
        }
      } catch (err: any) {
        console.error('[LandingAuthHandler] Unexpected error:', err);
        setErrorMsg(err.message || 'An unexpected error occurred');
        setStatus('error');
      }
    };

    exchangeCode();
  }, [code, status, router]);

  if (status === 'exchanging' || status === 'redirecting') {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f]/90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {status === 'exchanging' ? 'Completing sign in...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f]/90 flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sign in failed</h3>
          <p className="text-gray-400 text-sm mb-4">{errorMsg}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
