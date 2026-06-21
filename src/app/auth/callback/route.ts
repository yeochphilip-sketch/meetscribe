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
        // Try to get profile - if table doesn't exist or no profile, treat as new user
        let hasPlan = false;
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle instead of single to avoid error if no row

          if (profileError) {
            console.error('Profile query error:', profileError);
          }

          // If profile exists and has a plan, user is existing
          hasPlan = !!profile?.plan;
        } catch (err) {
          console.error('Profile check failed:', err);
          // If query fails (table doesn't exist, etc.), treat as new user
          hasPlan = false;
        }

        // If user has no plan, they're new - go to plan page
        if (!hasPlan) {
          return NextResponse.redirect(new URL('/plan', req.url));
        }

        // Existing user with plan - go to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  return NextResponse.redirect(new URL('/login', req.url));
}
