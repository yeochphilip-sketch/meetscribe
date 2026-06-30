import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: integrations } = await supabase
      .from("integrations")
      .select("provider, is_active, last_sync_at, config")
      .eq("user_id", user.id);

    const allProviders = [
      { id: "google_calendar", name: "Google Calendar", category: "calendar", description: "Auto-detect sales meetings and prep briefs" },
      { id: "google_gmail", name: "Gmail", category: "email", description: "Send follow-up emails automatically" },
      { id: "google_drive", name: "Google Drive", category: "storage", description: "Store meeting recordings and transcripts" },
      { id: "salesforce", name: "Salesforce", category: "crm", description: "Sync deals, contacts, and tasks" },
      { id: "hubspot", name: "HubSpot", category: "crm", description: "Sync deals, contacts, and engagements" },
    ];

    const connected = integrations?.map((i: any) => i.provider) || [];
    const providers = allProviders.map((p) => ({
      ...p,
      connected: connected.includes(p.id),
      last_sync: integrations?.find((i: any) => i.provider === p.id)?.last_sync_at || null,
    }));

    return NextResponse.json({ providers, connected_count: connected.length });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch integrations", details: error.message }, { status: 500 });
  }
}
