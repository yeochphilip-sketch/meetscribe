import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import LandingPageClient from './LandingPageClient';
import AuthCodeHandler from './AuthCodeHandler';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, go straight to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <Suspense fallback={null}>
        <AuthCodeHandler />
      </Suspense>
      <LandingPageClient />
    </>
  );
}
