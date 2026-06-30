import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
];

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "connect") {
      const state = Buffer.from(JSON.stringify({ user_id: user.id, provider: "google_calendar" })).toString("base64");
      const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/v1/integrations/google/calendar/callback`;
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
        .from("integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "google_calendar")
        .maybeSingle();
      return NextResponse.json({
        connected: !!integration?.is_active,
        last_sync: integration?.last_sync_at,
        config: integration?.config,
      });
    }

    if (action === "sync") {
      const { data: integration } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "google_calendar")
        .eq("is_active", true)
        .single();
      if (!integration) return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 });

      let accessToken = integration.access_token;
      if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
        accessToken = await refreshGoogleToken(integration.refresh_token, supabase, user.id, "google_calendar");
      }

      const now = new Date();
      const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const eventsRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${oneWeekLater.toISOString()}&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!eventsRes.ok) return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });

      const eventsData = await eventsRes.json();
      const salesMeetings = (eventsData.items || []).filter((event: any) => {
        const attendees = event.attendees || [];
        return attendees.length > 1 && !event.summary?.toLowerCase().includes("internal");
      }).map((event: any) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        attendees: (event.attendees || []).map((a: any) => ({ email: a.email, name: a.displayName })),
        location: event.location,
        hangoutLink: event.hangoutLink,
      }));

      await supabase.from("integrations").update({ last_sync_at: new Date().toISOString() }).eq("id", integration.id);
      return NextResponse.json({ meetings_found: salesMeetings.length, meetings: salesMeetings });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Calendar API error", details: error.message }, { status: 500 });
  }
}

async function refreshGoogleToken(refreshToken: string | null, supabase: any, userId: string, provider: string): Promise<string> {
  if (!refreshToken) throw new Error("No refresh token available");
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error("Failed to refresh token");
  const data = await response.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);
  await supabase
    .from("integrations")
    .update({ access_token: data.access_token, token_expires_at: expiresAt.toISOString() })
    .eq("user_id", userId)
    .eq("provider", provider);
  return data.access_token;
}
