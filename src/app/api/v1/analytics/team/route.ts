import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) return NextResponse.json({ error: "You are not part of a team" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const days = parseInt(period.replace("d", "")) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data: members } = await supabase
      .from("team_members")
      .select("user_id, role, profiles(full_name, email)")
      .eq("team_id", membership.team_id);

    const userIds = members?.map((m: any) => m.user_id) || [];

    const { data: deals } = await supabase
      .from("deals")
      .select("*")
      .in("user_id", userIds)
      .gte("created_at", startDate.toISOString());

    const { data: coachingData } = await supabase
      .from("deal_coaching")
      .select("*")
      .in("user_id", userIds)
      .gte("created_at", startDate.toISOString());

    const coaching = coachingData || [];

    const repStats = userIds.map((uid: string) => {
      const repDeals = deals?.filter((d: any) => d.user_id === uid) || [];
      const repCoaching = coaching.filter((c: any) => c.user_id === uid);
      const member = members?.find((m: any) => m.user_id === uid);
      return {
        user_id: uid,
        name: member?.profiles?.full_name || member?.profiles?.email || "Unknown",
        role: member?.role,
        calls: repDeals.length,
        deals_won: repDeals.filter((d: any) => d.status === "won").length,
        avg_score: repCoaching.length > 0
          ? Math.round(repCoaching.reduce((sum: number, c: any) => sum + (c.overall_score || 0), 0) / repCoaching.length)
          : 0,
        avg_talk_ratio: repCoaching.length > 0
          ? Math.round(repCoaching.reduce((sum: number, c: any) => sum + (c.rep_talk_ratio || 0), 0) / repCoaching.length)
          : 0,
      };
    }).sort((a: any, b: any) => b.avg_score - a.avg_score);

    const teamAvgScore = coaching.length > 0
      ? Math.round(coaching.reduce((sum: number, c: any) => sum + (c.overall_score || 0), 0) / coaching.length)
      : 0;

    return NextResponse.json({
      period,
      team_id: membership.team_id,
      total_calls: deals?.length || 0,
      team_avg_score: teamAvgScore,
      rep_stats: repStats,
      top_performer: repStats[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch team analytics", details: error.message }, { status: 500 });
  }
}
