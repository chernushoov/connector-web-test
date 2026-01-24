// @ts-nocheck
/**
 * Escrow Payments API
 * POST /api/payments/escrow - Create escrow for a task
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPaymentIntent } from '@/lib/stripe/connect'
import { createEscrowSchema, validate, formatErrors } from '@/lib/validators'

/**
 * POST - Create escrow payment for approved task
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
    const validation = validate(createEscrowSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const { task_flow_id, amount } = validation.data
    const supabaseAdmin = createAdminClient()

    // Get task flow details
    const { data: taskFlow } = await supabaseAdmin
      .from('task_flows')
      .select(`
        *,
        shift:shifts!task_flows_shift_id_fkey(id, title, employer_id),
        worker:worker_profiles!task_flows_worker_id_fkey(stripe_account_id)
      `)
      .eq('id', task_flow_id)
      .single()

    if (!taskFlow) {
      return NextResponse.json(
        { error: 'Task flow not found' },
        { status: 404 }
      )
    }

    // Verify user is the employer
    if ((taskFlow.shift as Record<string, unknown>).employer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the employer can create escrow payments' },
        { status: 403 }
      )
    }

    // Check if task flow is in correct status
    if (!['approved', 'upcoming'].includes(taskFlow.status)) {
      return NextResponse.json(
        { error: 'Escrow can only be created for approved tasks' },
        { status: 400 }
      )
    }

    // Check if escrow already exists
    const { data: existingEscrow } = await supabaseAdmin
      .from('escrow_transactions')
      .select('id, status')
      .eq('task_flow_id', task_flow_id)
      .single()

    if (existingEscrow) {
      return NextResponse.json(
        { error: 'Escrow already exists for this task', escrowId: existingEscrow.id },
        { status: 400 }
      )
    }

    // Get employer's Stripe customer ID
    const { data: employerProfile } = await supabaseAdmin
      .from('employer_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    // Create Stripe payment intent
    const paymentResult = await createPaymentIntent({
      amount,
      employerId: user.id,
      workerId: taskFlow.worker_id,
      shiftId: taskFlow.shift_id,
      taskFlowId: task_flow_id,
      customerStripeId: employerProfile?.stripe_customer_id || undefined,
    })

    // Create escrow record
    const { data: escrow, error: escrowError } = await supabaseAdmin
      .from('escrow_transactions')
      .insert({
        task_flow_id,
        employer_id: user.id,
        worker_id: taskFlow.worker_id,
        amount,
        platform_fee: paymentResult.platformFee,
        worker_payout: amount - paymentResult.platformFee,
        status: 'pending',
        stripe_payment_intent_id: paymentResult.paymentIntentId,
      })
      .select()
      .single()

    if (escrowError) {
      console.error('Create escrow error:', escrowError)
      return NextResponse.json(
        { error: 'Failed to create escrow record' },
        { status: 500 }
      )
    }

    // Update task flow payment status
    await supabaseAdmin
      .from('task_flows')
      .update({
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', task_flow_id)

    return NextResponse.json({
      success: true,
      escrow,
      clientSecret: paymentResult.clientSecret,
      paymentIntentId: paymentResult.paymentIntentId,
    }, { status: 201 })
  } catch (error) {
    console.error('Create escrow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
