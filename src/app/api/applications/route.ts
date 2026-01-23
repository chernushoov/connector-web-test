/**
 * Applications API (task_flows)
 * GET /api/applications - Get my applications
 * POST /api/applications - Apply to a shift
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applyToShiftSchema, validate, formatErrors } from '@/lib/validators'

/**
 * GET - Get current user's applications
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const supabase = await createClient()

    // Check user type
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_mode')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Build query based on user type
    let query = supabase
      .from('task_flows')
      .select(`
        *,
        shift:shifts!task_flows_shift_id_fkey(
          id,
          title,
          city,
          address,
          date,
          start_time,
          end_time,
          base_rate,
          final_rate,
          status
        ),
        worker:profiles!task_flows_worker_id_fkey(
          id,
          full_name,
          avatar_url,
          is_verified
        ),
        worker_profile:worker_profiles!task_flows_worker_id_fkey(
          rating,
          review_count,
          skills
        ),
        employer:profiles!task_flows_employer_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        employer_profile:employer_profiles!task_flows_employer_id_fkey(
          company_name,
          company_logo
        )
      `)

    // Filter based on user type
    if (profile.current_mode === 'worker') {
      query = query.eq('worker_id', user.id)
    } else {
      query = query.eq('employer_id', user.id)
    }

    // Status filter
    const status = searchParams.get('status')
    if (status) {
      const statuses = status.split(',') as any[]
      query = query.in('status', statuses)
    }

    // Date filter (for shift date)
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    // Note: Date filtering on joined table requires post-processing

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: applications, error, count } = await query

    if (error) {
      console.error('Get applications error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      applications: applications || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      userType: profile.current_mode,
    })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Apply to a shift (workers only)
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
    const validation = validate(applyToShiftSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const { shift_id, agreed_rate, application_message } = validation.data
    const supabaseAdmin = createAdminClient()

    // Verify user is a worker
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('current_mode, is_verified')
      .eq('id', user.id)
      .single()

    if (!profile || profile.current_mode !== 'worker') {
      return NextResponse.json(
        { error: 'Only workers can apply to shifts' },
        { status: 403 }
      )
    }

    // Check if shift exists and is open
    const { data: shift } = await supabaseAdmin
      .from('shifts')
      .select('id, employer_id, status, slots, filled, min_rating')
      .eq('id', shift_id)
      .single()

    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    if (!['published', 'active'].includes(shift.status)) {
      return NextResponse.json(
        { error: 'Shift is not accepting applications' },
        { status: 400 }
      )
    }

    if (shift.filled >= shift.slots) {
      return NextResponse.json(
        { error: 'Shift is fully booked' },
        { status: 400 }
      )
    }

    // Check if already applied
    const { data: existingApplication } = await supabaseAdmin
      .from('task_flows')
      .select('id, status')
      .eq('shift_id', shift_id)
      .eq('worker_id', user.id)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this shift', applicationId: existingApplication.id },
        { status: 400 }
      )
    }

    // Check worker rating if minimum required
    if (shift.min_rating > 0) {
      const { data: workerProfile } = await supabaseAdmin
        .from('worker_profiles')
        .select('rating')
        .eq('id', user.id)
        .single()

      if (!workerProfile || (workerProfile.rating || 0) < shift.min_rating) {
        return NextResponse.json(
          { error: `This shift requires a minimum rating of ${shift.min_rating}` },
          { status: 400 }
        )
      }
    }

    // Create application (task_flow)
    const { data: application, error: createError } = await supabaseAdmin
      .from('task_flows')
      .insert({
        shift_id,
        worker_id: user.id,
        employer_id: shift.employer_id,
        status: 'applied',
        agreed_rate,
        application_message,
      })
      .select()
      .single()

    if (createError) {
      console.error('Create application error:', createError)
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      )
    }

    // Create notification for employer
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: shift.employer_id,
        type: 'application',
        title: 'Новая заявка',
        body: 'Работник подал заявку на вашу смену',
        data: {
          shift_id,
          task_flow_id: application.id,
          worker_id: user.id,
        },
      })

    return NextResponse.json({
      success: true,
      application,
      message: 'Application submitted successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Apply error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
