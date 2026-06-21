'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';
  const [showToast, setShowToast] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0 });
  const [plan, setPlan] = useState('free');
  const supabase = createClient();

  useEffect(() => {
    if (paymentSuccess) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess]);

  useEffect(() => {
    fetchMeetings();
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    
    if (profile?.plan) {
      setPlan(profile.plan);
    }
  };

  const fetchMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setMeetings(data || []);
    setStats({
      total: data?.length || 0,
      thisWeek: data?.filter(m => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(m.created_at) > weekAgo;
      }).length || 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Payment successful! Welcome to Pro.</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your meetings and insights</p>
          </div>
          <Link
            href="/new"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            + New Meeting
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Meetings</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">This Week</p>
            <p className="text-3xl font-bold mt-1">{stats.thisWeek}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Plan</p>
            <p className="text-3xl font-bold mt-1 capitalize">{plan}</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Recent Meetings</h2>
          </div>
          {meetings.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <p>No meetings yet. Create your first meeting to get started.</p>
              <Link href="/new" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                Create a meeting →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {meetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meeting/${meeting.id}`}
                  className="block px-6 py-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{meeting.title || 'Untitled Meeting'}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(meeting.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {meeting.status || 'Completed'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
