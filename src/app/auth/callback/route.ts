import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("[AUTH CALLBACK] ========== START ==========");
  console.log("[AUTH CALLBACK] Full URL:", request.url);
  console.log("[AUTH CALLBACK] Code present:", !!code);
  console.log("[AUTH CALLBACK] Next path:", next);

  if (!code) {
    console.error("[AUTH CALLBACK] No code in URL");
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/auth-code-error?error=no_code`
    );
  }

  const requestCookies = request.cookies.getAll();
  console.log(
    "[AUTH CALLBACK] Incoming cookies count:",
    requestCookies.length
  );
  console.log(
    "[AUTH CALLBACK] Incoming cookie names:",
    requestCookies.map((c) => c.name)
  );
  console.log(
    "[AUTH CALLBACK] Incoming cookie values (first 50 chars):",
    requestCookies.map((c) => ({ name: c.name, value: c.value.substring(0, 50) }))
  );

  const verifierCookie = requestCookies.find((c) =>
    c.name.includes("code-verifier")
  );
  console.log(
    "[AUTH CALLBACK] Verifier cookie found:",
    verifierCookie ? "YES" : "NO"
  );
  if (verifierCookie) {
    console.log(
      "[AUTH CALLBACK] Verifier cookie name:",
      verifierCookie.name,
      "length:",
      verifierCookie.value.length
    );
  }

  let response = NextResponse.redirect(`${request.nextUrl.origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          console.log("[AUTH CALLBACK] Supabase getAll called, returning", requestCookies.length, "cookies");
          return requestCookies;
        },
        setAll(cookiesToSet) {
          console.log("[AUTH CALLBACK] Supabase setAll called with", cookiesToSet.length, "cookies");
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log("[AUTH CALLBACK] Setting cookie:", name, "length:", value?.length ?? 0);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    console.log("[AUTH CALLBACK] Calling exchangeCodeForSession...");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[AUTH CALLBACK] Exchange error:", error.message);
      console.error("[AUTH CALLBACK] Error details:", JSON.stringify(error));
      response = NextResponse.redirect(
        `${request.nextUrl.origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
      );
      return response;
    }

    console.log("[AUTH CALLBACK] Exchange success! User:", data?.user?.email ?? "no email");
    console.log("[AUTH CALLBACK] Session present:", !!data?.session);
    console.log("[AUTH CALLBACK] Redirecting to:", next);
    console.log("[AUTH CALLBACK] ========== END ==========");
    return response;
  } catch (err: any) {
    console.error("[AUTH CALLBACK] Unexpected error:", err.message);
    console.error("[AUTH CALLBACK] Stack:", err.stack);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`
    );
  }
}
