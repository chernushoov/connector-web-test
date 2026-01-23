import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { signAdminToken } from '@/lib/admin-auth'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@connector.co.il').split(',')

export async function POST(request: NextRequest) {
  try {
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
    if (!ADMIN_EMAILS.includes(email)) {
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
