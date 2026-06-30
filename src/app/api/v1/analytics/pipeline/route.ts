import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: deals } = await supabase
      .from("deals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    const { data: stages } = await supabase
      .from("pipeline_stages")
      .select("*")
      .or(`user_id.eq.${user.id},team_id.in.(select team_id from team_members where user_id = ${user.id})`)
      .order("order_index", { ascending: true });

    const defaultStages = [
      { name: "discovery", probability: 10 },
      { name: "demo", probability: 30 },
      { name: "proposal", probability: 50 },
      { name: "negotiation", probability: 70 },
      { name: "closing", probability: 90 },
    ];

    const activeStages = stages && stages.length > 0
      ? stages.map((s: any) => ({ name: s.name, probability: s.probability }))
      : defaultStages;

    const pipelineHealth = activeStages.map((stage: any) => {
      const stageDeals = deals?.filter((d: any) => d.pipeline_stage === stage.name) || [];
      const stageValue = stageDeals.reduce((sum: number, d: any) => sum + (d.deal_value || 0), 0);
      const avgProbability = stageDeals.length > 0
        ? Math.round(stageDeals.reduce((sum: number, d: any) => sum + (d.close_probability || stage.probability), 0) / stageDeals.length)
        : stage.probability;
      return {
        stage: stage.name,
        count: stageDeals.length,
        value: stageValue,
        avg_probability: avgProbability,
        weighted_value: Math.round(stageValue * (avgProbability / 100)),
      };
    });

    const totalPipelineValue = pipelineHealth.reduce((sum: number, s: any) => sum + s.value, 0);
    const totalWeightedValue = pipelineHealth.reduce((sum: number, s: any) => sum + s.weighted_value, 0);
    const totalDeals = deals?.length || 0;

    return NextResponse.json({
      total_pipeline_value: totalPipelineValue,
      total_weighted_value: totalWeightedValue,
      total_deals: totalDeals,
      avg_deal_size: totalDeals > 0 ? Math.round(totalPipelineValue / totalDeals) : 0,
      pipeline_health: pipelineHealth,
      velocity: activeStages.map((stage: any) => ({ stage: stage.name, avg_days: 0 })),
      conversion_funnel: activeStages.map((stage: any, index: number) => ({
        stage: stage.name,
        deals: pipelineHealth[index]?.count || 0,
        conversion_rate: index > 0 && pipelineHealth[index - 1]?.count > 0
          ? Math.round(((pipelineHealth[index]?.count || 0) / pipelineHealth[index - 1].count) * 100)
          : 100,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch pipeline analytics", details: error.message }, { status: 500 });
  }
}
