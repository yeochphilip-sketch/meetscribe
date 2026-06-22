'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LandingAuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const supabase = createClient();

  useEffect(() => {
    if (!code) return;

    // Supabase sent the code to / instead of /auth/callback — handle it here
    console.log('Auth code detected on landing page:', code);

    const exchangeCode = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Code exchange error:', error);
        return;
      }

      // Code exchanged successfully — redirect to dashboard or plan
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .maybeSingle();

          if (!profile?.plan) {
            router.push('/plan');
          } else {
            router.push('/dashboard');
          }
        } catch {
          router.push('/plan');
        }
      }
    };

    exchangeCode();
  }, [code, router, supabase]);

  return null;
}
