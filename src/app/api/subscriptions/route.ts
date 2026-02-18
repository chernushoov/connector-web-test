/**
 * Subscriptions API
 * GET /api/subscriptions - Get current user's subscription
 * POST /api/subscriptions - Create Stripe Checkout Session
 * DELETE /api/subscriptions - Cancel subscription
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, SUBSCRIPTION_PRICES, CURRENCY } from '@/lib/stripe/client'
import { createCheckoutSessionSchema, cancelSubscriptionSchema } from '@/lib/validators/subscription'
import { validate, formatErrors } from '@/lib/validators'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Check if Stripe is configured
 */
function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

/**
 * GET - Get current user's active subscription
 */
export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = createAdminClient()

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (error || !subscription) {
      return NextResponse.json({ subscription: null })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Get or create Stripe customer for user
 */
async function getOrCreateCustomer(userId: string, email?: string, phone?: string): Promise<string> {
  const supabaseAdmin = createAdminClient()

  // Check if user already has a stripe_customer_id
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    metadata: { user_id: userId },
    email: email || undefined,
    phone: phone || undefined,
  })

  // Save customer ID to profile
  await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customer.id } as any)
    .eq('id', userId)

  return customer.id
}

/**
 * POST - Create Stripe Checkout Session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Demo mode fallback
    if (!isStripeConfigured()) {
      return NextResponse.json({
        demo: true,
        message: 'Stripe not configured. Running in demo mode.',
        url: `${APP_URL}/profile/subscription?success=true&demo=true`,
      })
    }

    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = validate(createCheckoutSessionSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatErrors(validation.errors) },
        { status: 400 }
      )
    }

    const { plan, billing_period } = validation.data
    const supabaseAdmin = createAdminClient()

    // Check if user already has an active subscription
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, plan, stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    // If upgrading/downgrading, cancel old subscription first
    if (existingSub?.stripe_subscription_id) {
      await stripe.subscriptions.update(existingSub.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(user.id, user.email || undefined, user.phone || undefined)

    // Get price for the plan
    const priceAmount = SUBSCRIPTION_PRICES[plan][billing_period]

    // Create a Stripe Price on-the-fly (or use pre-configured price IDs)
    const price = await stripe.prices.create({
      unit_amount: priceAmount,
      currency: CURRENCY,
      recurring: {
        interval: billing_period === 'yearly' ? 'year' : 'month',
      },
      product_data: {
        name: `Connector ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        metadata: { plan },
      },
    })

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan,
        billing_period,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
          billing_period,
        },
      },
      success_url: `${APP_URL}/profile/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/profile/subscription?cancelled=true`,
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Cancel subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    // Demo mode fallback
    if (!isStripeConfigured()) {
      return NextResponse.json({
        demo: true,
        message: 'Subscription cancelled (demo mode)',
      })
    }

    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let reason: string | undefined
    try {
      const body = await request.json()
      const validation = validate(cancelSubscriptionSchema, body)
      if (validation.success) {
        reason = validation.data.reason
      }
    } catch {
      // Body is optional for DELETE
    }

    const supabaseAdmin = createAdminClient()

    // Find active subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel in Stripe (at period end for graceful cancellation)
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
        metadata: {
          cancel_reason: reason || 'User requested cancellation',
        },
      })
    }

    // Update local record
    await supabaseAdmin
      .from('subscriptions')
      .update({
        canceled_at: new Date().toISOString(),
        cancel_reason: reason || null,
      } as any)
      .eq('id', subscription.id)

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
