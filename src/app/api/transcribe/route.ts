import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ratelimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Auth check — prevent abuse
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit check
    const { success, limit, remaining, reset } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", limit, remaining, reset },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg", "audio/mp4", "audio/m4a"];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${audioFile.type}. Please upload MP3, WAV, WEBM, OGG, or M4A.` },
        { status: 400 }
      );
    }

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
      const errorText = await response.text();
      console.error("Groq API error:", errorText);

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Transcription service is busy. Please try again in a moment." },
          { status: 429 }
        );
      }

      if (response.status === 413) {
        return NextResponse.json(
          { error: "Audio file too large for processing." },
          { status: 413 }
        );
      }

      return NextResponse.json(
        { error: "Transcription failed. Please try again." },
        { status: 500 }
      );
    }

    const transcript = await response.text();

    return NextResponse.json(
      { transcript },
      {
        headers: {
          "Cache-Control": "private, max-age=3600",
        },
      }
    );
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
