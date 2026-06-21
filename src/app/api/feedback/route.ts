import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, message, email, pageUrl, userAgent } = body;

    if (!message || typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("feedback").insert({
      category: category || "other",
      message: message.trim(),
      email: email || null,
      page_url: pageUrl || null,
      user_agent: userAgent || null,
      user_id: user?.id || null,
    });

    if (error) {
      console.error("Feedback insert error:", error);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
