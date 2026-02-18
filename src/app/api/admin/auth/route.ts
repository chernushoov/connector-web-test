import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { signAdminToken } from '@/lib/admin-auth'
import { rateLimit } from '@/lib/rate-limit'
import { RATE_LIMITS } from '@/lib/config'

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',')
if (!ADMIN_EMAILS || ADMIN_EMAILS.length === 0) {
  console.error('[FATAL] ADMIN_EMAILS environment variable is not set')
}

const adminAuthRateLimiter = rateLimit({
  interval: RATE_LIMITS.ADMIN_AUTH.interval,
  maxRequests: RATE_LIMITS.ADMIN_AUTH.maxRequests,
})

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rateLimitResult = adminAuthRateLimiter.check(ip)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify credentials via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if user is admin
    if (!ADMIN_EMAILS || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const token = signAdminToken({
      id: data.user.id,
      email,
      role: 'admin',
    })

    return NextResponse.json({
      token,
      admin: { id: data.user.id, email, role: 'admin' },
    })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
