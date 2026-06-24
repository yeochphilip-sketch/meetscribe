import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const nextFromUrl = searchParams.get('next') ?? '/dashboard';

  console.log('[AUTH CALLBACK] Code present:', !!code);
  console.log('[AUTH CALLBACK] State present:', !!state);

  if (!code) {
    return NextResponse.redirect('https://meetscribe-v2.vercel.app/auth/auth-code-error?error=no_code');
  }

  // Recover PKCE verifier from state parameter
  let codeVerifier: string | null = null;
  let nextPath = nextFromUrl;

  if (state) {
    try {
      const stateData = JSON.parse(atob(state));
      codeVerifier = stateData.v || null;
      nextPath = stateData.n || nextFromUrl;
      console.log('[AUTH CALLBACK] Recovered verifier from state, length:', codeVerifier?.length);
    } catch (e) {
      console.error('[AUTH CALLBACK] Failed to decode state:', e);
    }
  }

  if (!codeVerifier) {
    console.error('[AUTH CALLBACK] No PKCE verifier found in state');
    return NextResponse.redirect(
      'https://meetscribe-v2.vercel.app/auth/auth-code-error?error=pkce_not_found'
    );
  }

  try {
    // Manual token exchange with recovered verifier
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        auth_code: code,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[AUTH CALLBACK] Token exchange failed:', tokenResponse.status, errorText);
      return NextResponse.redirect(
        `https://meetscribe-v2.vercel.app/auth/auth-code-error?error=token_exchange&details=${encodeURIComponent(errorText)}`
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('[AUTH CALLBACK] Token exchange success, user:', tokenData.user?.id);

    // Set session cookies
    const response = NextResponse.redirect(`https://meetscribe-v2.vercel.app${nextPath}`);
    
    const sessionData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      user: tokenData.user,
    };

    const projectRef = supabaseUrl.split('//')[1].split('.')[0];
    
    response.cookies.set(`sb-${projectRef}-auth-token`, JSON.stringify(sessionData), {
      path: '/',
      maxAge: tokenData.expires_in,
      sameSite: 'lax',
      secure: true,
    });

    response.cookies.set('sb-access-token', tokenData.access_token, {
      path: '/',
      maxAge: tokenData.expires_in,
      sameSite: 'lax',
      secure: true,
    });

    response.cookies.set('sb-refresh-token', tokenData.refresh_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: true,
    });

    return response;

  } catch (err: any) {
    console.error('[AUTH CALLBACK] Unexpected error:', err.message);
    return NextResponse.redirect(
      `https://meetscribe-v2.vercel.app/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`
    );
  }
}
