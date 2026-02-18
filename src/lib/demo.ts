/**
 * Centralized demo mode detection.
 * Demo mode is active when Supabase URL is not configured or contains 'placeholder'.
 */
export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !url || url.includes('placeholder')
}
