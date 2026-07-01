import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import IntegrationsContent from "./IntegrationsContent";

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
    .select("provider, is_active, last_sync_at, config")
    .eq("user_id", user.id);

  const isAdmin = user.email === "yeochphilip@gmail.com";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Integrations</h1>
          <p className="text-gray-400 mt-1">Connect your sales stack for fully automated workflows</p>
        </div>
        <IntegrationsContent initialIntegrations={integrations || []} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
