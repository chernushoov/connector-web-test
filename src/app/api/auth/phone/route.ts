/**
 * Phone Authentication - Send SMS Code
 * POST /api/auth/phone
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOtpSchema, validate, formatErrors } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'

const phoneRateLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 3,            // max 3 SMS per phone per 15 min
})

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

    // Rate limit by phone number
    const rateLimitResult = phoneRateLimiter.check(phone)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      )
    }

    const supabase = createAdminClient()

    // Send OTP via Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      },
    })

    if (error) {
      console.error('SMS send error:', error)
      return NextResponse.json(
        { error: 'Failed to send SMS' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'SMS code sent successfully',
    })
  } catch (error) {
    console.error('Phone auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
