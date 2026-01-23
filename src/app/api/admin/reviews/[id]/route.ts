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

    if (!['approve', 'hide'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updateData = action === 'approve'
      ? { status: 'approved', moderated_by: admin.id, moderated_at: new Date().toISOString() }
      : { status: 'hidden', hidden_by: admin.id, hidden_at: new Date().toISOString(), hide_reason: reason || null }

    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ review: data, action })
  } catch (error) {
    console.error('Review moderation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
