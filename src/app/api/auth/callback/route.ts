/**
 * OAuth Callback Handler
 * GET /api/auth/callback
 *
 * Handles redirects from OAuth providers (Google, Apple, etc.)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '')}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=no_code&message=No authorization code provided`
    )
  }

  try {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        `${origin}/auth/error?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
      )
    }

    if (!data.user) {
      return NextResponse.redirect(
        `${origin}/auth/error?error=no_user&message=Failed to get user data`
      )
    }

    // Check if profile exists
    const supabaseAdmin = createAdminClient()
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, user_type')
      .eq('id', data.user.id)
      .single()

    // Create profile if new user
    if (!profile) {
      const userData = data.user.user_metadata || {}

      await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name || userData.name || null,
          avatar_url: userData.avatar_url || userData.picture || null,
          user_type: 'worker', // Default, user will choose on onboarding
        })

      // Redirect new users to onboarding
      return NextResponse.redirect(`${origin}/onboarding?new=true`)
    }

    // Redirect existing users to their dashboard or next page
    const redirectUrl = profile.user_type === 'employer'
      ? '/employer/dashboard'
      : profile.user_type === 'worker'
        ? '/worker/dashboard'
        : next

    return NextResponse.redirect(`${origin}${redirectUrl}`)
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      `${origin}/auth/error?error=server_error&message=Internal server error`
    )
  }
}
