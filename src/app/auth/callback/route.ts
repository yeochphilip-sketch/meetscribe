import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  console.log("[AUTH CALLBACK] Code present:", !!code);

  if (!code) {
    console.error("[AUTH CALLBACK] No code in URL");
    return NextResponse.redirect(
      `${origin}/login?error=no_code`
    );
  }

  // We'll build the response after successful exchange
  let redirectPath = "/dashboard";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Store cookies temporarily - we'll apply them to the final response
          // @ts-ignore
          request._pendingCookies = request._pendingCookies || [];
          // @ts-ignore
          request._pendingCookies.push(...cookiesToSet);
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

    if (!profile?.full_name) {
      redirectPath = "/onboarding";
    }

    // Create final redirect response
    const finalResponse = NextResponse.redirect(`${origin}${redirectPath}`);

    // Apply all pending cookies
    // @ts-ignore
    const pendingCookies = request._pendingCookies || [];
    pendingCookies.forEach(({ name, value, options }: any) => {
      finalResponse.cookies.set(name, value, options);
    });

    return finalResponse;
  } catch (err: any) {
    console.error("[AUTH CALLBACK] Unexpected error:", err.message);
    return NextResponse.redirect(
      `${origin}/login?error=unexpected`
    );
  }
}
