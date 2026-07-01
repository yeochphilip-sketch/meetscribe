import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) return NextResponse.json({ error: "Missing code or state" }, { status: 400 });

    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const userId = stateData.user_id;
    const supabase = await createClient();

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/v1/integrations/google/gmail/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });

    const tokenData = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    const { error } = await supabase.from("integrations").upsert({
      user_id: userId,
      provider: "google_gmail",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      scope: tokenData.scope?.split(" ") || SCOPES,
      is_active: true,
      last_sync_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" });

    if (error) return NextResponse.json({ error: "Failed to save integration", details: error.message }, { status: 500 });
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/integrations?connected=google_gmail`);
  } catch (error: any) {
    return NextResponse.json({ error: "Callback error", details: error.message }, { status: 500 });
  }
}
