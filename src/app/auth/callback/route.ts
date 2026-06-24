import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('[AUTH CALLBACK] Code present:', !!code);
  console.log('[AUTH CALLBACK] Next:', next);

  if (!code) {
    return NextResponse.redirect('https://meetscribe-v2.vercel.app/auth/auth-code-error?error=no_code');
  }

  const cookieStore = await cookies();
  
  // Log all cookies for debugging
  const allCookies = cookieStore.getAll();
  console.log('[AUTH CALLBACK] All cookies:', allCookies.map(c => c.name));
  
  // Find PKCE code verifier cookie
  // Supabase names it: sb-<project-ref>-auth-token-code-verifier
  const pkceCookie = allCookies.find(c => c.name.includes('code-verifier'));
  console.log('[AUTH CALLBACK] PKCE cookie found:', !!pkceCookie);

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    console.log('[AUTH CALLBACK] Attempting exchangeCodeForSession...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[AUTH CALLBACK] Exchange FAILED:', error.message);
      return NextResponse.redirect(
        `https://meetscribe-v2.vercel.app/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
      );
    }

    console.log('[AUTH CALLBACK] Exchange SUCCESS');
    console.log('[AUTH CALLBACK] Session user:', data.session?.user?.id);

    if (!data.session?.user) {
      return NextResponse.redirect('https://meetscribe-v2.vercel.app/auth/auth-code-error?error=no_user');
    }

    const user = data.session.user;

    // Check plan
    let hasPlan = false;
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('[AUTH CALLBACK] Profile query error:', profileError.message);
      } else {
        hasPlan = !!profile?.plan;
        console.log('[AUTH CALLBACK] Has plan:', hasPlan);
      }
    } catch (err) {
      console.error('[AUTH CALLBACK] Profile check exception:', err);
    }

    const redirectPath = hasPlan ? next : '/plan';
    const finalUrl = `https://meetscribe-v2.vercel.app${redirectPath}`;
    
    console.log('[AUTH CALLBACK] Redirecting to:', finalUrl);
    return NextResponse.redirect(finalUrl);

  } catch (err: any) {
    console.error('[AUTH CALLBACK] UNEXPECTED ERROR:', err.message);
    return NextResponse.redirect(
      `https://meetscribe-v2.vercel.app/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`
    );
  }
}
