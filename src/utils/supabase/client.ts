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
          
          // Use Path with capital P (RFC standard)
          cookieStr += `; Path=/`;
          
          if (options.maxAge !== undefined && options.maxAge !== null) {
            cookieStr += `; Max-Age=${options.maxAge}`;
          }
          
          if (options.expires) {
            let expiresStr: string;
            if (options.expires instanceof Date) {
              expiresStr = options.expires.toUTCString();
            } else if (typeof options.expires === "number") {
              expiresStr = new Date(options.expires).toUTCString();
            } else {
              expiresStr = String(options.expires);
            }
            cookieStr += `; Expires=${expiresStr}`;
          }
          
          if (options.domain) {
            cookieStr += `; Domain=${options.domain}`;
          }
          
          // For PKCE code-verifier cookies, use SameSite=None;Secure
          // so they survive cross-site redirects from OAuth providers
          if (name.includes("code-verifier")) {
            cookieStr += "; SameSite=None; Secure";
          } else if (options.sameSite) {
            cookieStr += `; SameSite=${options.sameSite}`;
          }
          
          if (options.secure && !name.includes("code-verifier")) {
            cookieStr += "; Secure";
          }
          
          document.cookie = cookieStr;
        },
        remove(name: string, options: any) {
          let cookieStr = `${name}=; Max-Age=0; Path=/`;
          if (options?.domain) {
            cookieStr += `; Domain=${options.domain}`;
          }
          document.cookie = cookieStr;
        },
      },
    }
  );
