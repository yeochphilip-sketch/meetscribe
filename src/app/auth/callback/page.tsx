"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const next = searchParams.get("next") ?? "/dashboard";

      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true,
              flowType: "pkce",
              storage: typeof window !== "undefined" ? window.localStorage : undefined,
            },
          }
        );

        // detectSessionInUrl should automatically exchange the code
        // when the page loads with ?code= in the URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[AUTH CALLBACK] Session error:", error.message);
          router.push(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
          return;
        }

        if (session) {
          console.log("[AUTH CALLBACK] Session established, redirecting to:", next);
          router.push(next);
          router.refresh();
          return;
        }

        // If no session yet, try direct exchange
        const code = searchParams.get("code");
        if (code) {
          console.log("[AUTH CALLBACK] Trying direct exchange with code");
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("[AUTH CALLBACK] Exchange error:", exchangeError.message);
            router.push(`/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message)}`);
            return;
          }
          
          if (exchangeData?.session) {
            console.log("[AUTH CALLBACK] Exchange succeeded, redirecting to:", next);
            router.push(next);
            router.refresh();
            return;
          }
        }

        console.error("[AUTH CALLBACK] No session after all attempts");
        router.push("/auth/auth-code-error?error=no_session");
      } catch (err: any) {
        console.error("[AUTH CALLBACK] Unexpected error:", err.message);
        router.push(`/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(err.message)}`);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <CallbackHandler />
    </Suspense>
  );
}
