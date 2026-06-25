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
      `${request.nextUrl.origin}/login?error=no_code`
    );
  }

  let response = NextResponse.redirect(`${request.nextUrl.origin}${next}`);

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

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[AUTH CALLBACK] Exchange error:", error.message);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    console.log("[AUTH CALLBACK] Exchange success! User:", data?.user?.email ?? "no email");

    // Check if user has a profile (has completed onboarding)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, company_name, role")
      .eq("id", data.user!.id)
      .maybeSingle();

    // If coming from onboarding (next=/onboarding), save the profile data
    if (next === "/onboarding" && data.user) {
      // Try to get onboarding data from query params (if passed through)
      // The onboarding page will handle sessionStorage → profile creation
      // For now, just redirect to onboarding page with session set
      response = NextResponse.redirect(`${request.nextUrl.origin}/onboarding`);
      // Re-apply session cookies
      const { data: sessionData } = await supabase.auth.getSession();
      return response;
    }

    // If no profile exists, redirect to onboarding
    if (!profile?.full_name) {
      response = NextResponse.redirect(`${request.nextUrl.origin}/onboarding`);
      return response;
    }

    // Otherwise go to the requested next page or dashboard
    return response;
  } catch (err: any) {
    console.error("[AUTH CALLBACK] Unexpected error:", err.message);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/login?error=unexpected`
    );
  }
}
