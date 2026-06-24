'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  useEffect(() => {
    const handleCallback = async () => {
      if (!code) {
        router.push('/auth/auth-code-error?error=no_code');
        return;
      }

      const supabase = createClient();

      try {
        console.log('[CLIENT CALLBACK] Exchanging code...');
        
        // The browser client will automatically use the PKCE verifier 
        // from its internal storage (cookie or localStorage depending on config)
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('[CLIENT CALLBACK] Exchange failed:', error.message);
          // If PKCE fails, try one more time after a short delay
          // (sometimes the cookie needs a moment to be readable)
          await new Promise(r => setTimeout(r, 500));
          const retry = await supabase.auth.exchangeCodeForSession(code);
          
          if (retry.error) {
            router.push(`/auth/auth-code-error?error=${encodeURIComponent(retry.error.message)}`);
            return;
          }
          
          if (retry.data.session?.user) {
            await handleSuccess(retry.data.session.user);
            return;
          }
          
          router.push('/auth/auth-code-error?error=exchange_failed');
          return;
        }

        if (!data.session?.user) {
          console.error('[CLIENT CALLBACK] No session after exchange');
          router.push('/auth/auth-code-error?error=no_session');
          return;
        }

        await handleSuccess(data.session.user);

      } catch (err: any) {
        console.error('[CLIENT CALLBACK] Unexpected error:', err);
        router.push(`/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`);
      }
    };

    const handleSuccess = async (user: any) => {
      console.log('[CLIENT CALLBACK] Success, user:', user.id);

      // Check if user has a plan
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();

      const hasPlan = !!profile?.plan;
      const redirectPath = hasPlan ? next : '/plan';
      
      console.log('[CLIENT CALLBACK] Redirecting to:', redirectPath);
      router.push(redirectPath);
    };

    handleCallback();
  }, [code, next, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
