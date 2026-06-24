'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LandingAuthHandler() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      // Auth code landed on / instead of /auth/callback
      // Preserve ALL query params (especially state which contains PKCE verifier)
      const currentParams = new URLSearchParams(window.location.search);
      
      // Redirect to server-side callback with all original params preserved
      window.location.replace(`/auth/callback?${currentParams.toString()}`);
    }
  }, [code]);

  return null;
}
