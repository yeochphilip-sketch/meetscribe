import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/')

  const signIn = async () => {
    'use server'
    const supabase = await createClient()
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (data.url) redirect(data.url)
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-100 px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-50">
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
          <div className="flex items-center gap-6">
            <Link href="#pricing" className="text-slate-500 hover:text-slate-900 transition text-sm font-medium">Pricing</Link>
            <form action={signIn}>
              <button
                type="submit"
                className="bg-slate-900 text-white px-5 py-2 rounded-lg font-semibold hover:bg-slate-800 transition text-sm"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-slate-600 font-medium">Free for solo founders</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
          Turn meetings into<br />
          <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
            actionable notes
          </span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste your meeting transcript. Get AI-generated summaries, action items, and follow-up emails in seconds. Built for sales teams who close deals.
        </p>

        <form action={signIn} className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Get started free
          </button>
          <Link
            href="#demo"
            className="text-slate-600 hover:text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg transition border border-slate-200 hover:border-slate-300 flex items-center justify-center bg-white"
          >
            See live demo
          </Link>
        </form>

        <p className="text-slate-400 text-sm mt-4">No credit card required. 5 free meetings per month.</p>
      </section>

      {/* Live Demo */}
      <section id="demo" className="border-t border-slate-100 py-20 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">See it in action</h2>
            <p className="text-slate-500">Here's what MeetScribe generates from a real sales call</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm text-slate-400 ml-2 font-medium">Meeting Transcript</span>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-400 mb-2 font-semibold">Discovery Call - Acme Corp</p>
                <div className="text-slate-700 text-sm space-y-2 font-mono">
                  <p><span className="text-sky-600 font-semibold">John:</span> Hey Sarah, thanks for joining. Let's discuss Q3.</p>
                  <p><span className="text-indigo-600 font-semibold">Sarah:</span> Sure, let's prioritize the mobile app.</p>
                  <p><span className="text-sky-600 font-semibold">John:</span> What's the timeline looking like?</p>
                  <p><span className="text-indigo-600 font-semibold">Sarah:</span> Mockups by Friday, 3 weeks dev time.</p>
                  <p><span className="text-sky-600 font-semibold">John:</span> Can you prepare a pricing analysis?</p>
                  <p><span className="text-indigo-600 font-semibold">Sarah:</span> Will do. I'll send wireframes too.</p>
                  <p className="text-slate-400 italic">... (truncated for demo)</p>
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Summary
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Discussed Q3 roadmap, prioritized mobile app redesign with mockups due Friday, and requested pricing analysis for next meeting.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Action Items
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    Prepare pricing analysis by next meeting
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    Send mobile app wireframes
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    Have mockups ready by Friday
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Follow-Up Email
                </h3>
                <p className="text-slate-600 text-sm font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
                  Subject: Next Steps - Q3 Roadmap<br/><br/>
                  Hi Sarah,<br/><br/>
                  Thanks for the productive call today. Looking forward to reviewing the pricing analysis and mobile wireframes. Let's reconnect next Tuesday.<br/><br/>
                  Best,<br/>
                  John
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">How it works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Paste Transcript</h3>
              <p className="text-slate-500">Copy from Zoom, Google Meet, or Otter.ai and paste it in.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-sky-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">AI Generates Notes</h3>
              <p className="text-slate-500">Summary, action items, and follow-up email in seconds.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Close More Deals</h3>
              <p className="text-slate-500">Send follow-ups faster and never miss action items.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-100 py-20 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Simple pricing</h2>
          <p className="text-slate-500 mb-12">Start free, upgrade when you need more</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Free</h3>
              <p className="text-4xl font-bold mb-4 text-slate-900">$0</p>
              <p className="text-slate-500 mb-6">5 meetings per month</p>
              <ul className="text-left text-slate-600 space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI summary
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Action items
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Follow-up email
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  No exports
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  No CRM sync
                </li>
              </ul>
              <form action={signIn}>
                <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-lg font-semibold transition">
                  Get started free
                </button>
              </form>
            </div>

            {/* Pro */}
            <div className="bg-white p-8 rounded-xl border-2 border-indigo-500 relative shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Pro</h3>
              <p className="text-4xl font-bold mb-4 text-slate-900">$15<span className="text-lg text-slate-500">/mo</span></p>
              <p className="text-slate-500 mb-6">Unlimited meetings</p>
              <ul className="text-left text-slate-600 space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Free
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited meetings
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Export to PDF/Word
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  CRM integrations
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority AI speed
                </li>
              </ul>
              <form action={signIn}>
                <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-semibold transition">
                  Start Pro trial
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Ready to never miss a meeting moment?</h2>
          <p className="text-slate-500 mb-8">Join sales reps who save 30 minutes per meeting.</p>
          <form action={signIn}>
            <button
              type="submit"
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
            >
              Start for free →
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1 items-end">
              {[30, 50, 70, 90, 70, 50, 30].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full ${i === 3 ? 'bg-indigo-500' : 'bg-sky-500'}`}
                  style={{ height: h }}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-400">MeetScribe</span>
          </div>
          <p className="text-slate-400 text-sm">Built by a solo founder, for solo founders.</p>
        </div>
      </footer>
    </main>
  )
}
