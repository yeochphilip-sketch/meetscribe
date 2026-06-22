"use client";

import { useState } from "react";
import { Mic, ArrowRight, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function NewMeetingPage() {
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !transcript) return;

    setIsProcessing(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeUrl) {
          setError(`${data.details || data.error} [Upgrade to Pro](/#pricing)`);
        } else {
          throw new Error(data.error || "Failed to process meeting");
        }
        return;
      }

      router.push(`/meeting/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscriptionComplete = (transcribedText: string) => {
    setTranscript(transcribedText);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">MeetScribe</span>
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">New Meeting</h1>
          <p className="text-gray-400">Process a meeting transcript to generate insights</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Meeting Title</label>
              <input
                type="text"
                placeholder="Q3 Sales Review with Acme Corp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Transcript</label>
              <textarea
                placeholder="Paste your meeting transcript here, or record audio below..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                required
                rows={8}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
              />
            </div>

            {/* Voice Recorder */}
            <div className="flex flex-col items-center py-4 border-t border-b border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Or record audio</p>
              <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !title || !transcript}
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-sm font-semibold text-white transition-all hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Insights
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
