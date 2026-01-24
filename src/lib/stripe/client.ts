/**
 * Stripe Client Configuration
 */
import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      typescript: true,
    })
  }
  return _stripe
}

// Lazy proxy - only initializes Stripe when actually used
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
})

// Platform fee percentage (10%)
export const PLATFORM_FEE_PERCENT = 10

// Currency for Israel
export const CURRENCY = 'ils'

// Subscription prices in ILS (agorot)
export const SUBSCRIPTION_PRICES = {
  pro: {
    monthly: 4900, // 49 ILS
    yearly: 47000, // 470 ILS (~2 months free)
  },
  business: {
    monthly: 14900, // 149 ILS
    yearly: 149000, // 1490 ILS (~2 months free)
  },
}
