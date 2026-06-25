import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("[AUTH CALLBACK] Code present:", !!code);
  console.log("[AUTH CALLBACK] Next path:", next);

  if (!code) {
    console.error("[AUTH CALLBACK] No code in URL");
    return NextResponse.redirect(
      `${origin}/login?error=no_code`
    );
  }

  // Determine where to redirect BEFORE the exchange
  // We need to create the response with the right redirect URL
  let redirectPath = next;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // We'll apply cookies after we know the final redirect URL
          // For now, just store them to apply later
          cookiesToSet.forEach(({ name, value, options }) => {
            // @ts-ignore - storing on the request for later use
            request._cookiesToSet = request._cookiesToSet || [];
            // @ts-ignore
            request._cookiesToSet.push({ name, value, options });
          });
        },
      },
    }
  );

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[AUTH CALLBACK] Exchange error:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    console.log("[AUTH CALLBACK] Exchange success! User:", data?.user?.email ?? "no email");

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", data.user!.id)
      .maybeSingle();

    if (!profile?.full_name) {
      redirectPath = "/onboarding";
    }

    // Now create the final response with the correct redirect
    const finalResponse = NextResponse.redirect(`${origin}${redirectPath}`);
    
    // Apply all cookies that were stored during exchange
    // @ts-ignore
    const cookiesToSet = request._cookiesToSet || [];
    cookiesToSet.forEach(({ name, value, options }: any) => {
      finalResponse.cookies.set(name, value, options);
    });

    return finalResponse;
  } catch (err: any) {
    console.error("[AUTH CALLBACK] Unexpected error:", err.message);
    return NextResponse.redirect(
      `${origin}/login?error=unexpected`
    );
  }
}
