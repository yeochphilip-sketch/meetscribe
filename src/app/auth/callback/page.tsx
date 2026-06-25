"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const nextFromUrl = searchParams.get("next") ?? "/dashboard";

      console.log("[AUTH CALLBACK] Code present:", !!code);
      console.log("[AUTH CALLBACK] State present:", !!state);

      if (!code) {
        console.error("[AUTH CALLBACK] No code in URL");
        router.push("/auth/auth-code-error?error=no_code");
        return;
      }

      // Recover PKCE verifier from localStorage using state
      let codeVerifier: string | null = null;
      let nextPath = nextFromUrl;

      if (state) {
        try {
          const stateData = JSON.parse(atob(state));
          const verifierKey = stateData.k;
          nextPath = stateData.n || nextFromUrl;
          console.log("[AUTH CALLBACK] Verifier key:", verifierKey);

          codeVerifier = localStorage.getItem(verifierKey);
          console.log("[AUTH CALLBACK] Verifier from localStorage:", codeVerifier ? "found" : "NOT FOUND");

          // Clean up localStorage
          if (verifierKey) {
            localStorage.removeItem(verifierKey);
          }
        } catch (e) {
          console.error("[AUTH CALLBACK] Failed to decode state:", e);
        }
      }

      if (!codeVerifier) {
        console.error("[AUTH CALLBACK] No PKCE verifier found");
        router.push("/auth/auth-code-error?error=pkce_not_found");
        return;
      }

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        console.log("[AUTH CALLBACK] Exchanging token...");
        const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseAnonKey,
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            auth_code: code,
            code_verifier: codeVerifier,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error("[AUTH CALLBACK] Token exchange failed:", tokenResponse.status, errorText);
          router.push(`/auth/auth-code-error?error=token_exchange&details=${encodeURIComponent(errorText)}`);
          return;
        }

        const tokenData = await tokenResponse.json();
        console.log("[AUTH CALLBACK] Token exchange success, user:", tokenData.user?.id);

        // Now set the session using the Supabase client
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
        });

        if (sessionError) {
          console.error("[AUTH CALLBACK] Set session error:", sessionError.message);
          router.push(`/auth/auth-code-error?error=session_error&details=${encodeURIComponent(sessionError.message)}`);
          return;
        }

        console.log("[AUTH CALLBACK] Session set, redirecting to:", nextPath);
        router.push(nextPath);
        router.refresh();

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
