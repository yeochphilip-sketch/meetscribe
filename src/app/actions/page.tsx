import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Actions | SalesAI",
  description: "Your unified action dashboard",
};

export default async function ActionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: actions } = await supabase
    .from("deal_actions")
    .select("*, deal:deals(id, title, company_name, contact_name)")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const actionIcons: Record<string, string> = {
    follow_up_email: "✉",
    crm_sync: "🔄",
    task_creation: "✓",
    calendar_suggestion: "📅",
    document_share: "📄",
    slack_notification: "💬",
  };

  const actionColors: Record<string, string> = {
    follow_up_email: "border-blue-500/30 bg-blue-500/5",
    crm_sync: "border-purple-500/30 bg-purple-500/5",
    task_creation: "border-green-500/30 bg-green-500/5",
    calendar_suggestion: "border-yellow-500/30 bg-yellow-500/5",
    document_share: "border-gray-500/30 bg-gray-500/5",
    slack_notification: "border-pink-500/30 bg-pink-500/5",
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Action Dashboard</h1>
            <p className="text-gray-400 mt-1">{actions?.length || 0} pending actions from your sales calls</p>
          </div>
          <Link href="/deals" className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
            View Deals
          </Link>
        </div>

        {actions && actions.length > 0 ? (
          <div className="space-y-4">
            {actions.map((action: any) => (
              <div key={action.id} className={`flex items-start gap-4 p-5 rounded-xl border ${actionColors[action.action_type] || "border-gray-700 bg-gray-800/50"}`}>
                <div className="text-2xl shrink-0">{actionIcons[action.action_type] || "•"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white">{action.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300 capitalize">
                      {action.action_type.replace("_", " ")}
                    </span>
                  </div>
                  {action.description && <p className="text-sm text-gray-400 mb-2">{action.description}</p>}
                  {action.deal && (
                    <Link href={`/deals/${action.deal.id}`} className="text-xs text-green-400 hover:text-green-300 transition-colors">
                      {action.deal.title} {action.deal.company_name && `· ${action.deal.company_name}`}
                    </Link>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors">
                    Execute
                  </button>
                  <button className="px-3 py-1.5 bg-gray-700 border border-gray-600 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800/50 border border-gray-700/50 rounded-xl">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-white mb-2">All caught up</h3>
            <p className="text-gray-400 text-sm">No pending actions. Record a sales call to generate new actions.</p>
            <Link href="/deals/new" className="inline-block mt-4 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium">
              Record New Call
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
