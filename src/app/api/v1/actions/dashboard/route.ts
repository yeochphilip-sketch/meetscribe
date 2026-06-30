import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const limit = parseInt(searchParams.get("limit") || "50");

    const { data: actions, error } = await supabase
      .from("deal_actions")
      .select("*, deal:deals(id, title, company_name, contact_name, pipeline_stage, status)")
      .eq("user_id", user.id)
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const grouped = (actions || []).reduce((acc: Record<string, any[]>, action: any) => {
      const type = action.action_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(action);
      return acc;
    }, {});

    const { data: stats } = await supabase
      .from("deal_actions")
      .select("status", { count: "exact" })
      .eq("user_id", user.id);

    const counts = {
      pending: stats?.filter((a: any) => a.status === "pending").length || 0,
      approved: stats?.filter((a: any) => a.status === "approved").length || 0,
      executed: stats?.filter((a: any) => a.status === "executed").length || 0,
      failed: stats?.filter((a: any) => a.status === "failed").length || 0,
    };

    return NextResponse.json({ actions: actions || [], grouped, counts });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch actions", details: error.message }, { status: 500 });
  }
}
