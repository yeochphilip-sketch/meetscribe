import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const SALESFORCE_AUTH_URL = "https://login.salesforce.com/services/oauth2/authorize";
const SALESFORCE_TOKEN_URL = "https://login.salesforce.com/services/oauth2/token";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "connect") {
      const state = Buffer.from(JSON.stringify({ user_id: user.id, provider: "salesforce" })).toString("base64");
      const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/v1/integrations/salesforce/callback`;
      const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SALESFORCE_CLIENT_ID || "",
        redirect_uri: redirectUri,
        scope: "api refresh_token",
        state,
      });
      return NextResponse.json({ url: `${SALESFORCE_AUTH_URL}?${params.toString()}` });
    }

    if (action === "status") {
      const { data: integration } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "salesforce")
        .maybeSingle();
      return NextResponse.json({
        connected: !!integration?.is_active,
        last_sync: integration?.last_sync_at,
        instance_url: integration?.config?.instance_url,
      });
    }

    if (action === "sync") {
      const { data: integration } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "salesforce")
        .eq("is_active", true)
        .single();
      if (!integration) return NextResponse.json({ error: "Salesforce not connected" }, { status: 400 });

      const opportunitiesRes = await fetch(
        `${integration.config.instance_url}/services/data/v59.0/query?q=${encodeURIComponent("SELECT Id, Name, StageName, Amount, CloseDate FROM Opportunity WHERE CloseDate >= TODAY")}`,
        { headers: { Authorization: `Bearer ${integration.access_token}` } }
      );

      if (!opportunitiesRes.ok) return NextResponse.json({ error: "Failed to fetch Salesforce data" }, { status: 500 });

      const opportunitiesData = await opportunitiesRes.json();
      return NextResponse.json({
        opportunities: opportunitiesData.records || [],
        count: opportunitiesData.totalSize || 0,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Salesforce API error", details: error.message }, { status: 500 });
  }
}
