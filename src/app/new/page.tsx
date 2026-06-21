'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// In src/app/new/page.tsx
import VoiceRecorder from "@/components/VoiceRecorder";

export default function NewMeetingPage() {
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, transcript }),
      })

      if (!res.ok) throw new Error('Failed to process meeting')

      const data = await res.json()
      router.push(`/meeting/${data.id}`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
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
      </header>

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Process New Meeting</h1>
        <p className="text-slate-400 mb-8">Paste your meeting transcript and let AI do the rest.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              placeholder="e.g., Acme Corp - Discovery Call"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Meeting Transcript
            </label>
            <textarea
              placeholder="Paste your meeting transcript here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 h-80 resize-none"
              required
            />
            <p className="text-slate-500 text-sm mt-2">
              Tip: You can get transcripts from Zoom, Google Meet, Otter.ai, or any recording tool.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Generate Notes'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-slate-400 hover:text-white px-6 py-3 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      // ... existing code ...

      <div className="space-y-6">
        {/* Existing text input */}
        <textarea ... />

        {/* OR divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#0a0a0f] px-2 text-gray-500 text-sm">or</span>
          </div>
        </div>

        {/* Voice recording */}
        <VoiceRecorder
          onTranscriptionComplete={(transcript) => {
            setTranscript(transcript); // Your existing state
          }}
        />
      </div>

    </main>
  )
}
