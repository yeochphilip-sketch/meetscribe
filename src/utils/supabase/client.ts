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
          console.log("[SUPABASE CLIENT GET] Looking for:", name);
          const allCookies = document.cookie.split("; ").filter(Boolean);
          console.log("[SUPABASE CLIENT GET] All cookies:", allCookies.map(c => c.split("=")[0]));
          
          // Try exact match first
          const exact = allCookies.find((row) => row.startsWith(`${name}=`));
          if (exact) {
            const value = exact.split("=")[1];
            console.log("[SUPABASE CLIENT GET] FOUND exact:", name, "length:", value.length);
            return decodeURIComponent(value);
          }
          
          // Try chunked cookies: name.0, name.1, etc.
          const chunks: string[] = [];
          for (let i = 0; i < 10; i++) {
            const chunkName = `${name}.${i}`;
            const chunk = allCookies.find((row) => row.startsWith(`${chunkName}=`));
            if (chunk) {
              chunks.push(decodeURIComponent(chunk.split("=")[1]));
              console.log("[SUPABASE CLIENT GET] FOUND chunk:", chunkName);
            } else {
              break;
            }
          }
          
          if (chunks.length > 0) {
            const assembled = chunks.join("");
            console.log("[SUPABASE CLIENT GET] ASSEMBLED from", chunks.length, "chunks, total length:", assembled.length);
            return assembled;
          }
          
          console.log("[SUPABASE CLIENT GET] NOT FOUND:", name);
          return undefined;
        },
        set(name: string, value: string, options: any) {
          console.log("[SUPABASE CLIENT SET] Setting:", name, "value length:", value.length, "options:", JSON.stringify(options));
          
          // Supabase SSR chunks cookies > 4000 bytes. We need to handle that.
          const CHUNK_SIZE = 4000;
          const totalChunks = Math.ceil(value.length / CHUNK_SIZE);
          console.log("[SUPABASE CLIENT SET] Will split into", totalChunks, "chunks");
          
          // Remove any existing chunks first
          const allCookies = document.cookie.split("; ").filter(Boolean);
          for (let i = 0; i < 10; i++) {
            const chunkName = totalChunks === 1 ? name : `${name}.${i}`;
            if (allCookies.some(c => c.startsWith(`${chunkName}=`))) {
              document.cookie = `${chunkName}=; max-age=0; path=/`;
              console.log("[SUPABASE CLIENT SET] Cleared old chunk:", chunkName);
            }
          }
          
          if (totalChunks === 1) {
            let cookieStr = `${name}=${encodeURIComponent(value)}`;
            cookieStr += `; Path=/`;
            if (options?.maxAge !== undefined) cookieStr += `; Max-Age=${options.maxAge}`;
            if (options?.expires) cookieStr += `; Expires=${new Date(options.expires).toUTCString()}`;
            if (options?.domain) cookieStr += `; Domain=${options.domain}`;
            
            // PKCE verifier MUST be SameSite=None; Secure for cross-site OAuth redirect
            if (name.includes("code-verifier")) {
              cookieStr += "; SameSite=None; Secure";
              console.log("[SUPABASE CLIENT SET] PKCE verifier - forcing SameSite=None; Secure");
            } else {
              cookieStr += `; SameSite=${options?.sameSite || "Lax"}`;
              if (options?.secure) cookieStr += "; Secure";
            }
            
            console.log("[SUPABASE CLIENT SET] Final cookie:", cookieStr.substring(0, 120) + "...");
            document.cookie = cookieStr;
            
            const verify = document.cookie.split("; ").find(r => r.startsWith(`${name}=`));
            console.log("[SUPABASE CLIENT SET] Verification - cookie present:", !!verify);
          } else {
            // Multi-chunk
            for (let i = 0; i < totalChunks; i++) {
              const chunk = value.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
              const chunkName = `${name}.${i}`;
              let cookieStr = `${chunkName}=${encodeURIComponent(chunk)}`;
              cookieStr += `; Path=/`;
              if (options?.maxAge !== undefined) cookieStr += `; Max-Age=${options.maxAge}`;
              if (options?.expires) cookieStr += `; Expires=${new Date(options.expires).toUTCString()}`;
              if (options?.domain) cookieStr += `; Domain=${options.domain}`;
              
              if (name.includes("code-verifier")) {
                cookieStr += "; SameSite=None; Secure";
              } else {
                cookieStr += `; SameSite=${options?.sameSite || "Lax"}`;
                if (options?.secure) cookieStr += "; Secure";
              }
              
              document.cookie = cookieStr;
              console.log("[SUPABASE CLIENT SET] Wrote chunk", i, ":", chunkName, "length:", chunk.length);
            }
          }
        },
        remove(name: string, options: any) {
          console.log("[SUPABASE CLIENT REMOVE] Removing:", name);
          document.cookie = `${name}=; max-age=0; path=${options?.path ?? "/"}`;
          // Also remove chunked variants
          for (let i = 0; i < 10; i++) {
            document.cookie = `${name}.${i}=; max-age=0; path=/`;
          }
        },
      },
    }
  );
