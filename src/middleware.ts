import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed at all
  const publicRoutes = ['/', '/login', '/auth/callback', '/api', '/onboarding'];
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  
  if (isPublic || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Create Supabase client to check auth
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser();

  // Not authenticated — redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow all other routes for authenticated users
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
