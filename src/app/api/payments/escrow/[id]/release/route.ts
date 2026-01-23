/**
 * Release Escrow to Worker
 * POST /api/payments/escrow/[id]/release
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { transferToWorker } from '@/lib/stripe/connect'
import { releaseEscrowSchema, validate, formatErrors } from '@/lib/validators'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST - Release escrow funds to worker
 */
export async function POST(
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
    const validation = validate(releaseEscrowSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Get escrow details
    const { data: escrow } = await supabaseAdmin
      .from('escrow_transactions')
      .select(`
        *,
        task_flow:task_flows!escrow_transactions_task_flow_id_fkey(
          id,
          status,
          worker_id
        ),
        worker:worker_profiles!escrow_transactions_worker_id_fkey(
          stripe_account_id
        )
      `)
      .eq('id', id)
      .single()

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      )
    }

    // Verify employer
    if (escrow.employer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the employer can release funds' },
        { status: 403 }
      )
    }

    // Check escrow status
    if (escrow.status !== 'escrowed') {
      return NextResponse.json(
        { error: `Cannot release escrow with status: ${escrow.status}` },
        { status: 400 }
      )
    }

    // Check task flow status
    const taskFlowStatus = (escrow.task_flow as Record<string, unknown>).status
    if (!['completed', 'awaiting_review', 'reviewed'].includes(taskFlowStatus as string)) {
      return NextResponse.json(
        { error: 'Task must be completed before releasing funds' },
        { status: 400 }
      )
    }

    // Check worker has Stripe account
    const workerStripeAccountId = (escrow.worker as Record<string, unknown>)?.stripe_account_id as string
    if (!workerStripeAccountId) {
      return NextResponse.json(
        { error: 'Worker has not set up payment account' },
        { status: 400 }
      )
    }

    // Calculate release amount (with optional deductions)
    const releaseAmount = validation.data.amount || escrow.worker_amount

    // Transfer to worker via Stripe Connect
    const transfer = await transferToWorker({
      amount: releaseAmount,
      workerStripeAccountId,
      taskFlowId: (escrow.task_flow as Record<string, unknown>).id as string,
      escrowId: id,
    })

    // Update escrow status
    await supabaseAdmin
      .from('escrow_transactions')
      .update({
        status: 'released',
        stripe_transfer_id: transfer.id,
        released_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Update task flow
    await supabaseAdmin
      .from('task_flows')
      .update({
        status: 'paid',
        payment_status: 'released',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', (escrow.task_flow as Record<string, unknown>).id)

    // Notify worker
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: escrow.worker_id,
        type: 'payment',
        title: 'Оплата получена!',
        body: `Вам переведено ${releaseAmount} ILS за выполненную работу`,
        data: {
          escrow_id: id,
          amount: releaseAmount,
          transfer_id: transfer.id,
        },
      })

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        amount: releaseAmount,
      },
      message: 'Funds released successfully',
    })
  } catch (error) {
    console.error('Release escrow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
