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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[AUTH CALLBACK] Exchange failed:', error.message);
      return NextResponse.redirect(
        `https://meetscribe-v2.vercel.app/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
      );
    }

    if (!data.session?.user) {
      return NextResponse.redirect('https://meetscribe-v2.vercel.app/auth/auth-code-error?error=no_user');
    }

    const user = data.session.user;
    console.log('[AUTH CALLBACK] User:', user.id);

    // Check plan
    let hasPlan = false;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();

      hasPlan = !!profile?.plan;
    } catch (err) {
      console.error('[AUTH CALLBACK] Profile check failed:', err);
    }

    const redirectPath = hasPlan ? next : '/plan';
    return NextResponse.redirect(`https://meetscribe-v2.vercel.app${redirectPath}`);

  } catch (err: any) {
    console.error('[AUTH CALLBACK] Unexpected error:', err.message);
    return NextResponse.redirect(
      `https://meetscribe-v2.vercel.app/auth/auth-code-error?error=unexpected`
    );
  }
}
