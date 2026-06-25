import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("[AUTH CALLBACK] Code present:", !!code);
  console.log("[AUTH CALLBACK] Next path:", next);

  if (!code) {
    console.error("[AUTH CALLBACK] No code in URL");
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/auth-code-error?error=no_code`
    );
  }

  // Use request cookies (not the static cookies() API) so we read
  // the PKCE verifier cookie that arrived with this request.
  const requestCookies = request.cookies.getAll();
  console.log(
    "[AUTH CALLBACK] Incoming cookies:",
    requestCookies.map((c) => c.name)
  );

  const verifierCookie = requestCookies.find((c) =>
    c.name.includes("code-verifier")
  );
  console.log(
    "[AUTH CALLBACK] Verifier cookie found:",
    verifierCookie ? "YES" : "NO"
  );

  // Build response that will carry the session cookies forward
  let response = NextResponse.redirect(`${request.nextUrl.origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requestCookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[AUTH CALLBACK] Exchange error:", error.message);
      response = NextResponse.redirect(
        `${request.nextUrl.origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
      );
      return response;
    }

    console.log("[AUTH CALLBACK] Success, redirecting to:", next);
    return response;
  } catch (err: any) {
    console.error("[AUTH CALLBACK] Unexpected error:", err.message);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`
    );
  }
}
