'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LandingAuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/plan';
  const supabase = createClient();

  useEffect(() => {
    if (!code) return;

    const exchangeCode = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Code exchange error on landing:', error);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .maybeSingle();
          router.push(profile?.plan ? '/dashboard' : '/plan');
        } catch {
          router.push('/plan');
        }
      }
    };
    exchangeCode();
  }, [code, router, supabase]);

  return null;
}
