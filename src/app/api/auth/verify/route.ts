/**
 * Phone Authentication - Verify SMS Code
 * POST /api/auth/verify
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOtpSchema, validate, formatErrors } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validate(verifyOtpSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const { phone, code } = validation.data
    const supabase = await createClient()

    // Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    })

    if (error) {
      console.error('OTP verification error:', error)
      return NextResponse.json(
        { error: 'Invalid code', message: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    // Check if user profile exists
    const supabaseAdmin = createAdminClient()
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, user_type, is_verified')
      .eq('id', data.user.id)
      .single()

    // Create profile if doesn't exist (new user)
    let isNewUser = false
    if (!profile) {
      isNewUser = true
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          phone: data.user.phone || phone,
          user_type: 'worker', // Default to worker, can be changed later
        })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        phone: data.user.phone,
        email: data.user.email,
      },
      session: data.session,
      isNewUser,
      profile: profile || null,
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
