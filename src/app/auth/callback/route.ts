import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  console.log("[AUTH CALLBACK] Code present:", !!code);

  if (!code) {
    console.error("[AUTH CALLBACK] No code in URL");
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  // Create a single response object that we'll mutate and return
  const response = NextResponse.redirect(`${origin}/dashboard`);

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
            response.cookies.set(name, value, options);
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

    const redirectPath = profile?.full_name ? "/dashboard" : "/onboarding";

    // Update the redirect URL on the SAME response object so cookies are preserved
    return NextResponse.redirect(`${origin}${redirectPath}`, {
      headers: response.headers,
    });
  } catch (err: any) {
    console.error("[AUTH CALLBACK] Unexpected error:", err.message);
    return NextResponse.redirect(`${origin}/login?error=unexpected`);
  }
}
