import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ['/', '/login', '/auth/callback', '/api/webhooks'];
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  
  if (isPublic || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Create response object that we can modify
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create Supabase client for middleware context
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Not authenticated → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check plan selection (skip for plan/checkout pages)
  const planRoutes = ['/plan', '/checkout'];
  const isPlanRoute = planRoutes.some(route => pathname.startsWith(route));

  if (!isPlanRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    // No plan selected yet → plan page
    if (!profile?.plan) {
      return NextResponse.redirect(new URL('/plan', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
