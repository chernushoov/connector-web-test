import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = withAdminAuth(request)
  if ('error' in auth) return auth.error

  const { supabase, admin } = auth

  try {
    const { reason, amount } = await request.json()

    // Get escrow payment
    const { data: payment, error: fetchError } = await supabase
      .from('escrow_payments')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if ((payment as any).status === 'refunded') {
      return NextResponse.json({ error: 'Already refunded' }, { status: 400 })
    }

    // Process refund via Stripe
    const refundAmount = amount || (payment as any).amount
    const refund = await stripe.refunds.create({
      payment_intent: (payment as any).stripe_payment_intent_id,
      amount: Math.round(refundAmount * 100),
      reason: 'requested_by_customer',
    })

    // Update escrow status
    const { data, error } = await supabase
      .from('escrow_payments')
      .update({
        status: 'refunded',
        refunded_by: admin.id,
        refunded_at: new Date().toISOString(),
        refund_reason: reason || null,
        refund_amount: refundAmount,
        stripe_refund_id: refund.id,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ payment: data, refund: { id: refund.id, amount: refundAmount } })
  } catch (error: any) {
    console.error('Payment refund error:', error)

    if (error?.type === 'StripeError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
