'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentSuccess = searchParams.get('payment') === 'success';
  const [showToast, setShowToast] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0 });
  const [plan, setPlan] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const initRef = useRef(false);

  useEffect(() => {
    if (paymentSuccess) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess]);

  const fetchPlan = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile query error:', error);
        // Don't show error to user for plan fetch - just default to free
        setPlan('free');
        return;
      }

      setPlan(profile?.plan || 'free');
    } catch (err) {
      console.error('Failed to fetch plan:', err);
      setPlan('free');
    }
  }, [supabase]);

  const fetchMeetings = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Meetings query error:', error);
        return;
      }

      setMeetings(data || []);
      setStats({
        total: data?.length || 0,
        thisWeek: data?.filter((m) => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(m.created_at) > weekAgo;
        }).length || 0,
      });
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
    }
  }, [supabase]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    let mounted = true;
    
    const init = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setError('Authentication error. Please sign in again.');
            setLoading(false);
          }
          return;
        }

        if (!session?.user) {
          if (mounted) {
            setLoading(false);
            setError('Please sign in to view your dashboard.');
          }
          return;
        }

        if (!mounted) return;
        
        const currentUser = session.user;
        setUser(currentUser);
        setLoading(false);
        
        // Load plan and meetings in parallel
        await Promise.all([
          fetchPlan(currentUser.id),
          fetchMeetings(currentUser.id),
        ]);
      } catch (err) {
        console.error('Dashboard init error:', err);
        if (mounted) {
          setError('Something went wrong. Please refresh the page.');
          setLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchPlan(session.user.id);
          fetchMeetings(session.user.id);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchPlan, fetchMeetings]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/';
    }
  };

  const getAvatarUrl = () => {
    return user?.user_metadata?.picture || user?.user_metadata?.avatar_url || null;
  };

  const getInitials = () => {
    const name = getDisplayName();
    if (!name || name === 'User') return '?';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = () => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.user_name ||
      user?.email ||
      'User'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-300 mb-4">{error}</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to view your dashboard</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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

          <div className="flex items-center gap-3">
            <Link
              href="/plan"
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all border border-gray-700 text-sm"
            >
              Plan: {plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free'}
            </Link>
            <Link
              href="/new"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-all"
            >
              + New Meeting
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all focus:outline-none focus:border-blue-500"
              >
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                    {getInitials()}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-semibold truncate">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Meetings</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">This Week</p>
            <p className="text-3xl font-bold">{stats.thisWeek}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Plan</p>
            <p className="text-3xl font-bold">{plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free'}</p>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Meetings</h2>
            <Link href="/new" className="text-blue-400 hover:text-blue-300 text-sm">
              + New Meeting
            </Link>
          </div>
          
          {meetings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-400 mb-2">No meetings yet</p>
              <p className="text-gray-500 text-sm mb-4">Upload your first meeting recording to get started</p>
              <Link href="/new" className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg inline-block">
                Upload Meeting
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{meeting.title || 'Untitled Meeting'}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {meeting.created_at ? new Date(meeting.created_at).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      meeting.status === 'completed' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {meeting.status || 'Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
