import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, codeVerifier, next = "/dashboard" } = body;

  if (!code || !codeVerifier) {
    return NextResponse.json(
      { error: "Missing code or codeVerifier" },
      { status: 400 }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const tokenResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=pkce`,
      {
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
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[SERVER CALLBACK] Token exchange failed:", tokenResponse.status, errorText);
      return NextResponse.json(
        { error: "Token exchange failed", details: errorText },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();

    // Set session cookies using @supabase/ssr server client
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });

    if (sessionError) {
      console.error("[SERVER CALLBACK] Set session error:", sessionError.message);
      return NextResponse.json(
        { error: "Session error", details: sessionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, next });
  } catch (err: any) {
    console.error("[SERVER CALLBACK] Unexpected error:", err.message);
    return NextResponse.json(
      { error: "Unexpected error", details: err.message },
      { status: 500 }
    );
  }
}
