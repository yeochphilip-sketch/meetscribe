'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LandingAuthHandler() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [status, setStatus] = useState<'idle' | 'redirecting' | 'error'>('idle');

  useEffect(() => {
    if (!code || status !== 'idle') return;

    console.log('[LandingAuthHandler] Auth code detected on /:', code);
    setStatus('redirecting');

    // Forward the code to the proper server-side callback route
    // This ensures the code is exchanged with all PKCE cookies intact
    const callbackUrl = `/auth/callback?code=${encodeURIComponent(code)}`;
    console.log('[LandingAuthHandler] Redirecting to:', callbackUrl);

    window.location.replace(callbackUrl);
  }, [code, status]);

  // Show a brief loading state while redirecting
  if (status === 'redirecting') {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f]/90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return null;
}
