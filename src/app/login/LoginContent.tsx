"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  const getRedirectUrl = () => {
    // Use the current origin so it works on both domains during transition
    return `${window.location.origin}/auth/callback`;
  };

  const handleOAuthSignIn = async (provider: "google") => {
    console.log("[LOGIN] OAuth sign-in clicked:", provider);
    setIsLoading(provider);
    setError(null);

    try {
      const supabase = createClient();
      const redirectTo = getRedirectUrl();
      console.log("[LOGIN] Redirect URL:", redirectTo);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo,
        },
      });

      console.log("[LOGIN] signInWithOAuth result:", { data: !!data, error: !!oauthError });

      if (oauthError) {
        console.error("[LOGIN] OAuth error:", oauthError.message);
        throw oauthError;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("[LOGIN] Unexpected error:", err.message);
      setError(err.message || `Failed to sign in with ${provider}`);
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("email");
    setError(null);

    try {
      const supabase = createClient();
      const { error: emailError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      });

      if (emailError) throw emailError;
      setEmailSent(true);
    } catch (err: any) {
      console.error("[LOGIN] Email sign-in error:", err.message);
      setError(err.message || "Failed to send magic link");
    } finally {
      setIsLoading(null);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400">
              We sent a magic link to <span className="text-white">{email}</span>. Click it to sign in.
            </p>
          </div>
          <button onClick={() => setEmailSent(false)} className="text-indigo-400 hover:text-indigo-300 text-sm">
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400">Sign in to your MeetScribe account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* OAuth buttons first — what sales teams actually use */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthSignIn("google")}
            disabled={!!isLoading}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === "google" ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-gray-500">or use email</span>
          </div>
        </div>

        {/* Email form at the bottom */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Work email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              placeholder="you@company.com"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading === "email"}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === "email" ? "Sending..." : "Continue with email"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          New to MeetScribe?{" "}
          <a href="/onboarding" className="text-indigo-400 hover:text-indigo-300">
            Get started free
          </a>
        </p>
      </div>
    </div>
  );
}
