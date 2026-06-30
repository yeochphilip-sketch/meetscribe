import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (dealError || !deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const [tRes, iRes, aRes, cRes, mRes] = await Promise.all([
      supabase.from("deal_transcripts").select("*").eq("deal_id", id).maybeSingle(),
      supabase.from("deal_intelligence").select("*").eq("deal_id", id).maybeSingle(),
      supabase.from("deal_actions").select("*").eq("deal_id", id).order("created_at", { ascending: true }),
      supabase.from("deal_coaching").select("*").eq("deal_id", id).maybeSingle(),
      supabase.from("meeting_sources").select("*").eq("deal_id", id).maybeSingle(),
    ]);

    return NextResponse.json({
      deal,
      transcript: tRes.data || null,
      intelligence: iRes.data || null,
      actions: aRes.data || [],
      coaching: cRes.data || null,
      meeting_source: mRes.data || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch deal", details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const allowedFields = ["title", "company_name", "contact_name", "contact_email", "contact_phone", "deal_value", "currency", "pipeline_stage", "close_probability", "estimated_close_date", "status"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

    const { data: deal, error } = await supabase
      .from("deals")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deal });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update deal", details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase.from("deals").delete().eq("id", id).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete deal", details: error.message }, { status: 500 });
  }
}
