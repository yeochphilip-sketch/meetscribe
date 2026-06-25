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
          console.log("[COOKIE GET] Looking for:", name);
          const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${name}=`));
          if (!cookie) {
            console.log("[COOKIE GET] NOT FOUND:", name);
            return undefined;
          }
          try {
            const value = decodeURIComponent(cookie.split("=")[1]);
            console.log("[COOKIE GET] FOUND:", name, "length:", value.length);
            return value;
          } catch {
            const value = cookie.split("=")[1];
            console.log("[COOKIE GET] FOUND (raw):", name, "length:", value.length);
            return value;
          }
        },
        set(name: string, value: string, options: any) {
          console.log("[COOKIE SET] Setting:", name, "options:", JSON.stringify(options));
          
          let cookieStr = `${name}=${encodeURIComponent(value)}`;
          cookieStr += `; Path=/`;
          
          if (options?.maxAge !== undefined) {
            cookieStr += `; Max-Age=${options.maxAge}`;
          }
          
          if (options?.expires) {
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
          
          if (options?.domain) {
            cookieStr += `; Domain=${options.domain}`;
          }
          
          // Force SameSite=None; Secure for PKCE verifier cookies
          if (name.includes("code-verifier")) {
            cookieStr += "; SameSite=None; Secure";
            console.log("[COOKIE SET] PKCE verifier cookie - forcing SameSite=None; Secure");
          } else {
            cookieStr += `; SameSite=${options?.sameSite || "Lax"}`;
            if (options?.secure) cookieStr += "; Secure";
          }
          
          console.log("[COOKIE SET] Final cookie string:", cookieStr.substring(0, 150));
          document.cookie = cookieStr;
          
          // Verify it was set
          const verifyCookie = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
          console.log("[COOKIE SET] Verification - cookie present after set:", !!verifyCookie);
        },
        remove(name: string, options: any) {
          console.log("[COOKIE REMOVE] Removing:", name);
          let cookieStr = `${name}=; Max-Age=0; Path=/`;
          if (options?.domain) cookieStr += `; Domain=${options.domain}`;
          document.cookie = cookieStr;
        },
      },
    }
  );
