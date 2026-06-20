import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan === 'pro'
  const planName = isPro ? 'Pro' : 'Free'

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const meetingCount = count || 0
  const freeLimit = 5
  const remainingMeetings = isPro ? 'Unlimited' : Math.max(0, freeLimit - meetingCount)
  const atLimit = !isPro && meetingCount >= freeLimit

  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  const avatarLetter = user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-100 px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1 items-end">
              {[30, 50, 70, 90, 70, 50, 30].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full ${i === 3 ? 'bg-indigo-500' : 'bg-sky-500'}`}
                  style={{ height: h }}
                />
              ))}
            </div>
            <span className="text-xl font-bold text-slate-900">MeetScribe</span>
          </div>

          <div className="flex items-center gap-4">
            {!isPro && (
              <Link
                href="/#pricing"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Upgrade to Pro
              </Link>
            )}
            {isPro && (
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">
                PRO
              </span>
            )}

            <div className="relative group">
              <button className="flex items-center gap-3 hover:bg-slate-50 rounded-lg p-2 transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-sm font-bold text-white">
                  {avatarLetter}
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{planName} Plan</p>
                  {!isPro && (
                    <p className="text-xs text-slate-500 mt-1">{remainingMeetings} meetings left</p>
                  )}
                </div>
                <div className="p-2">
                  <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                  <form action={signOut}>
                    <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-left">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Meetings</h1>
            <p className="text-slate-500 mt-1">{meetingCount} meetings this month</p>
          </div>
          <Link 
            href={atLimit ? '/#pricing' : '/new'} 
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              atLimit 
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {atLimit ? 'Upgrade to Pro' : 'New Meeting'}
          </Link>
        </div>

        {atLimit && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-indigo-600 font-semibold mb-2">You've reached your free limit</p>
            <p className="text-slate-500 text-sm mb-4">Upgrade to Pro for unlimited meetings</p>
            <Link
              href="/#pricing"
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Upgrade to Pro - $15/month
            </Link>
          </div>
        )}

        {!atLimit && !isPro && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
              <p className="text-sm text-slate-600">
                {remainingMeetings} free meetings remaining this month
              </p>
            </div>
            <Link href="/#pricing" className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">
              Upgrade →
            </Link>
          </div>
        )}

        {meetings && meetings.length > 0 ? (
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meeting/${meeting.id}`}
                className="block bg-white p-6 rounded-xl hover:bg-slate-50 transition border border-slate-200 hover:border-slate-300 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">{meeting.title}</h3>
                  <span className="text-slate-400 text-sm">
                    {new Date(meeting.created_at).toLocaleDateString()}
                  </span>
                </div>
                {meeting.summary && (
                  <p className="text-slate-500 text-sm line-clamp-2">{meeting.summary}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {(meeting.action_items || []).length} action items
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-slate-500 text-lg mb-4">No meetings yet</p>
            <Link href="/new" className="text-indigo-500 hover:text-indigo-600 font-semibold">
              Process your first meeting →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
