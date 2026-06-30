import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const HUBSPOT_AUTH_URL = "https://app.hubspot.com/oauth/authorize";
const HUBSPOT_TOKEN_URL = "https://api.hubapi.com/oauth/v1/token";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "connect") {
      const state = Buffer.from(JSON.stringify({ user_id: user.id, provider: "hubspot" })).toString("base64");
      const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/v1/integrations/hubspot/callback`;
      const params = new URLSearchParams({
        client_id: process.env.HUBSPOT_CLIENT_ID || "",
        redirect_uri: redirectUri,
        scope: "crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write oauth",
        state,
      });
      return NextResponse.json({ url: `${HUBSPOT_AUTH_URL}?${params.toString()}` });
    }

    if (action === "status") {
      const { data: integration } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "hubspot")
        .maybeSingle();
      return NextResponse.json({
        connected: !!integration?.is_active,
        last_sync: integration?.last_sync_at,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "HubSpot API error", details: error.message }, { status: 500 });
  }
}
