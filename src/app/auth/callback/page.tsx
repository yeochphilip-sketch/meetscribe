"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const handleCallback = async () => {
      const next = searchParams.get("next") ?? "/dashboard";
      const code = searchParams.get("code");

      if (!code) {
        router.push("/auth/auth-code-error?error=no_code");
        return;
      }

      // Create the SAME client configuration as login page
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
      // But it might take a moment. Let's retry a few times.
      let session = null;
      let error = null;

      for (let i = 0; i < 5; i++) {
        console.log(`[AUTH CALLBACK] Attempt ${i + 1}/5`);
        const result = await supabase.auth.getSession();
        session = result.data.session;
        error = result.error;

        if (session) {
          console.log("[AUTH CALLBACK] Session found!");
          break;
        }

        if (error) {
          console.error("[AUTH CALLBACK] Error on attempt", i + 1, ":", error.message);
        } else {
          console.log("[AUTH CALLBACK] No session yet, waiting...");
        }

        // Wait 500ms before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (session) {
        console.log("[AUTH CALLBACK] Redirecting to:", next);
        router.push(next);
        router.refresh();
        return;
      }

      // If still no session, try exchangeCodeForSession directly
      console.log("[AUTH CALLBACK] Trying direct exchangeCodeForSession...");
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

      console.error("[AUTH CALLBACK] No session after all attempts");
      router.push("/auth/auth-code-error?error=no_session");
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
