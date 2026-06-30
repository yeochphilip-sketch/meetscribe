import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Deal Detail | SalesAI",
  description: "Sales intelligence and coaching insights",
};

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!deal) redirect("/deals");

  const [tRes, iRes, aRes, cRes] = await Promise.all([
    supabase.from("deal_transcripts").select("*").eq("deal_id", id).maybeSingle(),
    supabase.from("deal_intelligence").select("*").eq("deal_id", id).maybeSingle(),
    supabase.from("deal_actions").select("*").eq("deal_id", id).order("created_at", { ascending: true }),
    supabase.from("deal_coaching").select("*").eq("deal_id", id).maybeSingle(),
  ]);

  const transcript = tRes.data;
  const intelligence = iRes.data;
  const actions = aRes.data || [];
  const coaching = cRes.data;

  const sentimentColor: Record<string, string> = {
    very_positive: "text-green-400",
    positive: "text-green-300",
    neutral: "text-gray-400",
    negative: "text-orange-400",
    very_negative: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb + Header */}
        <div className="mb-6">
          <Link href="/deals" className="text-sm text-gray-400 hover:text-green-400 transition-colors">← Back to Deals</Link>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{deal.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                {deal.company_name && <span>{deal.company_name}</span>}
                {deal.contact_name && <span>· {deal.contact_name}</span>}
                {deal.deal_value && <span className="text-green-400">· ${deal.deal_value.toLocaleString()}</span>}
                <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 capitalize text-xs">{deal.pipeline_stage}</span>
              </div>
            </div>
            <div className="flex gap-3">
              {deal.close_probability && (
                <div className="text-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{deal.close_probability}%</div>
                  <div className="text-xs text-gray-500">Close Probability</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Intelligence */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Summary */}
            {intelligence?.deal_summary && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-3">Deal Summary</h2>
                <p className="text-gray-300 leading-relaxed">{intelligence.deal_summary}</p>
                {intelligence.sentiment && (
                  <div className={`mt-3 text-sm font-medium ${sentimentColor[intelligence.sentiment] || "text-gray-400"}`}>
                    Sentiment: {intelligence.sentiment.replace("_", " ")}
                  </div>
                )}
              </div>
            )}

            {/* Key Intelligence Grid */}
            {intelligence && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pain Points */}
                {intelligence.customer_pain_points?.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wide">Pain Points</h3>
                    <ul className="space-y-2">
                      {intelligence.customer_pain_points.map((p: string, i: number) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Buying Signals */}
                {intelligence.buying_signals?.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wide">Buying Signals</h3>
                    <ul className="space-y-2">
                      {intelligence.buying_signals.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">▲</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Objections */}
                {intelligence.objections?.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-orange-400 mb-3 uppercase tracking-wide">Objections</h3>
                    <ul className="space-y-2">
                      {intelligence.objections.map((o: string, i: number) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5">!</span>{o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Factors */}
                {intelligence.risk_factors?.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">Risk Factors</h3>
                    <ul className="space-y-2">
                      {intelligence.risk_factors.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">⚠</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Decision Makers */}
                {intelligence.decision_makers?.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 md:col-span-2">
                    <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">Decision Makers</h3>
                    <div className="flex flex-wrap gap-3">
                      {intelligence.decision_makers.map((dm: any, i: number) => (
                        <div key={i} className="px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600/50">
                          <div className="text-sm font-medium text-white">{dm.name}</div>
                          <div className="text-xs text-gray-400">{dm.role}</div>
                          <div className="text-xs text-blue-400 capitalize mt-0.5">{dm.influence_level}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {intelligence.next_steps?.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 md:col-span-2">
                    <h3 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wide">Next Steps</h3>
                    <ol className="space-y-2">
                      {intelligence.next_steps.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 font-mono text-xs mt-0.5">{i + 1}.</span>{s}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Transcript */}
            {transcript?.full_transcript && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-3">Transcript</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(transcript.segments || []).map((seg: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-xs text-gray-500 font-mono shrink-0 w-16 text-right">[{Math.round(seg.start)}s]</span>
                      <div>
                        <span className="text-xs font-medium text-green-400 uppercase">{seg.speaker}</span>
                        <p className="text-sm text-gray-300 mt-0.5">{seg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions + Coaching */}
          <div className="space-y-6">
            {/* Actions */}
            {actions.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
                <div className="space-y-3">
                  {actions.map((action: any) => (
                    <div key={action.id} className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400 uppercase">{action.action_type.replace("_", " ")}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${action.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : action.status === "executed" ? "bg-green-500/20 text-green-400" : "bg-gray-600/30 text-gray-400"}`}>
                          {action.status}
                        </span>
                      </div>
                      <p className="text-sm text-white mt-1">{action.title}</p>
                      {action.description && <p className="text-xs text-gray-400 mt-1">{action.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coaching Scorecard */}
            {coaching && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4">Coaching</h2>
                {coaching.overall_score && (
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-400">{coaching.overall_score}</div>
                    <div className="text-xs text-gray-500">Overall Score</div>
                  </div>
                )}
                <div className="space-y-3">
                  {coaching.rep_talk_ratio !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Talk Ratio (Rep)</span>
                      <span className="text-white font-medium">{coaching.rep_talk_ratio}%</span>
                    </div>
                  )}
                  {coaching.discovery_depth_score !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Discovery Depth</span>
                      <span className="text-white font-medium">{coaching.discovery_depth_score}/100</span>
                    </div>
                  )}
                  {coaching.objection_handling_score !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Objection Handling</span>
                      <span className="text-white font-medium">{coaching.objection_handling_score}/100</span>
                    </div>
                  )}
                  {coaching.interruption_count > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Interruptions</span>
                      <span className="text-orange-400 font-medium">{coaching.interruption_count}</span>
                    </div>
                  )}
                  {coaching.filler_word_count > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Filler Words</span>
                      <span className="text-orange-400 font-medium">{coaching.filler_word_count}</span>
                    </div>
                  )}
                </div>
                {coaching.coaching_recommendations?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <h3 className="text-xs font-semibold text-green-400 mb-2 uppercase">Recommendations</h3>
                    <ul className="space-y-1.5">
                      {coaching.coaching_recommendations.map((r: string, i: number) => (
                        <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">→</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Budget & Timeline */}
            {intelligence && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3">Deal Health</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Budget Confirmed</span>
                    <span className={intelligence.budget_confirmed ? "text-green-400" : "text-gray-500"}>
                      {intelligence.budget_confirmed ? "Yes" : "No"}
                    </span>
                  </div>
                  {intelligence.budget_amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Budget</span>
                      <span className="text-green-400">${intelligence.budget_amount.toLocaleString()}</span>
                    </div>
                  )}
                  {intelligence.buying_timeline && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timeline</span>
                      <span className="text-white">{intelligence.buying_timeline}</span>
                    </div>
                  )}
                  {intelligence.meeting_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Meeting Type</span>
                      <span className="text-gray-300 capitalize">{intelligence.meeting_type.replace("_", " ")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
