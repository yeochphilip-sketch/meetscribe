import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // CRITICAL: Don't touch auth callback at all — let cookies flow through natively
  if (
    request.nextUrl.pathname === "/auth/callback" ||
    request.nextUrl.pathname.startsWith("/auth/callback")
  ) {
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    // Explicitly pass all cookies through untouched
    request.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        path: "/",
        sameSite: "lax",
        secure: true,
      });
    });
    return response;
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
