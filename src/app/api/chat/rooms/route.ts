/**
 * Chat Rooms API
 * GET /api/chat/rooms - Get user's chat rooms
 * POST /api/chat/rooms - Create chat room
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        participant1:profiles!chat_rooms_participant1_id_fkey(id, full_name, avatar_url),
        participant2:profiles!chat_rooms_participant2_id_fkey(id, full_name, avatar_url),
        shift:shifts!chat_rooms_shift_id_fkey(id, title)
      `)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
    }

    // Get unread counts for each room
    const roomsWithUnread = await Promise.all(
      (rooms || []).map(async (room) => {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)
          .neq('sender_id', user.id)
          .eq('is_read', false)

        return { ...room, unreadCount: count || 0 }
      })
    )

    return NextResponse.json({ rooms: roomsWithUnread })
  } catch (error) {
    console.error('Get chat rooms error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { participant_id, shift_id, task_flow_id } = await request.json()

    if (!participant_id) {
      return NextResponse.json({ error: 'participant_id is required' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // Check if room already exists between these users for this shift
    const { data: existing } = await supabaseAdmin
      .from('chat_rooms')
      .select('id')
      .or(
        `and(participant1_id.eq.${user.id},participant2_id.eq.${participant_id}),` +
        `and(participant1_id.eq.${participant_id},participant2_id.eq.${user.id})`
      )
      .eq('shift_id', shift_id || '')
      .single()

    if (existing) {
      return NextResponse.json({ room: existing, existed: true })
    }

    // Create new room
    const { data: room, error: createError } = await supabaseAdmin
      .from('chat_rooms')
      .insert({
        participant1_id: user.id,
        participant2_id: participant_id,
        shift_id: shift_id || null,
        task_flow_id: task_flow_id || null,
      })
      .select(`
        *,
        participant1:profiles!chat_rooms_participant1_id_fkey(id, full_name, avatar_url),
        participant2:profiles!chat_rooms_participant2_id_fkey(id, full_name, avatar_url)
      `)
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
    }

    return NextResponse.json({ room, existed: false }, { status: 201 })
  } catch (error) {
    console.error('Create chat room error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
