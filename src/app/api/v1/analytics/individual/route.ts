import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const days = parseInt(period.replace("d", "")) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data: deals } = await supabase
      .from("deals")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString());

    const { data: coachingData } = await supabase
      .from("deal_coaching")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString());

    const coaching = coachingData || [];
    const avgTalkRatio = coaching.length > 0
      ? coaching.reduce((sum: number, c: any) => sum + (c.rep_talk_ratio || 0), 0) / coaching.length
      : 0;
    const avgDiscoveryScore = coaching.length > 0
      ? coaching.reduce((sum: number, c: any) => sum + (c.discovery_depth_score || 0), 0) / coaching.length
      : 0;
    const avgObjectionScore = coaching.length > 0
      ? coaching.reduce((sum: number, c: any) => sum + (c.objection_handling_score || 0), 0) / coaching.length
      : 0;
    const avgOverallScore = coaching.length > 0
      ? coaching.reduce((sum: number, c: any) => sum + (c.overall_score || 0), 0) / coaching.length
      : 0;

    const weeklyTrend: Array<{ week: string; calls: number; avg_score: number }> = [];
    for (let i = 0; i < Math.ceil(days / 7); i++) {
      const weekStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekCoaching = coaching.filter((c: any) => {
        const d = new Date(c.created_at);
        return d >= weekStart && d < weekEnd;
      });
      weeklyTrend.push({
        week: weekStart.toISOString().split("T")[0],
        calls: weekCoaching.length,
        avg_score: weekCoaching.length > 0
          ? Math.round(weekCoaching.reduce((sum: number, c: any) => sum + (c.overall_score || 0), 0) / weekCoaching.length)
          : 0,
      });
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    if (avgTalkRatio < 45) strengths.push("Great listener - you let prospects talk");
    else if (avgTalkRatio > 70) weaknesses.push("Talking too much - aim for 40-50% rep talk ratio");
    if (avgDiscoveryScore > 70) strengths.push("Strong discovery skills");
    else if (avgDiscoveryScore < 50) weaknesses.push("Need deeper discovery questions (BANT/MEDDIC)");
    if (avgObjectionScore > 70) strengths.push("Excellent objection handling");
    else if (avgObjectionScore < 50) weaknesses.push("Practice objection handling techniques");

    return NextResponse.json({
      period,
      total_calls: deals?.length || 0,
      avg_talk_ratio: Math.round(avgTalkRatio),
      avg_discovery_score: Math.round(avgDiscoveryScore),
      avg_objection_score: Math.round(avgObjectionScore),
      avg_overall_score: Math.round(avgOverallScore),
      weekly_trend: weeklyTrend,
      strengths: strengths.length > 0 ? strengths : ["Keep recording calls to get personalized coaching"],
      weaknesses: weaknesses.length > 0 ? weaknesses : [],
      coaching_insights: coaching.slice(0, 5).map((c: any) => ({
        deal_id: c.deal_id,
        overall_score: c.overall_score,
        recommendations: c.coaching_recommendations,
        created_at: c.created_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch analytics", details: error.message }, { status: 500 });
  }
}
