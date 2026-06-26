import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${name}=`));
          return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
        },
        set(name: string, value: string, options: any) {
          // Force SameSite=None; Secure for all auth cookies to survive cross-site redirects
          let cookieStr = `${name}=${encodeURIComponent(value)}`;
          cookieStr += `; Path=${options?.path || "/"}`;
          if (options?.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
          cookieStr += `; SameSite=None`;
          cookieStr += `; Secure`;
          if (options?.httpOnly) cookieStr += `; HttpOnly`;
          document.cookie = cookieStr;
        },
        remove(name: string, options: any) {
          let cookieStr = `${name}=; Max-Age=0`;
          cookieStr += `; Path=${options?.path || "/"}`;
          cookieStr += `; SameSite=None`;
          cookieStr += `; Secure`;
          if (options?.httpOnly) cookieStr += `; HttpOnly`;
          document.cookie = cookieStr;
        },
      },
    }
  );
