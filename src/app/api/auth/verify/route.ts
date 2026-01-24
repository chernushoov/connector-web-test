/**
 * Phone Authentication - Verify SMS Code
 * POST /api/auth/verify
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOtpSchema, validate, formatErrors } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'

const isDemoMode = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    return !url || url.includes('placeholder')
}

const verifyRateLimiter = rateLimit({
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // max 5 attempts per phone per 15 min
})

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

      // Demo mode - accept code 000000
      if (isDemoMode()) {
              if (code !== '000000') {
                        return NextResponse.json(
                          { error: 'Invalid code', message: 'В демо-режиме код: 000000' },
                          { status: 400 }
                                  )
              }

            const demoUserId = 'demo-user-' + phone.replace(/\D/g, '')

            const response = NextResponse.json({
                      success: true,
                      user: {
                                  id: demoUserId,
                                  phone,
                                  email: null,
                      },
                      session: {
                                  access_token: 'demo-token-' + Date.now(),
                                  refresh_token: 'demo-refresh-' + Date.now(),
                                  expires_in: 86400,
                                  token_type: 'bearer',
                      },
                      isNewUser: true,
                      profile: {
                                  id: demoUserId,
                                  full_name: 'Demo Worker',
                                  user_type: 'worker',
                                  is_verified: true,
                      },
                      demo: true,
            })

            // Set demo cookie for middleware auth check
            response.cookies.set('demo-auth', 'true', {
                      path: '/',
                      maxAge: 86400,
                      httpOnly: false,
            })

            return response
      }

      // Rate limit by phone number
      const rateLimitResult = verifyRateLimiter.check(phone)
          if (!rateLimitResult.allowed) {
                  return NextResponse.json(
                    { error: 'Too many attempts. Try again later.', retryAfter: rateLimitResult.retryAfter },
                    { status: 429 }
                          )
          }

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
                { error: 'Invalid code' },
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
                                name: data.user.phone || phone,
                                user_type: 'worker',
                    } as never)
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
