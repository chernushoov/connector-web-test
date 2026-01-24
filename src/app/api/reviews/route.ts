// @ts-nocheck
/**
 * Reviews API
 * GET /api/reviews - Get reviews (with filters)
 * POST /api/reviews - Create review
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createReviewSchema, validate, formatErrors } from '@/lib/validators'

/**
 * GET - Get reviews with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()

    let query = supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        reviewee:profiles!reviews_reviewee_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        task_flow:task_flows!reviews_task_flow_id_fkey(
          shift:shifts!task_flows_shift_id_fkey(
            id,
            title
          )
        )
      `)

    // Filter by reviewee (user being reviewed)
    const revieweeId = searchParams.get('reviewee_id')
    if (revieweeId) {
      query = query.eq('reviewee_id', revieweeId)
    }

    // Filter by reviewer
    const reviewerId = searchParams.get('reviewer_id')
    if (reviewerId) {
      query = query.eq('reviewer_id', reviewerId)
    }

    // Filter by task flow
    const taskFlowId = searchParams.get('task_flow_id')
    if (taskFlowId) {
      query = query.eq('task_flow_id', taskFlowId)
    }

    // Filter by rating
    const minRating = searchParams.get('min_rating')
    if (minRating) {
      query = query.gte('rating', parseInt(minRating))
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: reviews, error, count } = await query

    if (error) {
      console.error('Get reviews error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reviews: reviews || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create review after completed task
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = validate(createReviewSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const { task_flow_id, rating, comment, tags } = validation.data
    const supabaseAdmin = createAdminClient()

    // Get task flow
    const { data: taskFlow } = await supabaseAdmin
      .from('task_flows')
      .select('worker_id, employer_id, status')
      .eq('id', task_flow_id)
      .single()

    if (!taskFlow) {
      return NextResponse.json(
        { error: 'Task flow not found' },
        { status: 404 }
      )
    }

    // Verify user is part of the task
    const isWorker = taskFlow.worker_id === user.id
    const isEmployer = taskFlow.employer_id === user.id

    if (!isWorker && !isEmployer) {
      return NextResponse.json(
        { error: 'You are not part of this task' },
        { status: 403 }
      )
    }

    // Check task is completed
    if (!['completed', 'awaiting_review', 'reviewed', 'paid'].includes(taskFlow.status)) {
      return NextResponse.json(
        { error: 'Can only review completed tasks' },
        { status: 400 }
      )
    }

    // Determine reviewee (who is being reviewed)
    const revieweeId = isWorker ? taskFlow.employer_id : taskFlow.worker_id

    // Check if already reviewed
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('task_flow_id', task_flow_id)
      .eq('reviewer_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this task' },
        { status: 400 }
      )
    }

    // Create review
    const { data: review, error: createError } = await supabaseAdmin
      .from('reviews')
      .insert({
        task_flow_id,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment,
        tags: tags || [],
      })
      .select()
      .single()

    if (createError) {
      console.error('Create review error:', createError)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    // Update task flow status if both parties reviewed
    const { data: allReviews } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('task_flow_id', task_flow_id)

    if (allReviews && allReviews.length >= 2) {
      await supabaseAdmin
        .from('task_flows')
        .update({ status: 'reviewed', updated_at: new Date().toISOString() })
        .eq('id', task_flow_id)
    } else {
      await supabaseAdmin
        .from('task_flows')
        .update({ status: 'awaiting_review', updated_at: new Date().toISOString() })
        .eq('id', task_flow_id)
    }

    // Update reviewee's rating (trigger should handle this, but fallback)
    // The update_review_stats trigger in PostgreSQL will recalculate

    // Notify reviewee
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: revieweeId,
        type: 'review',
        title: 'Новый отзыв',
        body: `Вы получили оценку ${rating}/5`,
        data: {
          review_id: review.id,
          task_flow_id,
          rating,
        },
      })

    return NextResponse.json({
      success: true,
      review,
    }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
