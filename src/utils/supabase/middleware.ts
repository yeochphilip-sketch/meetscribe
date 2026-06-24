import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // CRITICAL: Don't interfere with auth callback - let cookies flow through
  if (
    request.nextUrl.pathname === "/auth/callback" ||
    request.nextUrl.pathname.startsWith("/auth/callback")
  ) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authRequiredPaths = [
    "/dashboard",
    "/plan",
    "/settings",
    "/checkout",
    "/new",
    "/meeting",
  ];
  const isAuthRequired = authRequiredPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthRequired && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const authPages = ["/login", "/onboarding"];
  const isAuthPage = authPages.some(
    (path) => request.nextUrl.pathname === path
  );

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
