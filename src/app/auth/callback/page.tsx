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

      // Find PKCE verifier in localStorage
      let codeVerifier: string | null = null;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes("verifier")) {
          codeVerifier = localStorage.getItem(key);
          console.log("[AUTH CALLBACK] Found verifier at key:", key);
          break;
        }
      }

      if (!codeVerifier) {
        console.error("[AUTH CALLBACK] No PKCE verifier in localStorage");
        router.push("/auth/auth-code-error?error=pkce_not_found");
        return;
      }

      try {
        // Call server API to exchange code (browser can't call token endpoint directly)
        const resp = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, codeVerifier, next }),
        });

        const data = await resp.json();

        if (!resp.ok || data.error) {
          console.error("[AUTH CALLBACK] Server error:", data.error, data.details);
          router.push(`/auth/auth-code-error?error=${encodeURIComponent(data.error)}&details=${encodeURIComponent(data.details || "")}`);
          return;
        }

        // Clean up localStorage
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.includes("verifier")) {
            localStorage.removeItem(key);
          }
        }

        console.log("[AUTH CALLBACK] Success, redirecting to:", data.next || next);
        router.push(data.next || next);
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
