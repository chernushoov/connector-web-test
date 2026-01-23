/**
 * Supabase Browser Client
 * For use in React components (client-side)
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn('Supabase credentials not set - using placeholder')
    // Return a mock client that won't crash but won't work
    return null as any
  }

  client = createBrowserClient<Database>(url, key)

  return client
}
