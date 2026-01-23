// @ts-nocheck
/**
 * Dispute Messages API
 * GET /api/disputes/[id]/messages - Get messages
 * POST /api/disputes/[id]/messages - Send message
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { disputeMessageSchema, validate, formatErrors } from '@/lib/validators'

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

    // Verify access
    const { data: dispute } = await supabase
      .from('disputes')
      .select('initiator_id, respondent_id')
      .eq('id', id)
      .single()

    if (!dispute || (dispute.initiator_id !== user.id && dispute.respondent_id !== user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: messages, error } = await supabase
      .from('dispute_messages')
      .select(`
        *,
        sender:profiles!dispute_messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .eq('dispute_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Get dispute messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validate(disputeMessageSchema, { ...body, dispute_id: id })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Verify access and dispute is open
    const { data: dispute } = await supabaseAdmin
      .from('disputes')
      .select('initiator_id, respondent_id, status')
      .eq('id', id)
      .single()

    if (!dispute || (dispute.initiator_id !== user.id && dispute.respondent_id !== user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (dispute.status === 'resolved') {
      return NextResponse.json({ error: 'Dispute is already resolved' }, { status: 400 })
    }

    const { data: message, error: createError } = await supabaseAdmin
      .from('dispute_messages')
      .insert({
        dispute_id: id,
        sender_id: user.id,
        content: validation.data.content,
        attachments: validation.data.attachments || [],
      })
      .select(`
        *,
        sender:profiles!dispute_messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Notify the other party
    const notifyUserId = dispute.initiator_id === user.id
      ? dispute.respondent_id
      : dispute.initiator_id

    await supabaseAdmin.from('notifications').insert({
      user_id: notifyUserId,
      type: 'dispute',
      title: 'Новое сообщение в споре',
      body: 'Получено новое сообщение по вашему спору',
      data: { dispute_id: id },
    })

    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (error) {
    console.error('Send dispute message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
