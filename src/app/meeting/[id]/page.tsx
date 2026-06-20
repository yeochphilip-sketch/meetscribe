import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: meeting } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!meeting) notFound()

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
          <Link href="/" className="text-slate-400 hover:text-white transition">
            ← Back to meetings
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{meeting.title}</h1>
          <p className="text-slate-500">
            {new Date(meeting.created_at).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        <div className="space-y-6">
          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-sky-400 mb-3">Summary</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{meeting.summary}</p>
          </section>

          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-sky-400 mb-3">Action Items</h2>
            {meeting.action_items && meeting.action_items.length > 0 ? (
              <ul className="space-y-2">
                {meeting.action_items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <span className="bg-sky-500/20 text-sky-400 text-xs font-bold px-2 py-1 rounded mt-0.5">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No action items found.</p>
            )}
          </section>

          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-sky-400 mb-3">Follow-Up Email</h2>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">{meeting.follow_up_email}</pre>
            </div>
          </section>

          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-400 mb-3">Original Transcript</h2>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 max-h-64 overflow-y-auto">
              <pre className="text-slate-500 text-sm whitespace-pre-wrap font-sans">{meeting.transcript}</pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
