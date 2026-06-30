import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { analyzeSalesCall } from "@/lib/ai/analysis";
import type { AIAnalysisRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, team_id")
      .eq("id", user.id)
      .single();

    const isPro = profile?.plan === "pro" || profile?.plan === "team" || profile?.plan === "enterprise";

    if (!isPro) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("deals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());
      if ((count || 0) >= 5) {
        return NextResponse.json({
          error: "Free limit reached",
          details: `You have used ${count} of 5 free deals this month.`,
          upgradeUrl: "/plan",
        }, { status: 403 });
      }
    }

    const body = await request.json();
    const { deal_id, title, transcript, segments, company_name, contact_name, deal_value, pipeline_stage } = body;

    if (!deal_id || !transcript) {
      return NextResponse.json({ error: "deal_id and transcript are required" }, { status: 400 });
    }

    await supabase.from("deals").update({ status: "active" }).eq("id", deal_id).eq("user_id", user.id);
    await supabase.from("deal_transcripts").update({ processing_status: "analyzing" }).eq("deal_id", deal_id).eq("user_id", user.id);

    const result = await analyzeSalesCall({
      deal_id,
      title: title || "Untitled Deal",
      transcript,
      segments: segments || [],
      company_name,
      contact_name,
      deal_value,
      pipeline_stage: pipeline_stage || "discovery",
    });

    await supabase.from("deal_intelligence").insert({ deal_id, user_id: user.id, ...result.intelligence });
    await supabase.from("deal_coaching").insert({ deal_id, user_id: user.id, ...result.coaching });

    if (result.actions.length > 0) {
      await supabase.from("deal_actions").insert(
        result.actions.map((a) => ({ deal_id, user_id: user.id, ...a }))
      );
    }

    await supabase.from("deals").update({
      close_probability: result.intelligence.estimated_close_probability,
      pipeline_stage: result.intelligence.crm_update_payload?.stage_change || pipeline_stage || "discovery",
    }).eq("id", deal_id).eq("user_id", user.id);

    await supabase.from("deal_transcripts").update({ processing_status: "completed" }).eq("deal_id", deal_id).eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      deal_id,
      intelligence: result.intelligence,
      coaching: result.coaching,
      actions_count: result.actions.length,
    });
  } catch (error: any) {
    console.error("[DEAL PROCESS] Error:", error.message);
    return NextResponse.json({ error: "Failed to process deal", details: error.message }, { status: 500 });
  }
}
