import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${name}=`));
          if (!cookie) return undefined;
          try {
            return decodeURIComponent(cookie.split("=")[1]);
          } catch {
            return cookie.split("=")[1];
          }
        },
        set(name: string, value: string, options: any) {
          let cookieStr = `${name}=${encodeURIComponent(value)}`;
          cookieStr += `; Path=/`;
          if (options?.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
          if (options?.expires) cookieStr += `; Expires=${options.expires.toUTCString()}`;
          if (options?.domain) cookieStr += `; Domain=${options.domain}`;
          
          // For PKCE verifier: SameSite=None + Secure + Partitioned (CHIPS)
          // This is required for cross-site redirects in modern Chrome/Edge
          if (name.includes("code-verifier")) {
            cookieStr += "; SameSite=None; Secure; Partitioned";
          } else {
            cookieStr += `; SameSite=${options?.sameSite || "Lax"}`;
            if (options?.secure) cookieStr += "; Secure";
          }
          
          document.cookie = cookieStr;
        },
        remove(name: string, options: any) {
          let cookieStr = `${name}=; Max-Age=0; Path=/`;
          if (options?.domain) cookieStr += `; Domain=${options.domain}`;
          document.cookie = cookieStr;
        },
      },
    }
  );
