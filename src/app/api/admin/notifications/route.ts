import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase, admin } = auth

  try {
    const { action, ...payload } = await request.json()

    if (action === 'campaign') {
      const { title, message, target_audience, filters } = payload

      if (!title || !message) {
        return NextResponse.json({ error: 'Title and message required' }, { status: 400 })
      }

      // Get target users based on audience
      let query = supabase.from('profiles').select('id')

      if (target_audience === 'workers') {
        query = query.eq('user_type', 'worker')
      } else if (target_audience === 'employers') {
        query = query.eq('user_type', 'employer')
      }

      if (filters?.verified_only) {
        query = query.eq('is_verified', true)
      }

      const { data: users } = await query

      if (!users || users.length === 0) {
        return NextResponse.json({ error: 'No users match criteria' }, { status: 400 })
      }

      // Create notifications for all matching users
      const notifications = users.map((u: any) => ({
        user_id: u.id,
        type: 'campaign',
        title,
        message,
        created_by: admin.id,
        read: false,
        created_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('notifications').insert(notifications)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ sent: users.length, campaign: { title, target_audience } })
    }

    if (action === 'send') {
      const { user_id, title, message, type } = payload

      if (!user_id || !message) {
        return NextResponse.json({ error: 'user_id and message required' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id,
          type: type || 'admin',
          title: title || 'Уведомление',
          message,
          created_by: admin.id,
          read: false,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ notification: data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
