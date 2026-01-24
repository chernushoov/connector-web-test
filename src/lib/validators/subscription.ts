/**
 * Subscription Validation Schemas
 */
import { z } from 'zod'

export const createCheckoutSessionSchema = z.object({
  plan: z.enum(['pro', 'business']),
  billing_period: z.enum(['monthly', 'yearly']).default('monthly'),
})

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
})

export type CreateCheckoutSession = z.infer<typeof createCheckoutSessionSchema>
export type CancelSubscription = z.infer<typeof cancelSubscriptionSchema>
