import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Integrations | SalesAI",
  description: "Connect your sales tools",
};

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: integrations } = await supabase
    .from("integrations")
    .select("provider, is_active, last_sync_at")
    .eq("user_id", user.id);

  const connected = new Set(integrations?.map((i) => i.provider) || []);

  const providers = [
    { id: "google_calendar", name: "Google Calendar", category: "Calendar", description: "Auto-detect sales meetings and prep briefs before calls", icon: "📅", color: "border-blue-500/30 bg-blue-500/5" },
    { id: "google_gmail", name: "Gmail", category: "Email", description: "Send AI-generated follow-up emails automatically", icon: "✉", color: "border-red-500/30 bg-red-500/5" },
    { id: "google_drive", name: "Google Drive", category: "Storage", description: "Store meeting recordings and generated documents", icon: "📁", color: "border-green-500/30 bg-green-500/5" },
    { id: "salesforce", name: "Salesforce", category: "CRM", description: "Sync deals, contacts, and tasks automatically", icon: "☁", color: "border-blue-400/30 bg-blue-400/5" },
    { id: "hubspot", name: "HubSpot", category: "CRM", description: "Sync deals, contacts, and engagements automatically", icon: "🟠", color: "border-orange-400/30 bg-orange-400/5" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Integrations</h1>
          <p className="text-gray-400 mt-1">Connect your sales stack for fully automated workflows</p>
        </div>

        <div className="space-y-4">
          {providers.map((provider) => {
            const isConnected = connected.has(provider.id);
            return (
              <div key={provider.id} className={`flex items-center gap-5 p-5 rounded-xl border ${provider.color} ${isConnected ? "border-green-500/30 bg-green-500/5" : ""}`}>
                <div className="text-3xl shrink-0">{provider.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{provider.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-400">{provider.category}</span>
                    {isConnected && <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">Connected</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{provider.description}</p>
                </div>
                <a
                  href={`/api/v1/integrations/${provider.id.replace("_", "/")}?action=connect`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${isConnected ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"}`}
                >
                  {isConnected ? "Manage" : "Connect"}
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-5 bg-gray-800/50 border border-gray-700/50 rounded-xl">
          <h3 className="font-semibold text-white mb-2">Why connect your tools?</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">→</span>Calendar sync detects meetings automatically — no manual entry</li>
            <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">→</span>CRM sync updates deal stages, notes, and tasks without copy-paste</li>
            <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">→</span>Email integration sends follow-ups in one click from your own address</li>
            <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">→</span>Drive storage keeps all recordings and transcripts organized</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
