import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
];

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "connect") {
      const state = Buffer.from(JSON.stringify({ user_id: user.id, provider: "google_drive" })).toString("base64");
      const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/v1/integrations/google/drive/callback`;
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        redirect_uri: redirectUri,
        response_type: "code",
        scope: SCOPES.join(" "),
        access_type: "offline",
        prompt: "consent",
        state,
      });
      return NextResponse.json({ url: `${GOOGLE_OAUTH_URL}?${params.toString()}` });
    }

    if (action === "status") {
      const { data: integration } = await supabase
        .from("integrations").select("*")
        .eq("user_id", user.id).eq("provider", "google_drive").maybeSingle();
      return NextResponse.json({ connected: !!integration?.is_active, last_sync: integration?.last_sync_at });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Drive API error", details: error.message }, { status: 500 });
  }
}
