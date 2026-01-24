// @ts-nocheck
/**
 * Advanced Shift Search
 * POST /api/shifts/search - Search with complex filters
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchShiftsSchema, validate, formatErrors } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate search params
    const validation = validate(searchShiftsSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const params = validation.data
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
      `, { count: 'exact' })
      .in('status', ['published', 'active'])

    // Text search
    if (params.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`)
    }

    // Location filters
    if (params.city) {
      query = query.eq('city', params.city)
    }

    // Date filters
    if (params.date) {
      query = query.eq('date', params.date)
    } else {
      if (params.date_from) {
        query = query.gte('date', params.date_from)
      }
      if (params.date_to) {
        query = query.lte('date', params.date_to)
      }
    }

    // Rate filters
    if (params.min_rate) {
      query = query.gte('base_rate', params.min_rate)
    }
    if (params.max_rate) {
      query = query.lte('base_rate', params.max_rate)
    }

    // Urgency filter
    if (params.urgency && params.urgency.length > 0) {
      query = query.in('urgency', params.urgency)
    }

    // Boolean filters
    if (params.needs_car !== undefined) {
      query = query.eq('needs_car', params.needs_car)
    }
    if (params.needs_tools !== undefined) {
      query = query.eq('needs_tools', params.needs_tools)
    }
    if (params.instant_only) {
      query = query.eq('is_instant', true)
    }

    // Skills filter (array contains)
    if (params.skills && params.skills.length > 0) {
      query = query.overlaps('required_skills', params.skills)
    }

    // Specialization filter
    if (params.specialization) {
      query = query.eq('specialization', params.specialization)
    }

    // Verified employers only
    if (params.verified_only) {
      // This requires a join filter which Supabase doesn't support directly
      // We'll filter in memory for now (not ideal for large datasets)
    }

    // Pagination
    const page = params.page || 1
    const limit = params.limit || 20
    const offset = (page - 1) * limit

    // Sorting
    const sortBy = params.sort_by || 'created_at'
    const sortOrder = params.sort_order === 'asc'

    query = query
      .order(sortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1)

    const { data: shifts, error, count } = await query

    if (error) {
      console.error('Search shifts error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    // Post-filter for verified only if needed
    let filteredShifts = shifts || []
    if (params.verified_only) {
      filteredShifts = filteredShifts.filter(
        (s: Record<string, unknown>) => (s.employer_profile as Record<string, unknown>)?.is_verified_company
      )
    }

    return NextResponse.json({
      shifts: filteredShifts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      filters: params,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
