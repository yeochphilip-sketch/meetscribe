import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("[AUTH CALLBACK] ========== START ==========");
  console.log("[AUTH CALLBACK] Full URL:", request.url);
  console.log("[AUTH CALLBACK] Code present:", !!code);
  console.log("[AUTH CALLBACK] Next path:", next);

  const allCookies = request.cookies.getAll();
  console.log("[AUTH CALLBACK] All cookies:", allCookies.map((c) => c.name));
  const verifierCookie = allCookies.find((c) =>
    c.name.includes("code-verifier")
  );
  console.log(
    "[AUTH CALLBACK] Verifier cookie found:",
    verifierCookie ? "YES" : "NO"
  );
  if (verifierCookie) {
    console.log(
      "[AUTH CALLBACK] Verifier cookie name:",
      verifierCookie.name,
      "length:",
      verifierCookie.value.length
    );
  }

  if (!code) {
    console.error("[AUTH CALLBACK] No code in URL");
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/auth-code-error?error=no_code`
    );
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[AUTH CALLBACK] Exchange error:", error.message);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
      );
    }

    console.log(
      "[AUTH CALLBACK] Session exchanged successfully, redirecting to:",
      next
    );
    console.log("[AUTH CALLBACK] ========== END ==========");
    return NextResponse.redirect(`${request.nextUrl.origin}${next}`);
  } catch (err: any) {
    console.error("[AUTH CALLBACK] Unexpected error:", err.message);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`
    );
  }
}
