import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log("=== FEEDBACK API LOADED ===");
console.log("TELEGRAM_BOT_TOKEN present:", !!TELEGRAM_BOT_TOKEN);
console.log("TELEGRAM_CHAT_ID present:", !!TELEGRAM_CHAT_ID);
console.log("TELEGRAM_BOT_TOKEN length:", TELEGRAM_BOT_TOKEN?.length || 0);

async function sendTelegramMessage(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram env vars missing - cannot send");
    return { ok: false, error: "Missing env vars" };
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
    
    const data = await response.json();
    console.log("Telegram API response:", JSON.stringify(data));
    
    if (!response.ok) {
      console.error("Telegram API error:", data);
      return { ok: false, error: data };
    }
    
    return { ok: true, data };
  } catch (err) {
    console.error("Telegram fetch failed:", err);
    return { ok: false, error: err };
  }
}

export async function POST(request: NextRequest) {
  console.log("=== FEEDBACK POST CALLED ===");
  
  try {
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body));
    
    const { category, message, email, pageUrl, userAgent } = body;

    if (!message?.trim() || message.trim().length < 3) {
      console.log("Validation failed: message too short");
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log("User:", user?.email || "anonymous");

    const { error: dbError } = await supabase.from("feedback").insert({
      category: category || "other",
      message: message.trim(),
      email: email || null,
      page_url: pageUrl || null,
      user_agent: userAgent || null,
      user_id: user?.id || null,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ error: "DB failed" }, { status: 500 });
    }
    console.log("DB insert success");

    const emoji = { bug: "🐛", feature: "✨", other: "💬" }[category || "other"];
    const text = `${emoji} <b>New MeetScribe Feedback</b>

<b>Category:</b> ${category || "other"}
<b>Message:</b> ${message.trim()}
${email ? `<b>Email:</b> ${email}` : ""}
${user?.email ? `<b>User:</b> ${user.email}` : ""}
<b>Page:</b> ${pageUrl || "N/A"}
<b>Time:</b> ${new Date().toLocaleString()}`;

    console.log("Sending Telegram message...");
    const telegramResult = await sendTelegramMessage(text);
    console.log("Telegram result:", JSON.stringify(telegramResult));

    return NextResponse.json({ success: true, telegram: telegramResult });
  } catch (err) {
    console.error("API crash:", err);
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}
