/**
 * Supabase Admin Client
 * For use in server-side operations that need to bypass RLS
 * WARNING: Never expose this client to the browser!
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

let adminClient: ReturnType<typeof createClient<Database>> | null = null

export function createAdminClient() {
  if (adminClient) return adminClient

  adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  return adminClient
}

