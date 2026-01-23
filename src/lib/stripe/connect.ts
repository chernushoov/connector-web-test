// @ts-nocheck
/**
 * Stripe Connect for Worker Payouts
 */
import { stripe, PLATFORM_FEE_PERCENT, CURRENCY } from './client'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Create a Stripe Connected Account for a worker
 */
export async function createConnectedAccount(
  userId: string,
  email: string,
  phone?: string
) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'IL',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      user_id: userId,
    },
  })

  // Save to database
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin
    .from('worker_profiles')
    .update({ stripe_account_id: account.id } as any)
    .eq('id', userId)

  return account
}

/**
 * Create an account link for onboarding
 */
export async function createAccountLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return accountLink.url
}

/**
 * Get account status
 */
export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId)

  return {
    id: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: account.requirements,
  }
}

/**
 * Create a payment intent for escrow
 */
export async function createPaymentIntent(params: {
  amount: number
  employerId: string
  workerId: string
  shiftId: string
  taskFlowId: string
  customerStripeId?: string
}) {
  const { amount, employerId, workerId, shiftId, taskFlowId, customerStripeId } = params

  const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT / 100)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to agorot
    currency: CURRENCY,
    customer: customerStripeId,
    metadata: {
      employer_id: employerId,
      worker_id: workerId,
      shift_id: shiftId,
      task_flow_id: taskFlowId,
      platform_fee: platformFee.toString(),
    },
    transfer_group: taskFlowId,
  })

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    platformFee,
  }
}

/**
 * Transfer funds to worker
 */
export async function transferToWorker(params: {
  amount: number
  workerStripeAccountId: string
  taskFlowId: string
  escrowId: string
}) {
  const { amount, workerStripeAccountId, taskFlowId, escrowId } = params

  const transfer = await stripe.transfers.create({
    amount: amount * 100, // Convert to agorot
    currency: CURRENCY,
    destination: workerStripeAccountId,
    transfer_group: taskFlowId,
    metadata: {
      escrow_id: escrowId,
      task_flow_id: taskFlowId,
    },
  })

  return transfer
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? amount * 100 : undefined, // If no amount, refund full
    reason: 'requested_by_customer',
    metadata: {
      reason: reason || 'No reason provided',
    },
  })

  return refund
}
