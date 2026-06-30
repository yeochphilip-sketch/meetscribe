import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ratelimit } from "@/lib/rate-limit";

const GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { success } = await ratelimit.limit(user.id);
    if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const dealId = (formData.get("deal_id") as string) || null;

    if (!audioFile) return NextResponse.json({ error: "No audio file provided" }, { status: 400 });

    const maxSize = 25 * 1024 * 1024;
    if (audioFile.size > maxSize) return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });

    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg", "audio/mp4", "audio/m4a", "audio/flac"];
    if (!allowedTypes.includes(audioFile.type)) return NextResponse.json({ error: `Unsupported file type: ${audioFile.type}` }, { status: 400 });

    const groqFormData = new FormData();
    groqFormData.append("file", audioFile);
    groqFormData.append("model", "whisper-large-v3");
    groqFormData.append("response_format", "verbose_json");
    groqFormData.append("language", "en");
    groqFormData.append("timestamp_granularities[]", "segment");

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: groqFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      if (response.status === 429) return NextResponse.json({ error: "Transcription service is busy. Please try again." }, { status: 429 });
      if (response.status === 413) return NextResponse.json({ error: "Audio file too large for processing." }, { status: 413 });
      return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 500 });
    }

    const result = await response.json();
    const segments = result.segments?.map((seg: any, index: number) => ({
      speaker: `Speaker ${(index % 2) + 1}`,
      text: seg.text.trim(),
      start: seg.start,
      end: seg.end,
      confidence: seg.avg_logprob || 0,
    })) || [];

    const fullTranscript = result.text || "";
    const duration = result.duration || 0;

    if (dealId) {
      await supabase.from("deal_transcripts").insert({
        deal_id: dealId,
        user_id: user.id,
        full_transcript: fullTranscript,
        segments,
        speakers: [...new Set(segments.map((s: any) => s.speaker))],
        duration_seconds: Math.round(duration),
        language: result.language || "en",
        transcription_model: "whisper-large-v3",
        processing_status: "completed",
      });
    }

    return NextResponse.json({
      transcript: fullTranscript,
      segments,
      speakers: [...new Set(segments.map((s: any) => s.speaker))],
      duration: Math.round(duration),
      language: result.language || "en",
      deal_id: dealId,
    }, {
      headers: { "Cache-Control": "private, max-age=3600" },
    });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
