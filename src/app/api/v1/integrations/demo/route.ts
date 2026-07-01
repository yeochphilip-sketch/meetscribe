import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const DEMO_DATA: Record<string, any> = {
  salesforce: {
    access_token: "demo_token",
    refresh_token: "demo_refresh",
    token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    scope: ["api", "refresh_token"],
    config: { instance_url: "https://demo.salesforce.com", id: "demo" },
    is_active: true,
    last_sync_at: new Date().toISOString(),
  },
  hubspot: {
    access_token: "demo_token",
    refresh_token: "demo_refresh",
    token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    scope: ["crm.objects.contacts.read", "crm.objects.contacts.write", "crm.objects.deals.read", "crm.objects.deals.write", "oauth"],
    config: { portal_id: "demo" },
    is_active: true,
    last_sync_at: new Date().toISOString(),
  },
  google_calendar: {
    access_token: "demo_token",
    refresh_token: "demo_refresh",
    token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    scope: ["https://www.googleapis.com/auth/calendar.readonly", "https://www.googleapis.com/auth/calendar.events.readonly"],
    config: { calendar_id: "primary" },
    is_active: true,
    last_sync_at: new Date().toISOString(),
  },
  google_gmail: {
    access_token: "demo_token",
    refresh_token: "demo_refresh",
    token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    scope: ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly"],
    config: {},
    is_active: true,
    last_sync_at: new Date().toISOString(),
  },
  google_drive: {
    access_token: "demo_token",
    refresh_token: "demo_refresh",
    token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    scope: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.readonly"],
    config: {},
    is_active: true,
    last_sync_at: new Date().toISOString(),
  },
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { provider, action } = body;

    if (!provider || !DEMO_DATA[provider]) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    if (action === "disconnect") {
      const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", provider);

      if (error) return NextResponse.json({ error: "Failed to disconnect", details: error.message }, { status: 500 });
      return NextResponse.json({ success: true, provider, mode: "disconnected" });
    }

    const demo = DEMO_DATA[provider];

    const { error } = await supabase.from("integrations").upsert({
      user_id: user.id,
      provider,
      access_token: demo.access_token,
      refresh_token: demo.refresh_token,
      token_expires_at: demo.token_expires_at,
      scope: demo.scope,
      config: demo.config,
      is_active: true,
      last_sync_at: demo.last_sync_at,
    }, { onConflict: "user_id,provider" });

    if (error) return NextResponse.json({ error: "Failed to enable demo", details: error.message }, { status: 500 });
    return NextResponse.json({ success: true, provider, mode: "demo" });
  } catch (error: any) {
    return NextResponse.json({ error: "Demo error", details: error.message }, { status: 500 });
  }
}
