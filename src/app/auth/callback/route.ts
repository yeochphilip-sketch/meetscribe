import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('[AUTH CALLBACK] ========== START ==========');
  console.log('[AUTH CALLBACK] URL:', request.url);
  console.log('[AUTH CALLBACK] Code present:', !!code);
  console.log('[AUTH CALLBACK] Next:', next);

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log('[AUTH CALLBACK] All cookies:', allCookies.map(c => c.name));
  
  // Look for PKCE-related cookies
  const pkceCookie = allCookies.find(c => c.name.includes('code-verifier'));
  console.log('[AUTH CALLBACK] PKCE code-verifier cookie found:', !!pkceCookie);

  if (!code) {
    console.error('[AUTH CALLBACK] No code in URL');
    return NextResponse.redirect('https://meetscribe-v2.vercel.app/auth/auth-code-error?error=no_code');
  }

  try {
    // Create server client with explicit cookie handling for callback
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
        auth: {
          flowType: 'pkce',
        },
      }
    );

    console.log('[AUTH CALLBACK] Attempting exchangeCodeForSession...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[AUTH CALLBACK] Exchange FAILED:', error.message, error.status, error.code);
      return NextResponse.redirect(
        `https://meetscribe-v2.vercel.app/auth/auth-code-error?error=${encodeURIComponent(error.message)}&code=${error.status}`
      );
    }

    console.log('[AUTH CALLBACK] Exchange SUCCESS');
    console.log('[AUTH CALLBACK] Session user:', data.session?.user?.id || 'none');

    if (!data.session?.user) {
      console.error('[AUTH CALLBACK] No user in session after exchange');
      return NextResponse.redirect('https://meetscribe-v2.vercel.app/auth/auth-code-error?error=no_user_in_session');
    }

    const user = data.session.user;
    console.log('[AUTH CALLBACK] User ID:', user.id);

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
        console.log('[AUTH CALLBACK] Profile plan:', profile?.plan || 'none');
      }
    } catch (err) {
      console.error('[AUTH CALLBACK] Profile check exception:', err);
    }

    const redirectPath = hasPlan ? next : '/plan';
    const finalUrl = `https://meetscribe-v2.vercel.app${redirectPath}`;
    
    console.log('[AUTH CALLBACK] Redirecting to:', finalUrl);
    console.log('[AUTH CALLBACK] ========== END ==========');
    
    return NextResponse.redirect(finalUrl);

  } catch (err: any) {
    console.error('[AUTH CALLBACK] UNEXPECTED ERROR:', err.message, err.stack);
    return NextResponse.redirect(
      `https://meetscribe-v2.vercel.app/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`
    );
  }
}
