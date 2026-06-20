import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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

  // Get first letter of email for avatar fallback
  const avatarLetter = user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 items-end">
              {[30, 50, 70, 90, 70, 50, 30].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full ${i === 3 ? 'bg-indigo-400' : 'bg-sky-400'}`}
                  style={{ height: h }}
                />
              ))}
            </div>
            <span className="text-xl font-bold">MeetScribe</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-3 hover:bg-slate-800 rounded-lg p-2 transition">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-sm font-bold">
                {avatarLetter}
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-4 border-b border-slate-700">
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
                <p className="text-xs text-slate-500 mt-1">Free Plan</p>
              </div>
              <div className="p-2">
                <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <form action={signOut}>
                  <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition text-left">
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
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Meetings</h1>
            <p className="text-slate-500 mt-1">{meetings?.length || 0} meetings processed</p>
          </div>
          <Link href="/new" className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Meeting
          </Link>
        </div>

        {meetings && meetings.length > 0 ? (
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meeting/${meeting.id}`}
                className="block bg-slate-800 p-6 rounded-xl hover:bg-slate-750 transition border border-slate-700 hover:border-slate-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{meeting.title}</h3>
                  <span className="text-slate-500 text-sm">
                    {new Date(meeting.created_at).toLocaleDateString()}
                  </span>
                </div>
                {meeting.summary && (
                  <p className="text-slate-400 text-sm line-clamp-2">{meeting.summary}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
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
          <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-slate-500 text-lg mb-4">No meetings yet</p>
            <Link href="/new" className="text-sky-400 hover:text-sky-300 font-semibold">
              Process your first meeting →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
