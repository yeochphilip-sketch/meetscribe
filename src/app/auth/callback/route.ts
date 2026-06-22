import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

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

          const redirectPath = hasPlan ? next : '/plan';
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      } else {
        console.error('Auth callback exchange error:', error);
      }
    } catch (err) {
      console.error('Auth callback error:', err);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
}
