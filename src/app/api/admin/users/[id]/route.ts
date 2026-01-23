import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase, admin } = auth

  try {
    const { action, reason } = await request.json()

    if (!['block', 'unblock', 'verify'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    let updateData: Record<string, any> = {}

    switch (action) {
      case 'block':
        updateData = {
          is_blocked: true,
          blocked_by: admin.id,
          blocked_at: new Date().toISOString(),
          block_reason: reason || null,
        }
        break
      case 'unblock':
        updateData = {
          is_blocked: false,
          blocked_by: null,
          blocked_at: null,
          block_reason: null,
        }
        break
      case 'verify':
        updateData = {
          is_verified: true,
          verification_status: 'verified',
          verified_by: admin.id,
          verified_at: new Date().toISOString(),
        }
        break
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data, action })
  } catch (error) {
    console.error('Admin user action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase } = auth

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Admin get user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
