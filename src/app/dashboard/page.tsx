"use client";

import { useState, useEffect } from "react";
import { Mic, Plus, Clock, FileText, ArrowRight, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Meeting {
  id: string;
  title: string;
  created_at: string;
  summary?: string;
}

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: meetingsData } = await supabase
        .from("meetings")
        .select("id, title, created_at, summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setMeetings(meetingsData || []);
      setLoading(false);
    };

    fetchData();

  // Save onboarding data after OAuth signup
  useEffect(() => {
    const saveOnboardingData = async () => {
      const stored = localStorage.getItem("onboarding_data");
      if (!stored) return;

      try {
        const data = JSON.parse(stored);
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Update user metadata
          await supabase.auth.updateUser({
            data: {
              full_name: data.name,
              company: data.company,
              role: data.role,
            },
          });

          // Clear localStorage after successful save
          localStorage.removeItem("onboarding_data");
        }
      } catch (err) {
        console.error("Failed to save onboarding data:", err);
      }
    };

    saveOnboardingData();
  }, []);
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">MeetScribe</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-gray-400">Manage your meetings and insights</p>
          </div>
          <Link
            href="/new"
            className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-xl hover:shadow-indigo-500/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="relative z-10">New Meeting</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-gray-400 text-sm">Total Meetings</span>
            </div>
            <p className="text-3xl font-bold text-white">{meetings.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">This Month</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {meetings.filter((m) => {
                const date = new Date(m.created_at);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Mic className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-gray-400 text-sm">Plan</span>
            </div>
            <p className="text-3xl font-bold text-white">Free</p>
          </div>
        </div>

        {/* Meetings List */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Meetings</h2>
            <span className="text-sm text-gray-500">{meetings.length} total</span>
          </div>

          {meetings.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No meetings yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Get started by processing your first meeting transcript.
              </p>
              <Link
                href="/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <Plus className="w-4 h-4" />
                Process your first meeting
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {meetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meeting/${meeting.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{meeting.title}</h3>
                    <p className="text-gray-500 text-sm truncate">
                      {meeting.summary ? meeting.summary.slice(0, 80) + "..." : "No summary yet"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gray-400 text-sm">{formatDate(meeting.created_at)}</p>
                    <p className="text-gray-600 text-xs">{formatTime(meeting.created_at)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
