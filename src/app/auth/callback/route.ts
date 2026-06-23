import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('[AUTH CALLBACK] ========== START ==========');
  console.log('[AUTH CALLBACK] URL:', request.url);
  console.log('[AUTH CALLBACK] Code present:', !!code);
  console.log('[AUTH CALLBACK] Next:', next);
  console.log('[AUTH CALLBACK] All cookies:', request.cookies.getAll().map(c => c.name));
  console.log('[AUTH CALLBACK] Has sb-auth-token:', !!request.cookies.get('sb-auth-token'));
  console.log('[AUTH CALLBACK] Has sb-refresh-token:', !!request.cookies.get('sb-refresh-token'));

  if (!code) {
    console.error('[AUTH CALLBACK] No code in URL');
    return NextResponse.redirect('https://meetscribe-v2.vercel.app/auth/auth-code-error?error=no_code');
  }

  try {
    const supabase = await createClient();
    
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
    console.log('[AUTH CALLBACK] Session expires:', data.session?.expires_at);

    if (!data.session?.user) {
      console.error('[AUTH CALLBACK] No user in session after exchange');
      return NextResponse.redirect('https://meetscribe-v2.vercel.app/auth/auth-code-error?error=no_user_in_session');
    }

    const user = data.session.user;
    console.log('[AUTH CALLBACK] User ID:', user.id);
    console.log('[AUTH CALLBACK] User email:', user.email);

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
