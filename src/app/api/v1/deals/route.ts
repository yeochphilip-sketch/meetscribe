import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const stage = searchParams.get("stage");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("deals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (stage) query = query.eq("pipeline_stage", stage);

    const { data: deals, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deals: deals || [] });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch deals", details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, company_name, contact_name, contact_email, contact_phone, deal_value, currency, pipeline_stage, estimated_close_date, source, source_metadata } = body;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const { data: deal, error } = await supabase.from("deals").insert({
      user_id: user.id,
      title,
      company_name: company_name || null,
      contact_name: contact_name || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      deal_value: deal_value || null,
      currency: currency || "USD",
      pipeline_stage: pipeline_stage || "discovery",
      estimated_close_date: estimated_close_date || null,
      source: source || "manual",
      source_metadata: source_metadata || {},
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deal }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create deal", details: error.message }, { status: 500 });
  }
}
