import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

type FeedbackCategory = "bug" | "feature" | "other";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, category, email, page } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || null;

    // Save to Supabase
    const { error: dbError } = await supabase.from("feedback").insert({
      message,
      category: (category as FeedbackCategory) || "other",
      email: email || user?.email || null,
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
<b>Email:</b> ${email || user?.email || "anonymous"}
<b>User ID:</b> ${userId || "not logged in"}

<b>Message:</b>
${message}`;

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
      return NextResponse.json(
        { error: "Failed to send Telegram message" },
        { status: 500 }
      );
    }

    console.log("Telegram sent successfully");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Feedback route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
