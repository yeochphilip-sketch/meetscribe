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
          let cookie = `${name}=${encodeURIComponent(value)}`;
          if (options.path) cookie += `; path=${options.path}`;
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
          if (options.expires) cookie += `; expires=${options.expires.toUTCString()}`;
          if (options.domain) cookie += `; domain=${options.domain}`;
          if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
          if (options.secure) cookie += "; secure";
          // Ensure SameSite=None for cross-site redirects (OAuth providers)
          // but Lax for same-site. Supabase handles this; we just pass through.
          document.cookie = cookie;
        },
        remove(name: string, options: any) {
          let cookie = `${name}=; max-age=0`;
          if (options?.path) cookie += `; path=${options.path}`;
          if (options?.domain) cookie += `; domain=${options.domain}`;
          document.cookie = cookie;
        },
      },
    }
  );
