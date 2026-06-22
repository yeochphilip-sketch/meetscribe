'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LandingAuthHandler() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      // If a code lands on /, it means the Supabase redirect URL is misconfigured.
      // Redirect to the proper callback handler.
      console.warn('[LandingAuthHandler] Auth code detected on /. Redirecting to /auth/callback');
      window.location.href = `/auth/callback?code=${encodeURIComponent(code)}`;
    }
  }, [code]);

  return null;
}
