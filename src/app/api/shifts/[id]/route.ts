/**
 * Single Shift API
 * GET /api/shifts/[id] - Get shift details
 * PATCH /api/shifts/[id] - Update shift (owner only)
 * DELETE /api/shifts/[id] - Delete/cancel shift (owner only)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateShiftSchema, validate, formatErrors } from '@/lib/validators'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET - Get shift details with applications count
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const currentUser = await getUser()
    const supabase = await createClient()

    // Get shift with employer info
    const { data: shift, error } = await supabase
      .from('shifts')
      .select(`
        *,
        employer:profiles!shifts_employer_id_fkey(
          id,
          full_name,
          avatar_url,
          is_verified,
          city
        ),
        employer_profile:employer_profiles!shifts_employer_id_fkey(
          company_name,
          company_logo,
          company_description,
          rating,
          review_count,
          is_verified_company,
          total_jobs_posted
        )
      `)
      .eq('id', id)
      .single()

    if (error || !shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    // Get applications count
    const { count: applicationsCount } = await supabase
      .from('task_flows')
      .select('*', { count: 'exact', head: true })
      .eq('shift_id', id)

    // Check if current user has applied
    let userApplication = null
    if (currentUser) {
      const { data } = await supabase
        .from('task_flows')
        .select('id, status, agreed_rate, application_message')
        .eq('shift_id', id)
        .eq('worker_id', currentUser.id)
        .single()
      userApplication = data
    }

    // Check if user is the owner
    const isOwner = currentUser?.id === shift.employer_id

    // If owner, get all applications
    let applications = null
    if (isOwner) {
      const { data } = await supabase
        .from('task_flows')
        .select(`
          id,
          status,
          agreed_rate,
          application_message,
          created_at,
          worker:profiles!task_flows_worker_id_fkey(
            id,
            full_name,
            avatar_url,
            is_verified
          ),
          worker_profile:worker_profiles!task_flows_worker_id_fkey(
            rating,
            review_count,
            total_jobs,
            experience_years,
            skills
          )
        `)
        .eq('shift_id', id)
        .order('created_at', { ascending: false })

      applications = data
    }

    return NextResponse.json({
      shift,
      applicationsCount: applicationsCount || 0,
      userApplication,
      isOwner,
      applications: isOwner ? applications : null,
    })
  } catch (error) {
    console.error('Get shift error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update shift (owner only)
 */
export async function PATCH(
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

    // Check ownership
    const { data: shift } = await supabaseAdmin
      .from('shifts')
      .select('employer_id, status')
      .eq('id', id)
      .single()

    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    if (shift.employer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own shifts' },
        { status: 403 }
      )
    }

    // Cannot edit completed or cancelled shifts
    if (['completed', 'cancelled'].includes(shift.status)) {
      return NextResponse.json(
        { error: 'Cannot edit completed or cancelled shifts' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate update data
    const validation = validate(updateShiftSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    }

    // Recalculate final_rate if base_rate or surge_multiplier changed
    if (updateData.base_rate || updateData.surge_multiplier) {
      const { data: currentShift } = await supabaseAdmin
        .from('shifts')
        .select('base_rate, surge_multiplier')
        .eq('id', id)
        .single()

      if (currentShift) {
        const baseRate = updateData.base_rate || currentShift.base_rate
        const surgeMultiplier = updateData.surge_multiplier || currentShift.surge_multiplier
        updateData.final_rate = baseRate * surgeMultiplier
      }
    }

    const { data: updatedShift, error: updateError } = await supabaseAdmin
      .from('shifts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update shift error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update shift' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      shift: updatedShift,
    })
  } catch (error) {
    console.error('Update shift error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Cancel/delete shift (owner only)
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

    // Check ownership and current status
    const { data: shift } = await supabaseAdmin
      .from('shifts')
      .select('employer_id, status, filled_slots')
      .eq('id', id)
      .single()

    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    if (shift.employer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own shifts' },
        { status: 403 }
      )
    }

    // If shift has workers assigned, cancel instead of delete
    if (shift.filled_slots > 0 || shift.status === 'active') {
      // Cancel shift and notify workers
      const { error: cancelError } = await supabaseAdmin
        .from('shifts')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (cancelError) {
        return NextResponse.json(
          { error: 'Failed to cancel shift' },
          { status: 500 }
        )
      }

      // TODO: Notify workers about cancellation
      // TODO: Process refunds if payments were made

      return NextResponse.json({
        success: true,
        message: 'Shift cancelled successfully',
        action: 'cancelled',
      })
    }

    // Delete draft/unpublished shifts without workers
    const { error: deleteError } = await supabaseAdmin
      .from('shifts')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete shift error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete shift' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Shift deleted successfully',
      action: 'deleted',
    })
  } catch (error) {
    console.error('Delete shift error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
