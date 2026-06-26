'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCodeHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // Auth code landed on / instead of /auth/callback
      // Forward to the proper callback route, preserving the code
      const currentParams = new URLSearchParams(window.location.search);
      window.location.replace(`/auth/callback?${currentParams.toString()}`);
    }
  }, [searchParams]);

  return null;
}
