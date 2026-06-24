'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LandingAuthHandler() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      // Auth code landed on / instead of /auth/callback
      // Preserve any next param for post-auth redirect
      const next = searchParams.get('next') || '/dashboard';
      window.location.replace(
        `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`
      );
    }
  }, [code, searchParams]);

  return null;
}
