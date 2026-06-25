"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function OnboardingContent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        
        const storedName = sessionStorage.getItem("onboarding_name");
        const storedCompany = sessionStorage.getItem("onboarding_company");
        const storedRole = sessionStorage.getItem("onboarding_role");
        
        if (storedName) setName(storedName);
        if (storedCompany) setCompany(storedCompany);
        if (storedRole) setRole(storedRole);
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .maybeSingle();
          
        if (profile?.full_name) {
          router.push("/dashboard");
          return;
        }
      }
      
      setCheckingAuth(false);
    };
    
    checkAuth();
  }, [supabase, router]);

  const handleGoogleSignIn = async () => {
    if (!name.trim() || !company.trim() || !role.trim()) {
      setMessage("Please fill in all fields first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      sessionStorage.setItem("onboarding_name", name);
      sessionStorage.setItem("onboarding_company", company);
      sessionStorage.setItem("onboarding_role", role);

      const redirectTo = `${window.location.origin}/auth/callback?next=/onboarding`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !company.trim() || !role.trim()) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage("You must be signed in to continue.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name,
        company_name: company,
        role: role,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      sessionStorage.removeItem("onboarding_name");
      sessionStorage.removeItem("onboarding_company");
      sessionStorage.removeItem("onboarding_role");

      router.push("/dashboard");
    } catch (err: any) {
      setMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to MeetScribe
          </h1>
          <p className="text-gray-400">
            {isAuthenticated 
              ? "Confirm your details to complete setup" 
              : "Tell us a bit about yourself to get started"}
          </p>
        </div>

        {message && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-4 pr-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Company name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full pl-4 pr-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              placeholder="Acme Inc"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Your role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-4 pr-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              placeholder="Sales Manager"
              required
            />
          </div>

          {isAuthenticated ? (
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Complete setup"}
            </button>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? "Connecting..." : "Continue with Google"}
            </button>
          )}
        </div>

        {!isAuthenticated && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
