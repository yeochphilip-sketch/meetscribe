'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  useEffect(() => {
    const handleCallback = async () => {
      if (!code) {
        router.push('/auth/auth-code-error?error=no_code');
        return;
      }

      // Get PKCE verifier from localStorage
      const codeVerifier = localStorage.getItem('meetscribe-pkce-verifier');
      const next = localStorage.getItem('meetscribe-pkce-next') || '/dashboard';

      if (!codeVerifier) {
        console.error('[CLIENT CALLBACK] PKCE verifier not found in localStorage');
        router.push('/auth/auth-code-error?error=pkce_not_found');
        return;
      }

      console.log('[CLIENT CALLBACK] Code verifier found, length:', codeVerifier.length);

      try {
        // Manual token exchange
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            auth_code: code,
            code_verifier: codeVerifier,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('[CLIENT CALLBACK] Token exchange failed:', tokenResponse.status, errorText);
          router.push(`/auth/auth-code-error?error=token_exchange_failed&details=${encodeURIComponent(errorText)}`);
          return;
        }

        const tokenData = await tokenResponse.json();
        console.log('[CLIENT CALLBACK] Token exchange success, user:', tokenData.user?.id);

        // Store session in localStorage for @supabase/ssr to pick up
        const sessionData = {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          expires_in: tokenData.expires_in,
          token_type: tokenData.token_type,
          user: tokenData.user,
        };

        localStorage.setItem('meetscribe-auth-token', JSON.stringify(sessionData));
        
        // Also set the Supabase SSR format key
        const projectRef = supabaseUrl.split('//')[1].split('.')[0];
        localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify(sessionData));

        // Clean up PKCE data
        localStorage.removeItem('meetscribe-pkce-verifier');
        localStorage.removeItem('meetscribe-pkce-next');

        // Check if user has a plan
        const { data: profile } = await fetch(`${supabaseUrl}/rest/v1/profiles?select=plan&id=eq.${tokenData.user.id}`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        }).then(r => r.json());

        const hasPlan = profile && profile[0]?.plan;
        const redirectPath = hasPlan ? next : '/plan';
        
        console.log('[CLIENT CALLBACK] Redirecting to:', redirectPath);
        router.push(redirectPath);

      } catch (err: any) {
        console.error('[CLIENT CALLBACK] Unexpected error:', err);
        router.push(`/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`);
      }
    };

    handleCallback();
  }, [code, router]);

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
