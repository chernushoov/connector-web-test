// @ts-nocheck
/**
 * Single Review API
 * GET /api/reviews/[id] - Get review details
 * DELETE /api/reviews/[id] - Delete review (within 24h)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET - Get review details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(
          id,
          full_name,
          avatar_url,
          user_type
        ),
        reviewee:profiles!reviews_reviewee_id_fkey(
          id,
          full_name,
          avatar_url,
          user_type
        ),
        task_flow:task_flows!reviews_task_flow_id_fkey(
          id,
          shift:shifts!task_flows_shift_id_fkey(
            id,
            title,
            city,
            date
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Get review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete review (only by reviewer, within 24 hours)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Get review
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('reviewer_id, created_at')
      .eq('id', id)
      .single()

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (review.reviewer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      )
    }

    // Check if within 24 hours
    const createdAt = new Date(review.created_at)
    const now = new Date()
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      return NextResponse.json(
        { error: 'Reviews can only be deleted within 24 hours of creation' },
        { status: 400 }
      )
    }

    // Delete review
    const { error: deleteError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete review error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    })
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
