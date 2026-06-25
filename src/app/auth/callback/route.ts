import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // next comes from queryParams which Supabase passes through
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("[AUTH CALLBACK] Code present:", !!code);
  console.log("[AUTH CALLBACK] Next path:", next);

  if (!code) {
    console.error("[AUTH CALLBACK] No code in URL");
    return NextResponse.redirect(
      `${origin}/login?error=no_code`
    );
  }

  let exchangeResponse = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            exchangeResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[AUTH CALLBACK] Exchange error:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    console.log("[AUTH CALLBACK] Exchange success! User:", data?.user?.email ?? "no email");

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", data.user!.id)
      .maybeSingle();

    let redirectUrl = `${origin}${next}`;
    if (!profile?.full_name) {
      redirectUrl = `${origin}/onboarding`;
    }

    const finalResponse = NextResponse.redirect(redirectUrl);
    
    // Copy all cookies from exchangeResponse to finalResponse
    exchangeResponse.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        maxAge: cookie.maxAge,
        domain: cookie.domain,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite as "strict" | "lax" | "none" | undefined,
      });
    });

    return finalResponse;
  } catch (err: any) {
    console.error("[AUTH CALLBACK] Unexpected error:", err.message);
    return NextResponse.redirect(
      `${origin}/login?error=unexpected`
    );
  }
}
