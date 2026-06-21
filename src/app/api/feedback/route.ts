import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram env vars missing");
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("Telegram failed:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, message, email, pageUrl, userAgent } = body;

    if (!message?.trim() || message.trim().length < 3) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("feedback").insert({
      category: category || "other",
      message: message.trim(),
      email: email || null,
      page_url: pageUrl || null,
      user_agent: userAgent || null,
      user_id: user?.id || null,
    });

    const emoji = { bug: "🐛", feature: "✨", other: "💬" }[category || "other"];
    const text = `${emoji} <b>New MeetScribe Feedback</b>

<b>Category:</b> ${category || "other"}
<b>Message:</b> ${message.trim()}
${email ? `<b>Email:</b> ${email}` : ""}
${user?.email ? `<b>User:</b> ${user.email}` : ""}
<b>Page:</b> ${pageUrl || "N/A"}
<b>Time:</b> ${new Date().toLocaleString()}`;

    await sendTelegramMessage(text);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
