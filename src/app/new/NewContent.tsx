'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function NewContent() {
  const router = useRouter();
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const supabase = createClient();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await uploadAndTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadAndTranscribe = async (audioBlob: Blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.transcript) {
      setTranscript(data.transcript);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        title: title || 'Untitled Meeting',
        transcript,
        status: 'processing',
      })
      .select()
      .single();

    if (error) {
      alert('Failed to create meeting');
      setLoading(false);
      return;
    }

    router.push(`/meeting/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">New Meeting</h1>
            <p className="text-gray-400 mt-1">Paste a transcript or record audio</p>
          </div>
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            ← Back to dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q3 Sales Review - Acme Corp"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Transcript</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {isRecording ? '⏹ Stop Recording' : '🎤 Record Audio'}
                </button>
              </div>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={12}
              placeholder="Paste your meeting transcript here, or click Record Audio to transcribe automatically..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {transcript.length} characters
            </p>
            <button
              type="submit"
              disabled={loading || !transcript.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
            >
              {loading ? 'Processing...' : 'Generate Notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
