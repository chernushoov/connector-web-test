/**
 * Admin Review Moderation
 * GET /api/admin/reviews/[id] - Get review details
 * PATCH /api/admin/reviews/[id] - Moderate review (approve/hide/delete)
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase } = auth

  try {
    const { id } = await params

    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url),
        reviewed:profiles!reviews_reviewed_id_fkey(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Get review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase, admin } = auth

  try {
    const { id } = await params
    const { action, reason } = await request.json()

    if (!['approve', 'hide', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Action must be one of: approve, hide, delete' }, { status: 400 })
    }

    // Check review exists
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, reviewer_id')
      .eq('id', id)
      .single()

    if (fetchError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (action === 'delete') {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Review deleted' })
    }

    const updateData = action === 'approve'
      ? { status: 'approved', moderated_by: admin.id, moderated_at: new Date().toISOString() }
      : { status: 'hidden', hidden_by: admin.id, hidden_at: new Date().toISOString(), hide_reason: reason || null }

    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Notify review author if hidden
    if (action === 'hide') {
      await supabase.from('notifications').insert({
        user_id: (review as Record<string, unknown>).reviewer_id,
        type: 'moderation',
        title: 'Отзыв скрыт',
        body: reason || 'Ваш отзыв был скрыт модератором',
        data: { review_id: id },
      })
    }

    return NextResponse.json({ success: true, review: data, action })
  } catch (error) {
    console.error('Review moderation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
