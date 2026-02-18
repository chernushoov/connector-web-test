/**
 * Chat Messages API
 * GET /api/chat/rooms/[id]/messages - Get messages
 * POST /api/chat/rooms/[id]/messages - Send message
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAgent } from '@/lib/agent'
import { sanitizeText } from '@/lib/sanitize'
import { CONTENT_LIMITS } from '@/lib/config'

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

    const { searchParams } = new URL(request.url)
    const supabase = await createClient()

    // Verify room access
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('participant1_id, participant2_id')
      .eq('id', id)
      .single()

    if (!room || (room.participant1_id !== user.id && room.participant2_id !== user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Pagination (cursor-based for chat)
    const before = searchParams.get('before') // message ID or timestamp
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    let query = supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .eq('room_id', id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Mark messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', id)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      messages: (messages || []).reverse(),
      hasMore: (messages || []).length === limit,
    })
  } catch (error) {
    console.error('Get messages error:', error)
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

    const { content, type = 'text', metadata } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    if (content.length > CONTENT_LIMITS.MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Message too long (max ${CONTENT_LIMITS.MAX_MESSAGE_LENGTH} chars)` }, { status: 400 })
    }

    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeText(content)

    const supabaseAdmin = createAdminClient()

    // Verify room access
    const { data: room } = await supabaseAdmin
      .from('chat_rooms')
      .select('participant1_id, participant2_id')
      .eq('id', id)
      .single()

    if (!room || (room.participant1_id !== user.id && room.participant2_id !== user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // AI Agent: moderate message content
    try {
      const agent = getAgent()
      agent.start()
      const modResult = await agent.moderateMessage({
        id: `msg-${Date.now()}`,
        content: sanitizedContent,
        senderId: user.id,
        createdAt: new Date(),
      })
      if (modResult && modResult.action === 'reject') {
        return NextResponse.json({
          error: 'Message blocked by moderation',
          reasons: modResult.reasons,
        }, { status: 403 })
      }
    } catch {
      // Non-blocking: allow message if moderation fails
    }

    // Create message
    const { data: message, error: createError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        room_id: id,
        sender_id: user.id,
        content: sanitizedContent,
        type,
        metadata: metadata || null,
        is_read: false,
      })
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update room's last_message_at
    await supabaseAdmin
      .from('chat_rooms')
      .update({
        last_message_at: new Date().toISOString(),
        last_message: sanitizedContent.slice(0, 100),
      })
      .eq('id', id)

    // Notify recipient
    const recipientId = room.participant1_id === user.id
      ? room.participant2_id
      : room.participant1_id

    await supabaseAdmin.from('notifications').insert({
      user_id: recipientId,
      type: 'message',
      title: 'Новое сообщение',
      body: sanitizedContent.slice(0, 50),
      data: { room_id: id, message_id: message.id },
    })

    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
