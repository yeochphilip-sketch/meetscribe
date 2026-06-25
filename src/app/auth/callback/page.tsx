"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const next = searchParams.get("next") ?? "/dashboard";
      const code = searchParams.get("code");

      console.log("[AUTH CALLBACK] Code present:", !!code);
      console.log("[AUTH CALLBACK] Next path:", next);

      if (!code) {
        console.error("[AUTH CALLBACK] No code in URL");
        router.push("/auth/auth-code-error?error=no_code");
        return;
      }

      try {
        // Get the PKCE verifier from localStorage
        // The key is derived from the Supabase URL project ref
        const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0] || "";
        const verifierKey = `sb-${projectRef}-auth-token-code-verifier`;
        
        console.log("[AUTH CALLBACK] Looking for verifier at key:", verifierKey);
        
        let codeVerifier = localStorage.getItem(verifierKey);
        
        // Also try alternative keys
        if (!codeVerifier) {
          const altKey = "meetscribe-pkce-verifier";
          codeVerifier = localStorage.getItem(altKey);
          console.log("[AUTH CALLBACK] Tried alt key:", altKey, codeVerifier ? "found" : "not found");
        }

        // Try all localStorage keys containing 'verifier'
        if (!codeVerifier) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes("verifier")) {
              codeVerifier = localStorage.getItem(key);
              console.log("[AUTH CALLBACK] Found verifier at key:", key);
              break;
            }
          }
        }

        console.log("[AUTH CALLBACK] Verifier found:", codeVerifier ? "YES" : "NO");

        if (!codeVerifier) {
          console.error("[AUTH CALLBACK] No PKCE verifier in localStorage");
          router.push("/auth/auth-code-error?error=pkce_not_found");
          return;
        }

        // Exchange the code using the REST API
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        console.log("[AUTH CALLBACK] Exchanging code...");
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

        // Now set the session using @supabase/ssr browser client
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

        // Clean up localStorage
        localStorage.removeItem(verifierKey);
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes("verifier")) {
            localStorage.removeItem(key);
          }
        }

        console.log("[AUTH CALLBACK] Success, redirecting to:", next);
        router.push(next);
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
