"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "New Deal | SalesAI",
  description: "Record or upload a sales call",
};

export default function NewDealPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"record" | "upload" | "calendar">("upload");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        handleUpload(blob, "recording.webm");
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (err) {
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleUpload(file, file.name);
  };

  const handleUpload = async (blob: Blob, filename: string) => {
    if (!title.trim()) {
      alert("Please enter a deal title");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create deal
      const dealRes = await fetch("/api/v1/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company_name: companyName || null,
          contact_name: contactName || null,
          deal_value: dealValue ? parseFloat(dealValue) : null,
          source: activeTab === "record" ? "recording" : "upload",
        }),
      });

      const dealData = await dealRes.json();
      if (!dealRes.ok) throw new Error(dealData.error);

      const dealId = dealData.deal.id;

      // 2. Upload audio for transcription
      const formData = new FormData();
      formData.append("audio", blob, filename);
      formData.append("deal_id", dealId);

      const transcribeRes = await fetch("/api/v1/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeData = await transcribeRes.json();
      if (!transcribeRes.ok) throw new Error(transcribeData.error);

      // 3. Process with AI
      const processRes = await fetch("/api/v1/deals/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: dealId,
          title,
          transcript: transcribeData.transcript,
          segments: transcribeData.segments,
          company_name: companyName,
          contact_name: contactName,
          deal_value: dealValue ? parseFloat(dealValue) : null,
          pipeline_stage: "discovery",
        }),
      });

      const processData = await processRes.json();
      if (!processRes.ok) throw new Error(processData.error);

      router.push(`/deals/${dealId}`);
    } catch (err: any) {
      alert("Error: " + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/deals" className="text-sm text-gray-400 hover:text-green-400 transition-colors">← Back to Deals</Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">New Deal</h1>
        <p className="text-gray-400 mb-8">Record or upload a sales call to generate intelligence</p>

        {/* Deal Info */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Deal Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Acme Corp - Enterprise License"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Primary contact"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Deal Value ($)</label>
            <input
              type="number"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              placeholder="25000"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "upload", label: "Upload Audio", icon: "📁" },
            { id: "record", label: "Record Call", icon: "🎙" },
            { id: "calendar", label: "From Calendar", icon: "📅" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-green-500/20 border border-green-500/30 text-green-400" : "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700"}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-green-500/50 transition-colors cursor-pointer"
          >
            <div className="text-4xl mb-3">📁</div>
            <h3 className="font-semibold text-white mb-1">Click to upload audio</h3>
            <p className="text-sm text-gray-500">MP3, WAV, M4A, WEBM up to 25MB</p>
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
          </div>
        )}

        {/* Record Tab */}
        {activeTab === "record" && (
          <div className="border border-gray-700 rounded-xl p-12 text-center">
            {!isRecording ? (
              <>
                <div className="text-4xl mb-3">🎙</div>
                <button
                  onClick={startRecording}
                  className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
                >
                  Start Recording
                </button>
                <p className="text-sm text-gray-500 mt-3">Record your browser audio during a call</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3 animate-pulse">🔴</div>
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Stop Recording
                </button>
                <p className="text-sm text-gray-500 mt-3">Recording in progress...</p>
              </>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="border border-gray-700 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-semibold text-white mb-2">Connect Google Calendar</h3>
            <p className="text-sm text-gray-500 mb-4">Automatically import sales meetings from your calendar</p>
            <a
              href="/api/v1/integrations/google/calendar?action=connect"
              className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
            >
              Connect Calendar
            </a>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-spin">⚙</div>
              <h3 className="text-lg font-semibold text-white mb-2">Processing your call...</h3>
              <p className="text-sm text-gray-400">Transcribing → Analyzing → Generating actions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
