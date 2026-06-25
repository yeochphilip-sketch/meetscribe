import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const nextFromUrl = searchParams.get("next") ?? "/dashboard";

  console.log("[AUTH CALLBACK] ========== START ==========");
  console.log("[AUTH CALLBACK] Full URL:", request.url);
  console.log("[AUTH CALLBACK] Code present:", !!code);
  console.log("[AUTH CALLBACK] State present:", !!state);

  if (!code) {
    console.error("[AUTH CALLBACK] No code in URL");
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/auth-code-error?error=no_code`);
  }

  // Recover PKCE verifier and next path from state parameter
  let codeVerifier: string | null = null;
  let nextPath = nextFromUrl;

  if (state) {
    try {
      const stateData = JSON.parse(atob(state));
      codeVerifier = stateData.v || null;
      nextPath = stateData.n || nextFromUrl;
      console.log("[AUTH CALLBACK] Recovered verifier from state, length:", codeVerifier?.length);
    } catch (e) {
      console.error("[AUTH CALLBACK] Failed to decode state:", e);
    }
  }

  if (!codeVerifier) {
    console.error("[AUTH CALLBACK] No PKCE verifier found in state");
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/auth-code-error?error=pkce_not_found`
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    console.log("[AUTH CALLBACK] Exchanging token...");
    const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        auth_code: code,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[AUTH CALLBACK] Token exchange failed:", tokenResponse.status, errorText);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/auth-code-error?error=token_exchange&details=${encodeURIComponent(errorText)}`
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("[AUTH CALLBACK] Token exchange success, user:", tokenData.user?.id);

    // Use @supabase/ssr server client to properly set session cookies
    const supabase = await createClient();
    
    // Set the session using the access token and refresh token
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });

    if (sessionError) {
      console.error("[AUTH CALLBACK] Set session error:", sessionError.message);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/auth-code-error?error=session_error&details=${encodeURIComponent(sessionError.message)}`
      );
    }

    console.log("[AUTH CALLBACK] Session set successfully, redirecting to:", nextPath);
    console.log("[AUTH CALLBACK] ========== END ==========");

    // Build redirect response
    const response = NextResponse.redirect(`${request.nextUrl.origin}${nextPath}`);
    return response;

  } catch (err: any) {
    console.error("[AUTH CALLBACK] Unexpected error:", err.message);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`
    );
  }
}
