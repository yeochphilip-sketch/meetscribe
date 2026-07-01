import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "yeochphilip@gmail.com";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = user.email === ADMIN_EMAIL;
    return NextResponse.json({ isAdmin, email: user.email });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
