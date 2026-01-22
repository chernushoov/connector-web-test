/**
 * Single Application API
 * GET /api/applications/[id] - Get application details
 * PATCH /api/applications/[id] - Update application status
 * DELETE /api/applications/[id] - Cancel/withdraw application
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateApplicationSchema, validate, formatErrors } from '@/lib/validators'
import { NotificationsModule } from '@/lib/agent/modules/notifications'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET - Get application details
 */
export async function GET(
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

    const supabase = await createClient()

    const { data: application, error } = await supabase
      .from('task_flows')
      .select(`
        *,
        shift:shifts!task_flows_shift_id_fkey(*),
        worker:profiles!task_flows_worker_id_fkey(
          id,
          full_name,
          avatar_url,
          phone,
          is_verified
        ),
        worker_profile:worker_profiles!task_flows_worker_id_fkey(*),
        employer:profiles!task_flows_employer_id_fkey(
          id,
          full_name,
          avatar_url,
          phone
        ),
        employer_profile:employer_profiles!task_flows_employer_id_fkey(*),
        escrow:escrow_transactions!escrow_transactions_task_flow_id_fkey(*)
      `)
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if user has access (is worker or employer)
    if (application.worker_id !== user.id && application.employer_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get reviews for this task flow if completed
    let reviews = null
    if (['completed', 'paid', 'reviewed'].includes(application.status)) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('task_flow_id', id)

      reviews = data
    }

    return NextResponse.json({
      application,
      reviews,
      isWorker: application.worker_id === user.id,
      isEmployer: application.employer_id === user.id,
    })
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update application status
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

    const body = await request.json()

    // Validate input
    const validation = validate(updateApplicationSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Get current application
    const { data: application } = await supabaseAdmin
      .from('task_flows')
      .select('*, shift:shifts!task_flows_shift_id_fkey(employer_id, filled_slots, slots)')
      .eq('id', id)
      .single()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify permissions based on action
    const isWorker = application.worker_id === user.id
    const isEmployer = application.employer_id === user.id

    if (!isWorker && !isEmployer) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { status: newStatus, hours_worked, total_amount } = validation.data

    // Status transition validation
    const allowedTransitions = getStatusTransitions(application.status, isEmployer)
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${application.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    // Handle specific status transitions
    if (newStatus === 'approved') {
      updateData.approved_at = new Date().toISOString()

      // Increment filled_slots on shift
      await supabaseAdmin
        .from('shifts')
        .update({
          filled_slots: (application.shift as Record<string, unknown>).filled_slots as number + 1,
        })
        .eq('id', application.shift_id)
    }

    if (newStatus === 'in_progress') {
      updateData.started_at = new Date().toISOString()
    }

    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString()
      if (hours_worked) updateData.hours_worked = hours_worked
      if (total_amount) updateData.total_amount = total_amount
    }

    if (newStatus === 'rejected' || newStatus === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()

      // If was approved, decrement filled_slots
      if (application.status === 'approved' || application.status === 'upcoming') {
        await supabaseAdmin
          .from('shifts')
          .update({
            filled_slots: Math.max(0, (application.shift as Record<string, unknown>).filled_slots as number - 1),
          })
          .eq('id', application.shift_id)
      }
    }

    // Update application
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('task_flows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update application error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      )
    }

    // Create notification for the other party
    const notifyUserId = isEmployer ? application.worker_id : application.employer_id
    const notificationMessages: Record<string, { title: string; body: string }> = {
      approved: { title: 'Заявка одобрена!', body: 'Работодатель принял вашу заявку' },
      rejected: { title: 'Заявка отклонена', body: 'К сожалению, ваша заявка отклонена' },
      in_progress: { title: 'Работа началась', body: 'Работник начал выполнение смены' },
      completed: { title: 'Работа завершена', body: 'Смена отмечена как завершённая' },
      cancelled: { title: 'Заявка отменена', body: 'Заявка была отменена' },
    }

    const notification = notificationMessages[newStatus]
    if (notification) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: notifyUserId,
          type: 'application',
          title: notification.title,
          body: notification.body,
          data: {
            task_flow_id: id,
            shift_id: application.shift_id,
            new_status: newStatus,
          },
        })

      // Agent: send push notification
      try {
        await NotificationsModule.sendNotification({
          userId: notifyUserId,
          type: newStatus === 'approved' ? 'application_approved' : 'application_rejected',
          title: notification.title,
          body: notification.body,
          channels: ['push'],
          language: 'ru',
          data: { shift_id: (application as Record<string, unknown>).shift_id as string, status: newStatus },
        })
      } catch {
        // Non-blocking
      }
    }

    return NextResponse.json({
      success: true,
      application: updated,
    })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Withdraw application (workers only, before approval)
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

    // Get application
    const { data: application } = await supabaseAdmin
      .from('task_flows')
      .select('worker_id, status')
      .eq('id', id)
      .single()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Only worker can withdraw
    if (application.worker_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the applicant can withdraw' },
        { status: 403 }
      )
    }

    // Can only withdraw pending applications
    if (!['applied', 'reviewing'].includes(application.status)) {
      return NextResponse.json(
        { error: 'Cannot withdraw at this stage. Please contact support.' },
        { status: 400 }
      )
    }

    // Delete the application
    const { error: deleteError } = await supabaseAdmin
      .from('task_flows')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete application error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to withdraw application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Application withdrawn successfully',
    })
  } catch (error) {
    console.error('Delete application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get allowed status transitions based on current status and user role
 */
function getStatusTransitions(currentStatus: string, isEmployer: boolean): string[] {
  const transitions: Record<string, { employer: string[]; worker: string[] }> = {
    applied: {
      employer: ['reviewing', 'approved', 'rejected'],
      worker: ['cancelled'],
    },
    reviewing: {
      employer: ['approved', 'rejected'],
      worker: ['cancelled'],
    },
    approved: {
      employer: ['cancelled'],
      worker: ['upcoming', 'cancelled'],
    },
    upcoming: {
      employer: ['cancelled'],
      worker: ['in_progress', 'cancelled'],
    },
    in_progress: {
      employer: ['completed'],
      worker: ['completed'],
    },
    completed: {
      employer: ['awaiting_review', 'disputed'],
      worker: ['awaiting_review', 'disputed'],
    },
    awaiting_review: {
      employer: ['reviewed', 'payment_pending'],
      worker: ['reviewed'],
    },
    reviewed: {
      employer: ['payment_pending'],
      worker: [],
    },
    payment_pending: {
      employer: ['paid'],
      worker: [],
    },
  }

  const allowed = transitions[currentStatus]
  if (!allowed) return []

  return isEmployer ? allowed.employer : allowed.worker
}
