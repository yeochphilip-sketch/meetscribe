import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials not configured");
    return;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
    }
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, message, email, pageUrl, userAgent } = body;

    if (!message || typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Save to database
    const { error: dbError } = await supabase.from("feedback").insert({
      category: category || "other",
      message: message.trim(),
      email: email || null,
      page_url: pageUrl || null,
      user_agent: userAgent || null,
      user_id: user?.id || null,
    });

    if (dbError) {
      console.error("Feedback insert error:", dbError);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    // Send to Telegram
    const categoryEmoji = {
      bug: "🐛",
      feature: "✨",
      other: "💬",
    }[category || "other"];

    const telegramText = `
<b>${categoryEmoji} New MeetScribe Feedback</b>

<b>Category:</b> ${category || "other"}
<b>Message:</b> ${message.trim()}
${email ? `<b>Email:</b> ${email}` : ""}
${user?.email ? `<b>User:</b> ${user.email}` : ""}
<b>Page:</b> ${pageUrl || "N/A"}
<b>Time:</b> ${new Date().toLocaleString()}
    `.trim();

    await sendTelegramMessage(telegramText);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
