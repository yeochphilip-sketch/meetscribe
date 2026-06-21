import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Validate file size (25MB max for Groq free tier, 100MB for dev tier)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    // Send to Groq Whisper API for transcription
    const groqFormData = new FormData();
    groqFormData.append("file", audioFile);
    groqFormData.append("model", "whisper-large-v3-turbo");
    groqFormData.append("response_format", "text");
    groqFormData.append("language", "en");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: groqFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq API error:", error);
      return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
    }

    const transcript = await response.text();

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}