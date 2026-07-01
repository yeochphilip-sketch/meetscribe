'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCodeHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // Auth code landed on / instead of /auth/callback
      // Use window.location.href (full navigation) so cookies are sent
      const currentParams = new URLSearchParams(window.location.search);
      window.location.href = `/auth/callback?${currentParams.toString()}`;
    }
  }, [searchParams]);

  return null;
}
