"use client";

import { useState } from "react";

interface Integration {
  provider: string;
  is_active: boolean;
  last_sync_at: string | null;
  config: any;
}

interface Props {
  initialIntegrations: Integration[];
  isAdmin: boolean;
}

const providers = [
  { id: "google_calendar", name: "Google Calendar", category: "Calendar", description: "Auto-detect sales meetings and prep briefs before calls", icon: "📅", color: "border-blue-500/30 bg-blue-500/5" },
  { id: "google_gmail", name: "Gmail", category: "Email", description: "Send AI-generated follow-up emails automatically", icon: "✉", color: "border-red-500/30 bg-red-500/5" },
  { id: "google_drive", name: "Google Drive", category: "Storage", description: "Store meeting recordings and generated documents", icon: "📁", color: "border-green-500/30 bg-green-500/5" },
  { id: "salesforce", name: "Salesforce", category: "CRM", description: "Sync deals, contacts, and tasks automatically", icon: "☁", color: "border-blue-400/30 bg-blue-400/5" },
  { id: "hubspot", name: "HubSpot", category: "CRM", description: "Sync deals, contacts, and engagements automatically", icon: "🟠", color: "border-orange-400/30 bg-orange-400/5" },
];

export default function IntegrationsContent({ initialIntegrations, isAdmin }: Props) {
  const [integrations, setIntegrations] = useState<Record<string, Integration>>(() => {
    const map: Record<string, Integration> = {};
    initialIntegrations.forEach((i) => { map[i.provider] = i; });
    return map;
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [useRealOAuth, setUseRealOAuth] = useState<Record<string, boolean>>({});

  const isConnected = (id: string) => !!integrations[id]?.is_active;
  const isDemo = (id: string) => {
    const token = integrations[id]?.access_token;
    return token === "demo_token" || token === "demo";
  };

  const handleConnect = async (providerId: string) => {
    setLoading(providerId);

    const realMode = isAdmin && useRealOAuth[providerId];

    if (!realMode) {
      // Demo mode
      try {
        const res = await fetch("/api/v1/integrations/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: providerId }),
        });
        const data = await res.json();
        if (data.success) {
          setIntegrations((prev) => ({
            ...prev,
            [providerId]: {
              provider: providerId,
              is_active: true,
              last_sync_at: new Date().toISOString(),
              config: {},
              access_token: "demo_token",
            } as Integration,
          }));
        }
      } catch (err) {
        console.error("Demo connect error:", err);
      }
    } else {
      // Real OAuth mode
      try {
        const path = providerId.replace("_", "/");
        const res = await fetch(`/api/v1/integrations/${path}?action=connect`);
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (err) {
        console.error("OAuth connect error:", err);
      }
    }

    setLoading(null);
  };

  const handleDisconnect = async (providerId: string) => {
    setLoading(providerId);
    try {
      const res = await fetch("/api/v1/integrations/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId, action: "disconnect" }),
      });
      if (res.ok) {
        setIntegrations((prev) => {
          const next = { ...prev };
          delete next[providerId];
          return next;
        });
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-sm font-medium">Admin Mode</span>
          </div>
          <p className="text-gray-400 text-sm mb-3">Toggle real OAuth for each integration. Regular users always see demo mode.</p>
        </div>
      )}

      {providers.map((provider) => {
        const connected = isConnected(provider.id);
        const demo = isDemo(provider.id);

        return (
          <div key={provider.id} className={`flex items-center gap-5 p-5 rounded-xl border ${provider.color} ${connected ? "border-green-500/30 bg-green-500/5" : ""}`}>
            <div className="text-3xl shrink-0">{provider.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white">{provider.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-400">{provider.category}</span>
                {connected && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${demo ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                    {demo ? "Demo" : "Connected"}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{provider.description}</p>
              {demo && (
                <p className="text-xs text-yellow-500/70 mt-1">Demo mode — no real data sync</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && (
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer mr-2">
                  <input
                    type="checkbox"
                    checked={!!useRealOAuth[provider.id]}
                    onChange={(e) => setUseRealOAuth((prev) => ({ ...prev, [provider.id]: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500/20"
                  />
                  Live
                </label>
              )}

              {connected ? (
                <button
                  onClick={() => handleDisconnect(provider.id)}
                  disabled={loading === provider.id}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {loading === provider.id ? "..." : "Disconnect"}
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(provider.id)}
                  disabled={loading === provider.id}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  {loading === provider.id ? "Connecting..." : isAdmin && useRealOAuth[provider.id] ? "Connect (Live)" : "Connect"}
                </button>
              )}
            </div>
          </div>
        );
      })}

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
  );
}
