// @ts-nocheck
/**
 * Stripe Subscription Webhook Handler
 * POST /api/subscriptions/webhook
 *
 * Handles subscription-specific events:
 * - checkout.session.completed → activate subscription
 * - customer.subscription.updated → update plan
 * - customer.subscription.deleted → cancel subscription
 * - invoice.payment_failed → notify user
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'

const WEBHOOK_SECRET = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET

/**
 * Verify webhook signature
 */
function verifySignature(payload: string, signature: string): Stripe.Event {
  if (!WEBHOOK_SECRET) {
    throw new Error('Webhook secret not configured')
  }
  return stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET)
}

/**
 * Handle checkout.session.completed
 * Activates the subscription after successful payment
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabaseAdmin = createAdminClient()
  const userId = session.metadata?.user_id
  const plan = session.metadata?.plan as 'pro' | 'business'
  const billingPeriod = session.metadata?.billing_period || 'monthly'

  if (!userId || !plan) {
    console.error('Missing user_id or plan in checkout session metadata')
    return
  }

  // Get the subscription from the session
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id

  if (!subscriptionId) {
    console.error('No subscription ID in checkout session')
    return
  }

  // Retrieve the full subscription object
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const startDate = new Date(subscription.current_period_start * 1000).toISOString()
  const endDate = new Date(subscription.current_period_end * 1000).toISOString()
  const price = subscription.items.data[0]?.price?.unit_amount || 0

  // Deactivate any existing subscription for this user
  await supabaseAdmin
    .from('subscriptions')
    .update({ is_active: false } as any)
    .eq('user_id', userId)
    .eq('is_active', true)

  // Create new subscription record
  await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan,
      billing_period: billingPeriod,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      status: 'active',
      price,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
    } as any)

  // Update user profile with plan info
  if (plan === 'pro') {
    await supabaseAdmin
      .from('worker_profiles')
      .update({
        is_pro: true,
        pro_expires_at: endDate,
      } as any)
      .eq('id', userId)
  } else if (plan === 'business') {
    await supabaseAdmin
      .from('employer_profiles')
      .update({
        plan: 'business',
        plan_expires_at: endDate,
      } as any)
      .eq('id', userId)
  }

  // Create notification
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'subscription',
      title: 'Подписка активирована',
      body: `Ваш план ${plan.toUpperCase()} успешно активирован.`,
      data: { plan, subscription_id: subscriptionId },
    } as any)
}

/**
 * Handle customer.subscription.updated
 * Updates plan when subscription changes
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabaseAdmin = createAdminClient()
  const userId = subscription.metadata?.user_id
  const plan = subscription.metadata?.plan as 'pro' | 'business'

  if (!userId) return

  const endDate = new Date(subscription.current_period_end * 1000).toISOString()
  const status = subscription.cancel_at_period_end ? 'canceled' : 'active'

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status,
      end_date: endDate,
      plan: plan || undefined,
      price: subscription.items.data[0]?.price?.unit_amount || 0,
    } as any)
    .eq('stripe_subscription_id', subscription.id)

  // Update profile
  if (plan === 'pro') {
    await supabaseAdmin
      .from('worker_profiles')
      .update({
        is_pro: status === 'active',
        pro_expires_at: endDate,
      } as any)
      .eq('id', userId)
  } else if (plan === 'business') {
    await supabaseAdmin
      .from('employer_profiles')
      .update({
        plan: status === 'active' ? 'business' : 'free',
        plan_expires_at: endDate,
      } as any)
      .eq('id', userId)
  }
}

/**
 * Handle customer.subscription.deleted
 * Deactivates subscription
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabaseAdmin = createAdminClient()
  const userId = subscription.metadata?.user_id

  // Deactivate subscription
  await supabaseAdmin
    .from('subscriptions')
    .update({
      is_active: false,
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    } as any)
    .eq('stripe_subscription_id', subscription.id)

  if (userId) {
    // Reset profiles to free plan
    await supabaseAdmin
      .from('worker_profiles')
      .update({ is_pro: false, pro_expires_at: null } as any)
      .eq('id', userId)

    await supabaseAdmin
      .from('employer_profiles')
      .update({ plan: 'free', plan_expires_at: null } as any)
      .eq('id', userId)

    // Notify user
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'subscription',
        title: 'Подписка отменена',
        body: 'Ваша подписка была отменена. Вы переведены на бесплатный план.',
        data: { subscription_id: subscription.id },
      } as any)
  }
}

/**
 * Handle invoice.payment_failed
 * Notifies user about failed payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabaseAdmin = createAdminClient()
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id

  if (!customerId) return

  // Find user by stripe customer ID
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) return

  // Update subscription status
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id

  if (subscriptionId) {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'past_due' } as any)
      .eq('stripe_subscription_id', subscriptionId)
  }

  // Notify user
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: profile.id,
      type: 'payment',
      title: 'Ошибка оплаты подписки',
      body: 'Не удалось списать оплату за подписку. Пожалуйста, обновите платежные данные.',
      data: { invoice_id: invoice.id },
    } as any)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = verifySignature(body, signature)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription') {
          await handleCheckoutCompleted(session)
        }
        break
      }

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled subscription webhook event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Subscription webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
