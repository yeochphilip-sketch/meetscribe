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
          const allCookies = document.cookie.split("; ");
          const cookie = allCookies.find((row) => row.trim().startsWith(`${name}=`));
          if (!cookie) {
            console.log(`[COOKIE GET] ${name}: NOT FOUND`);
            return undefined;
          }
          try {
            const value = decodeURIComponent(cookie.split("=")[1]);
            console.log(`[COOKIE GET] ${name}: FOUND (length ${value.length})`);
            return value;
          } catch {
            const value = cookie.split("=")[1];
            console.log(`[COOKIE GET] ${name}: FOUND (raw, length ${value.length})`);
            return value;
          }
        },
        set(name: string, value: string, options: any) {
          console.log(`[COOKIE SET] ${name}: setting with options`, JSON.stringify(options));
          
          let cookieStr = `${name}=${encodeURIComponent(value)}`;
          cookieStr += `; Path=/`;
          
          if (options?.maxAge !== undefined && options?.maxAge !== null) {
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
          
          // Force SameSite=None;Secure for all cookies to ensure they survive redirects
          cookieStr += "; SameSite=None; Secure";
          
          document.cookie = cookieStr;
          console.log(`[COOKIE SET] ${name}: DONE - ${cookieStr.substring(0, 100)}...`);
        },
        remove(name: string, options: any) {
          console.log(`[COOKIE REMOVE] ${name}`);
          let cookieStr = `${name}=; Max-Age=0; Path=/`;
          if (options?.domain) {
            cookieStr += `; Domain=${options.domain}`;
          }
          document.cookie = cookieStr;
        },
      },
    }
  );
