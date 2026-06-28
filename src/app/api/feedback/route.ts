import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ratelimit } from "@/lib/rate-limit";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

type FeedbackCategory = "bug" | "feature" | "other";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, category, email, page } = body;

    // Validate required fields
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { error: "Message is required and must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    const userEmail = email || user?.email || null;

    // Rate limit by IP for anonymous users, by user ID for logged in
    const limitKey = userId || req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await ratelimit.limit(`feedback_${limitKey}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please try again later." },
        { status: 429 }
      );
    }

    // Save to Supabase
    const { error: dbError } = await supabase.from("feedback").insert({
      message: message.trim(),
      category: (category as FeedbackCategory) || "other",
      email: userEmail,
      page: page || null,
      user_id: userId,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    console.log("DB insert success");

    const emojiMap: Record<string, string> = {
      bug: "🐛",
      feature: "✨",
      other: "💬",
    };
    const emoji = emojiMap[(category as string) || "other"] || "💬";

    const text = `${emoji} <b>New MeetScribe Feedback</b>

<b>Category:</b> ${category || "other"}
<b>Page:</b> ${page || "unknown"}
<b>Email:</b> ${userEmail || "anonymous"}
<b>User ID:</b> ${userId || "not logged in"}

<b>Message:</b>
${message.trim()}`;

    // Send to Telegram
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    if (!telegramRes.ok) {
      const errText = await telegramRes.text();
      console.error("Telegram error:", errText);
      // Don't fail the request if Telegram fails — feedback is already saved
    }

    console.log("Feedback processed successfully");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Feedback route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
