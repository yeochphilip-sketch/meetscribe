import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') return null
            // Try our custom key first, then fall back to Supabase's default
            const custom = localStorage.getItem('meetscribe-auth-token')
            if (custom && key.includes('auth-token')) return custom
            return localStorage.getItem(key)
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') return
            localStorage.setItem(key, value)
            if (key.includes('auth-token')) {
              localStorage.setItem('meetscribe-auth-token', value)
            }
          },
          removeItem: (key) => {
            if (typeof window === 'undefined') return
            localStorage.removeItem(key)
            if (key.includes('auth-token')) {
              localStorage.removeItem('meetscribe-auth-token')
            }
          },
        },
      },
    }
  )
