/**
 * Phone Authentication - Send SMS Code
 * POST /api/auth/phone
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOtpSchema, validate, formatErrors } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate phone number
    const validation = validate(sendOtpSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const { phone } = validation.data
    const supabase = createAdminClient()

    // Send OTP via Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      },
    })

    if (error) {
      console.error('SMS send error:', error)
      return NextResponse.json(
        { error: 'Failed to send SMS', message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'SMS code sent successfully',
      // In development, you might want to return the code for testing
      ...(process.env.NODE_ENV === 'development' && { debug: data }),
    })
  } catch (error) {
    console.error('Phone auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
