import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth at all
  const publicRoutes = ['/', '/login', '/auth/callback'];
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  
  if (isPublic || pathname.startsWith('/_next') || pathname.includes('.')) {
    return await updateSession(request);
  }

  // Allow API routes
  if (pathname.startsWith('/api/')) {
    return await updateSession(request);
  }

  // For all other routes, check auth
  let response = await updateSession(request);
  
  // Create a temporary request with the updated cookies to check auth
  const tempReq = new NextRequest(request.url, {
    headers: request.headers,
  });
  
  // Copy cookies from response to temp request
  response.cookies.getAll().forEach(cookie => {
    tempReq.cookies.set(cookie.name, cookie.value);
  });

  // We can't easily check auth in middleware without creating a client
  // So let the pages handle their own auth checks
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
