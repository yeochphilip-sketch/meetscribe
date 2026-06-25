import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  console.log("[MIDDLEWARE] Path:", request.nextUrl.pathname);

  // Auth callback: pass through with cookies intact
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    console.log("[MIDDLEWARE] Auth callback - processing with cookie passthrough");
    
    let response = NextResponse.next({
      request: { headers: request.headers },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, {
                ...options,
                sameSite: "none",
                secure: true,
              });
            });
          },
        },
      }
    );

    return response;
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: "none",
              secure: true,
            });
          });
        },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Pages that require authentication
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

    // Auth pages: login should redirect authenticated users away
    // Onboarding is now a pre-auth page, so DON'T redirect authenticated users away
    // (they might be coming back from OAuth callback)
    const isLoginPage = request.nextUrl.pathname === "/login";

    if (isLoginPage && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error("[MIDDLEWARE] Auth error:", err);
  }

  return supabaseResponse;
}
