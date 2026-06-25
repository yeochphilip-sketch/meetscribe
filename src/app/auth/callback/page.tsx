"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const next = searchParams.get("next") ?? "/dashboard";
      const code = searchParams.get("code");

      console.log("[AUTH CALLBACK] Code from URL:", code ? "present" : "missing");
      console.log("[AUTH CALLBACK] Next path:", next);

      if (!code) {
        console.error("[AUTH CALLBACK] No code in URL");
        router.push("/auth/auth-code-error?error=no_code");
        return;
      }

      try {
        const supabase = createClient();

        // Manually exchange the code for a session
        // The PKCE verifier is stored in a cookie by the browser client
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("[AUTH CALLBACK] Exchange error:", error.message);
          router.push(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
          return;
        }

        if (data?.session) {
          console.log("[AUTH CALLBACK] Session established, user:", data.session.user?.id);
          router.push(next);
          router.refresh();
        } else {
          console.error("[AUTH CALLBACK] No session after exchange");
          router.push("/auth/auth-code-error?error=no_session_after_exchange");
        }
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
