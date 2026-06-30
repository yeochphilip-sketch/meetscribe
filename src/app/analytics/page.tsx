import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Analytics | SalesAI",
  description: "Sales performance and coaching analytics",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: coaching } = await supabase
    .from("deal_coaching")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id);

  const avgScore = coaching?.length
    ? Math.round(coaching.reduce((sum, c) => sum + (c.overall_score || 0), 0) / coaching.length)
    : 0;
  const avgTalkRatio = coaching?.length
    ? Math.round(coaching.reduce((sum, c) => sum + (c.rep_talk_ratio || 0), 0) / coaching.length)
    : 0;
  const avgDiscovery = coaching?.length
    ? Math.round(coaching.reduce((sum, c) => sum + (c.discovery_depth_score || 0), 0) / coaching.length)
    : 0;
  const avgObjection = coaching?.length
    ? Math.round(coaching.reduce((sum, c) => sum + (c.objection_handling_score || 0), 0) / coaching.length)
    : 0;

  const totalCalls = deals?.length || 0;
  const wonDeals = deals?.filter((d) => d.status === "won").length || 0;
  const winRate = totalCalls > 0 ? Math.round((wonDeals / totalCalls) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Sales Analytics</h1>
          <p className="text-gray-400 mt-1">Track your performance and improve with AI coaching</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-green-400">{avgScore || "-"}</div>
            <div className="text-xs text-gray-500 mt-1">Avg Coaching Score</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-blue-400">{avgTalkRatio || "-"}%</div>
            <div className="text-xs text-gray-500 mt-1">Avg Talk Ratio</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-purple-400">{avgDiscovery || "-"}</div>
            <div className="text-xs text-gray-500 mt-1">Discovery Score</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-orange-400">{winRate}%</div>
            <div className="text-xs text-gray-500 mt-1">Win Rate</div>
          </div>
        </div>

        {/* Recent Calls Table */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700/50">
            <h2 className="text-lg font-semibold text-white">Recent Call Coaching</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50 text-gray-400">
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3 text-left font-medium">Score</th>
                  <th className="px-6 py-3 text-left font-medium">Talk Ratio</th>
                  <th className="px-6 py-3 text-left font-medium">Discovery</th>
                  <th className="px-6 py-3 text-left font-medium">Objections</th>
                  <th className="px-6 py-3 text-left font-medium">Filler Words</th>
                  <th className="px-6 py-3 text-left font-medium">Key Insight</th>
                </tr>
              </thead>
              <tbody>
                {(coaching || []).map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-700/30 hover:bg-gray-800/80 transition-colors">
                    <td className="px-6 py-3 text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <span className={`font-bold ${(c.overall_score || 0) >= 70 ? "text-green-400" : (c.overall_score || 0) >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {c.overall_score || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-300">{c.rep_talk_ratio ? `${c.rep_talk_ratio}%` : "-"}</td>
                    <td className="px-6 py-3 text-gray-300">{c.discovery_depth_score || "-"}</td>
                    <td className="px-6 py-3 text-gray-300">{c.objection_handling_score || "-"}</td>
                    <td className="px-6 py-3 text-gray-300">{c.filler_word_count || 0}</td>
                    <td className="px-6 py-3 text-gray-400 max-w-xs truncate">
                      {c.coaching_recommendations?.[0] || "-"}
                    </td>
                  </tr>
                ))}
                {(!coaching || coaching.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                      No coaching data yet. Process a sales call to see your analytics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
