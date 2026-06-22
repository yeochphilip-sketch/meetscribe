// Vercel deployment trigger - force rebuild
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          let hasPlan = false;
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('plan')
              .eq('id', user.id)
              .maybeSingle();

            if (profileError) {
              console.error('Profile query error:', profileError);
            }

            hasPlan = !!profile?.plan;
          } catch (err) {
            console.error('Profile check failed:', err);
            hasPlan = false;
          }

          if (!hasPlan) {
            return NextResponse.redirect(new URL('/plan', req.url));
          }

          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      } else {
        console.error('Auth callback exchange error:', error);
      }
    } catch (err) {
      console.error('Auth callback error:', err);
    }
  }

  return NextResponse.redirect(new URL('/login', req.url));
}
// deployment trigger
