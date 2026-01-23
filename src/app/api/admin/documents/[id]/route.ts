import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase, admin } = auth

  try {
    const { action, reason } = await request.json()

    if (!['verify', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const newStatus = action === 'verify' ? 'verified' : 'rejected'

    const { data, error } = await supabase
      .from('documents')
      .update({
        status: newStatus,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: action === 'reject' ? reason : null,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (action === 'verify' && data) {
      await supabase
        .from('profiles')
        .update({ is_verified: true, verification_status: 'verified' })
        .eq('id', (data as any).user_id)
    }

    return NextResponse.json({ document: data, action })
  } catch (error) {
    console.error('Document review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
