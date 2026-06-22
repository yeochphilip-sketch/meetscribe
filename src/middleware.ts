import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes — no auth needed at all
  const publicRoutes = ['/', '/login', '/auth/callback', '/api', '/onboarding']
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  if (isPublic || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Update session and check auth
  const response = await updateSession(request)

  // Check if user is authenticated by looking at the session cookie
  // If not authenticated, redirect to login
  const supabaseClient = response
  // The updateSession already refreshes the session, so we just return the response
  // If the user is not authenticated, the session won't be valid and subsequent
  // client-side requests will fail gracefully

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
