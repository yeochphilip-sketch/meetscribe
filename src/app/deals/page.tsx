import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Deals | SalesAI",
  description: "Your sales pipeline",
};

export default async function DealsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const isPro = profile?.plan === "pro" || profile?.plan === "team" || profile?.plan === "enterprise";

  const stages = ["discovery", "demo", "proposal", "negotiation", "closing"];
  const stageColors: Record<string, string> = {
    discovery: "border-blue-500/30 bg-blue-500/5",
    demo: "border-purple-500/30 bg-purple-500/5",
    proposal: "border-yellow-500/30 bg-yellow-500/5",
    negotiation: "border-orange-500/30 bg-orange-500/5",
    closing: "border-green-500/30 bg-green-500/5",
  };

  const dealsByStage = stages.reduce((acc: Record<string, any[]>, stage) => {
    acc[stage] = deals?.filter((d) => d.pipeline_stage === stage && d.status === "active") || [];
    return acc;
  }, {});

  const totalPipelineValue = deals?.reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0;
  const avgProbability = deals?.length
    ? Math.round(deals.reduce((sum, d) => sum + (d.close_probability || 0), 0) / deals.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Deals</h1>
            <p className="text-gray-400 mt-1">Pipeline value: <span className="text-green-400 font-semibold">${totalPipelineValue.toLocaleString()}</span> · Avg close probability: <span className="text-green-400 font-semibold">{avgProbability}%</span></p>
          </div>
          <div className="flex gap-3">
            <Link href="/deals/new" className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium">
              + New Deal
            </Link>
            {!isPro && (
              <Link href="/plan" className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>

        {/* Pipeline Board */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {stages.map((stage) => (
            <div key={stage} className={`rounded-xl border ${stageColors[stage]} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm capitalize text-gray-200">{stage}</h3>
                <span className="text-xs text-gray-500">{dealsByStage[stage].length} deals</span>
              </div>
              <div className="space-y-3">
                {dealsByStage[stage].map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="block p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-green-500/30 transition-colors">
                    <div className="font-medium text-sm text-white truncate">{deal.title}</div>
                    {deal.company_name && <div className="text-xs text-gray-400 mt-0.5">{deal.company_name}</div>}
                    <div className="flex items-center justify-between mt-2">
                      {deal.deal_value ? <span className="text-xs text-green-400">${deal.deal_value.toLocaleString()}</span> : <span className="text-xs text-gray-500">No value</span>}
                      {deal.close_probability ? <span className="text-xs text-gray-400">{deal.close_probability}%</span> : null}
                    </div>
                  </Link>
                ))}
                {dealsByStage[stage].length === 0 && (
                  <div className="text-xs text-gray-600 text-center py-4">No deals</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Deals Table */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700/50">
            <h2 className="text-lg font-semibold text-white">All Deals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50 text-gray-400">
                  <th className="px-6 py-3 text-left font-medium">Deal</th>
                  <th className="px-6 py-3 text-left font-medium">Company</th>
                  <th className="px-6 py-3 text-left font-medium">Stage</th>
                  <th className="px-6 py-3 text-left font-medium">Value</th>
                  <th className="px-6 py-3 text-left font-medium">Probability</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(deals || []).slice(0, 20).map((deal) => (
                  <tr key={deal.id} className="border-b border-gray-700/30 hover:bg-gray-800/80 transition-colors">
                    <td className="px-6 py-3">
                      <Link href={`/deals/${deal.id}`} className="font-medium text-white hover:text-green-400 transition-colors">
                        {deal.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-400">{deal.company_name || "-"}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300 capitalize">{deal.pipeline_stage}</span>
                    </td>
                    <td className="px-6 py-3 text-green-400">{deal.deal_value ? `$${deal.deal_value.toLocaleString()}` : "-"}</td>
                    <td className="px-6 py-3 text-gray-400">{deal.close_probability ? `${deal.close_probability}%` : "-"}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${deal.status === "won" ? "bg-green-500/20 text-green-400" : deal.status === "lost" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {deal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
