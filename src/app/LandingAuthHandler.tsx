'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LandingAuthHandler() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      // Auth code landed on / instead of /auth/callback.
      // This means Supabase redirect URL is misconfigured.
      // Redirect to the proper callback handler.
      window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
    }
  }, [code]);

  return null;
}
