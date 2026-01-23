// @ts-nocheck
/**
 * Single Dispute API
 * GET /api/disputes/[id] - Get dispute details
 * PATCH /api/disputes/[id] - Update dispute (admin)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: dispute, error } = await supabase
      .from('disputes')
      .select(`
        *,
        initiator:profiles!disputes_initiator_id_fkey(id, full_name, avatar_url, phone),
        respondent:profiles!disputes_respondent_id_fkey(id, full_name, avatar_url, phone),
        task_flow:task_flows!disputes_task_flow_id_fkey(
          *,
          shift:shifts!task_flows_shift_id_fkey(*)
        ),
        messages:dispute_messages(
          *,
          sender:profiles!dispute_messages_sender_id_fkey(id, full_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    // Check access
    if (dispute.initiator_id !== user.id && dispute.respondent_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ dispute })
  } catch (error) {
    console.error('Get dispute error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
