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
          const allCookies = document.cookie.split("; ").filter(Boolean);
          const exact = allCookies.find((row) => row.startsWith(`${name}=`));
          if (exact) {
            const value = exact.split("=")[1];
            return decodeURIComponent(value);
          }
          const chunks: string[] = [];
          for (let i = 0; i < 10; i++) {
            const chunkName = `${name}.${i}`;
            const chunk = allCookies.find((row) => row.startsWith(`${chunkName}=`));
            if (chunk) {
              chunks.push(decodeURIComponent(chunk.split("=")[1]));
            } else {
              break;
            }
          }
          if (chunks.length > 0) {
            return chunks.join("");
          }
          return undefined;
        },
        set(name: string, value: string, options: any) {
          const CHUNK_SIZE = 4000;
          const totalChunks = Math.ceil(value.length / CHUNK_SIZE);

          // Force SameSite=None; Secure for cross-site OAuth redirects
          const cookieOptions = {
            ...options,
            sameSite: "none" as const,
            secure: true,
          };

          // Remove old chunks
          const allCookies = document.cookie.split("; ").filter(Boolean);
          for (let i = 0; i < 10; i++) {
            const chunkName = totalChunks === 1 ? name : `${name}.${i}`;
            if (allCookies.some(c => c.startsWith(`${chunkName}=`))) {
              document.cookie = `${chunkName}=; max-age=0; path=/; SameSite=None; Secure`;
            }
          }

          if (totalChunks === 1) {
            let cookieStr = `${name}=${encodeURIComponent(value)}`;
            cookieStr += `; Path=/`;
            cookieStr += `; Max-Age=${cookieOptions.maxAge ?? 34560000}`;
            cookieStr += `; SameSite=None`;
            cookieStr += `; Secure`;
            if (cookieOptions.httpOnly) cookieStr += `; HttpOnly`;
            document.cookie = cookieStr;
          } else {
            for (let i = 0; i < totalChunks; i++) {
              const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
              let cookieStr = `${name}.${i}=${encodeURIComponent(chunk)}`;
              cookieStr += `; Path=/`;
              cookieStr += `; Max-Age=${cookieOptions.maxAge ?? 34560000}`;
              cookieStr += `; SameSite=None`;
              cookieStr += `; Secure`;
              if (cookieOptions.httpOnly) cookieStr += `; HttpOnly`;
              document.cookie = cookieStr;
            }
          }
        },
        remove(name: string, options: any) {
          const cookieOptions = {
            ...options,
            sameSite: "none" as const,
            secure: true,
          };
          let cookieStr = `${name}=; max-age=0; path=/`;
          cookieStr += `; SameSite=None`;
          cookieStr += `; Secure`;
          if (cookieOptions.httpOnly) cookieStr += `; HttpOnly`;
          document.cookie = cookieStr;

          for (let i = 0; i < 10; i++) {
            let chunkStr = `${name}.${i}=; max-age=0; path=/`;
            chunkStr += `; SameSite=None`;
            chunkStr += `; Secure`;
            if (cookieOptions.httpOnly) chunkStr += `; HttpOnly`;
            document.cookie = chunkStr;
          }
        },
      },
    }
  );
