/**
 * Shifts API
 * GET /api/shifts - List shifts (with basic filters)
 * POST /api/shifts - Create new shift (employers only)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createShiftSchema, validate, formatErrors } from '@/lib/validators'
import { getAgent } from '@/lib/agent'

/**
 * GET - List shifts with basic filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('shifts')
      .select(`
        *,
        employer:profiles!shifts_employer_id_fkey(
          id,
          full_name,
          avatar_url,
          is_verified
        ),
        employer_profile:employer_profiles!shifts_employer_id_fkey(
          company_name,
          company_logo,
          rating,
          is_verified_company
        )
      `)
      .in('status', ['published', 'active'])

    // Apply filters
    const city = searchParams.get('city')
    if (city) {
      query = query.eq('city', city)
    }

    const date = searchParams.get('date')
    if (date) {
      query = query.eq('date', date)
    }

    const urgency = searchParams.get('urgency')
    if (urgency) {
      query = query.eq('urgency', urgency)
    }

    const minRate = searchParams.get('min_rate')
    if (minRate) {
      query = query.gte('base_rate', parseInt(minRate))
    }

    const maxRate = searchParams.get('max_rate')
    if (maxRate) {
      query = query.lte('base_rate', parseInt(maxRate))
    }

    const specialization = searchParams.get('specialization')
    if (specialization) {
      query = query.eq('specialization', specialization)
    }

    const instantOnly = searchParams.get('instant_only')
    if (instantOnly === 'true') {
      query = query.eq('is_instant', true)
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') === 'asc' ? true : false

    query = query
      .order(sortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1)

    const { data: shifts, error, count } = await query

    if (error) {
      console.error('Shifts query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shifts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      shifts: shifts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get shifts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create new shift (employers only)
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

    // Verify user is an employer
    const supabaseAdmin = createAdminClient()
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_type !== 'employer') {
      return NextResponse.json(
        { error: 'Only employers can create shifts' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = validate(createShiftSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const shiftData = validation.data

    // Create shift
    const { data: shift, error: createError } = await supabaseAdmin
      .from('shifts')
      .insert({
        ...shiftData,
        employer_id: user.id,
        status: 'draft', // Starts as draft, needs moderation
        final_rate: shiftData.base_rate * (shiftData.surge_multiplier || 1),
        filled_slots: 0,
      })
      .select()
      .single()

    if (createError) {
      console.error('Create shift error:', createError)
      return NextResponse.json(
        { error: 'Failed to create shift', message: createError.message },
        { status: 400 }
      )
    }

    // AI Agent: auto-moderate the shift
    try {
      const agent = getAgent()
      agent.start()
      const modResult = await agent.moderateShift({
        id: shift.id,
        title: shiftData.title,
        description: shiftData.description || '',
        requirements: (shiftData as Record<string, unknown>).requirements as string | undefined,
        hourlyRate: shiftData.base_rate,
        employerId: user.id,
        createdAt: new Date(),
      })

      if (modResult && modResult.action === 'approve') {
        await supabaseAdmin
          .from('shifts')
          .update({ status: 'published' })
          .eq('id', shift.id)
        shift.status = 'published'
      } else if (modResult && modResult.action === 'reject') {
        await supabaseAdmin
          .from('shifts')
          .update({ status: 'rejected', rejection_reason: modResult.reasons.join('; ') })
          .eq('id', shift.id)
        shift.status = 'rejected'
      }
    } catch (modError) {
      console.error('[Agent] Moderation error:', modError)
      // Non-blocking: shift stays as draft for manual review
    }

    return NextResponse.json({
      success: true,
      shift,
      message: shift.status === 'published'
        ? 'Shift published'
        : shift.status === 'rejected'
          ? 'Shift rejected by moderation'
          : 'Shift created and pending moderation',
    }, { status: 201 })
  } catch (error) {
    console.error('Create shift error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
