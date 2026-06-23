import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true,
        storage: {
          getItem: (key) => {
            if (typeof document === 'undefined') return null
            const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'))
            return match ? decodeURIComponent(match[2]) : null
          },
          setItem: (key, value) => {
            if (typeof document === 'undefined') return
            // Set cookie with 1 hour expiry for PKCE verifier
            const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString()
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax; Secure`
          },
          removeItem: (key) => {
            if (typeof document === 'undefined') return
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`
          },
        },
      },
    }
  )
