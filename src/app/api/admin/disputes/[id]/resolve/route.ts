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
    const { resolution, winner, notes } = await request.json()

    if (!resolution) {
      return NextResponse.json({ error: 'Resolution required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution,
        resolved_by: admin.id,
        resolved_at: new Date().toISOString(),
        winner: winner || null,
        admin_notes: notes || null,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ dispute: data })
  } catch (error) {
    console.error('Dispute resolve error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
