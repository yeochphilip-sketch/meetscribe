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

      try {
        const supabase = createClient();
        
        // Supabase automatically exchanges the code when detectSessionInUrl is true
        // We just need to wait for the session to be established
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
        } else {
          // If no session yet, wait a moment and check again
          // The exchange might still be in progress
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              router.push(next);
              router.refresh();
            } else {
              router.push("/auth/auth-code-error?error=no_session");
            }
          }, 1000);
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
