import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user has a plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();

        // If user already has a plan, go to dashboard
        if (profile?.plan) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // New user - always go to plan page first
        return NextResponse.redirect(new URL('/plan', req.url));
      }
    }
  }

  return NextResponse.redirect(new URL('/login', req.url));
}
