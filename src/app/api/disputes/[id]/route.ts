/**
 * Single Dispute API
 * GET /api/disputes/[id] - Get dispute details
 * PATCH /api/disputes/[id] - Update dispute (admin)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizeText } from '@/lib/sanitize'

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

/**
 * PATCH - Update dispute (add evidence, escalate, cancel)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, evidence, description } = body

    const supabaseAdmin = createAdminClient()

    // Get dispute
    const { data: dispute, error: fetchError } = await supabaseAdmin
      .from('disputes')
      .select('id, status, initiator_id, respondent_id')
      .eq('id', id)
      .single()

    if (fetchError || !dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    // Check access
    if (dispute.initiator_id !== user.id && dispute.respondent_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (dispute.status === 'resolved') {
      return NextResponse.json({ error: 'Dispute is already resolved' }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (action === 'escalate') {
      updates.status = 'escalated'
      updates.escalated_at = new Date().toISOString()
    } else if (action === 'cancel' && dispute.initiator_id === user.id) {
      updates.status = 'cancelled'
      updates.cancelled_at = new Date().toISOString()
    } else if (action === 'add_evidence') {
      if (evidence) {
        updates.evidence = evidence
      }
      if (description) {
        updates.description = sanitizeText(description)
      }
    } else if (!action) {
      // Allow general field updates (description, evidence)
      if (evidence) updates.evidence = evidence
      if (description) updates.description = sanitizeText(description)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('disputes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update dispute error:', updateError)
      return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 })
    }

    return NextResponse.json({ success: true, dispute: updated })
  } catch (error) {
    console.error('Update dispute error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
