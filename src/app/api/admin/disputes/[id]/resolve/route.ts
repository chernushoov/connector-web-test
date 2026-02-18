/**
 * Admin Dispute Resolution
 * POST /api/admin/disputes/[id]/resolve - Resolve a dispute
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase, admin } = auth

  try {
    const { id } = await params
    const { resolution, winner, notes } = await request.json()

    if (!resolution) {
      return NextResponse.json({ error: 'Resolution required' }, { status: 400 })
    }

    const validResolutions = ['resolved_for_initiator', 'resolved_for_respondent', 'resolved_mutual', 'dismissed']
    if (!validResolutions.includes(resolution)) {
      return NextResponse.json(
        { error: `Resolution must be one of: ${validResolutions.join(', ')}` },
        { status: 400 }
      )
    }

    // Get dispute and check status
    const { data: dispute, error: fetchError } = await supabase
      .from('disputes')
      .select('id, status, initiator_id, respondent_id')
      .eq('id', id)
      .single()

    if (fetchError || !dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    if ((dispute as Record<string, unknown>).status === 'resolved') {
      return NextResponse.json({ error: 'Dispute is already resolved' }, { status: 400 })
    }

    // Update dispute
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
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Notify both parties
    const disputeRecord = dispute as Record<string, unknown>
    await supabase.from('notifications').insert([
      {
        user_id: disputeRecord.initiator_id,
        type: 'dispute',
        title: 'Спор разрешён',
        body: 'Ваш спор был рассмотрен администратором',
        data: { dispute_id: id, resolution },
      },
      {
        user_id: disputeRecord.respondent_id,
        type: 'dispute',
        title: 'Спор разрешён',
        body: 'Спор с вашим участием был рассмотрен администратором',
        data: { dispute_id: id, resolution },
      },
    ])

    // Add system message
    await supabase.from('dispute_messages').insert({
      dispute_id: id,
      sender_id: admin.id,
      content: `Спор разрешён: ${resolution}${notes ? `. ${notes}` : ''}`,
      is_system: true,
    })

    return NextResponse.json({ success: true, dispute: data })
  } catch (error) {
    console.error('Dispute resolve error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
