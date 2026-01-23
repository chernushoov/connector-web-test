/**
 * Logout Endpoint
 * POST /api/auth/logout
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Sign out user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json(
        { error: 'Logout failed', message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for simple logout links
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/`)
  } catch (error) {
    console.error('Logout error:', error)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/?error=logout_failed`)
  }
}
