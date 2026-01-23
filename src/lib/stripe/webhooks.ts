// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stripe Webhook Handlers
 * Note: Type checking disabled for Supabase operations
 * Types will be enforced at runtime when connected to real Supabase
 */
import Stripe from 'stripe'
import { stripe } from './client'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Verify webhook signature
 */
export function constructEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Handle payment_intent.succeeded
 */
export async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { task_flow_id, shift_id, worker_id } = paymentIntent.metadata
  const supabaseAdmin = createAdminClient()

  if (!task_flow_id) {
    console.error('Missing task_flow_id in payment metadata')
    return
  }

  // Update escrow status
  await supabaseAdmin
    .from('escrow_transactions')
    .update({
      status: 'escrowed',
      escrowed_at: new Date().toISOString(),
    } as any)
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Update task flow payment status
  await supabaseAdmin
    .from('task_flows')
    .update({
      payment_status: 'escrowed',
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', task_flow_id)

  // Create notification for worker
  if (worker_id) {
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: worker_id,
        type: 'payment',
        title: 'Оплата получена',
        body: 'Работодатель оплатил смену. Средства будут переведены после завершения работы.',
        data: { task_flow_id, shift_id },
      } as any)
  }
}

/**
 * Handle payment_intent.payment_failed
 */
export async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { task_flow_id, employer_id } = paymentIntent.metadata
  const supabaseAdmin = createAdminClient()

  if (!task_flow_id) return

  // Update escrow status
  await supabaseAdmin
    .from('escrow_transactions')
    .update({ status: 'pending' } as any)
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Update task flow
  await supabaseAdmin
    .from('task_flows')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', task_flow_id)

  // Notify employer
  if (employer_id) {
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: employer_id,
        type: 'payment',
        title: 'Ошибка оплаты',
        body: 'Не удалось провести платеж. Пожалуйста, попробуйте снова.',
        data: { task_flow_id },
      } as any)
  }
}

/**
 * Handle transfer.created (payout to worker)
 */
export async function handleTransferCreated(transfer: Stripe.Transfer) {
  const { escrow_id, task_flow_id } = transfer.metadata
  const supabaseAdmin = createAdminClient()

  if (!escrow_id) return

  // Update escrow status
  await supabaseAdmin
    .from('escrow_transactions')
    .update({
      status: 'released',
      stripe_transfer_id: transfer.id,
      released_at: new Date().toISOString(),
    } as any)
    .eq('id', escrow_id)

  // Update task flow
  if (task_flow_id) {
    await supabaseAdmin
      .from('task_flows')
      .update({
        status: 'paid',
        payment_status: 'released',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', task_flow_id)
  }
}

/**
 * Handle customer.subscription.created
 */
export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id
  const plan = subscription.metadata.plan as 'pro' | 'business'
  const supabaseAdmin = createAdminClient()

  if (!userId || !plan) return

  // Get subscription period dates
  const startDate = new Date((subscription as any).current_period_start * 1000).toISOString()
  const endDate = new Date((subscription as any).current_period_end * 1000).toISOString()
  const price = subscription.items.data[0]?.price?.unit_amount || 0

  // Create subscription record
  await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan,
      stripe_subscription_id: subscription.id,
      start_date: startDate,
      end_date: endDate,
      price,
      is_active: true,
    } as any)

  // Update profile plan based on type
  if (plan === 'pro') {
    await supabaseAdmin
      .from('worker_profiles')
      .update({
        is_pro: true,
        pro_expires_at: endDate,
      } as any)
      .eq('id', userId)
  } else {
    await supabaseAdmin
      .from('employer_profiles')
      .update({
        plan,
        plan_expires_at: endDate,
      } as any)
      .eq('id', userId)
  }
}

/**
 * Handle customer.subscription.deleted
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabaseAdmin = createAdminClient()

  // Deactivate subscription
  await supabaseAdmin
    .from('subscriptions')
    .update({ is_active: false } as any)
    .eq('stripe_subscription_id', subscription.id)

  const userId = subscription.metadata.user_id
  if (userId) {
    // Reset profile to free plan
    await supabaseAdmin
      .from('worker_profiles')
      .update({ is_pro: false, pro_expires_at: null } as any)
      .eq('id', userId)

    await supabaseAdmin
      .from('employer_profiles')
      .update({ plan: 'free', plan_expires_at: null } as any)
      .eq('id', userId)
  }
}

/**
 * Handle charge.refunded
 */
export async function handleChargeRefunded(charge: Stripe.Charge) {
  const supabaseAdmin = createAdminClient()
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) return

  // Update escrow status
  await supabaseAdmin
    .from('escrow_transactions')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
    } as any)
    .eq('stripe_payment_intent_id', paymentIntentId)
}
