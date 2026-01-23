/**
 * Payment Validation Schemas
 */
import { z } from 'zod'

// Create escrow schema
export const createEscrowSchema = z.object({
  task_flow_id: z.string().uuid(),
  amount: z.number().min(1, 'Amount must be positive'),
})

// Release escrow schema
export const releaseEscrowSchema = z.object({
  escrow_id: z.string().uuid().optional(),
  amount: z.number().min(0).optional(),
  hours_worked: z.number().min(0.5).max(24).optional(),
  final_amount: z.number().min(0).optional(),
})

// Refund schema
export const refundSchema = z.object({
  escrow_id: z.string().uuid(),
  amount: z.number().min(0).optional(), // If not provided, full refund
  reason: z.string().max(500),
})

// Subscription schema
export const createSubscriptionSchema = z.object({
  plan: z.enum(['pro', 'business']),
  billing_period: z.enum(['monthly', 'yearly']).default('monthly'),
})

export const cancelSubscriptionSchema = z.object({
  subscription_id: z.string().uuid(),
  reason: z.string().max(500).optional(),
})

// Checkout schema
export const createCheckoutSchema = z.object({
  type: z.enum(['escrow', 'subscription']),
  // For escrow
  task_flow_id: z.string().uuid().optional(),
  // For subscription
  plan: z.enum(['pro', 'business']).optional(),
  billing_period: z.enum(['monthly', 'yearly']).optional(),
  // Return URLs
  success_url: z.string().url(),
  cancel_url: z.string().url(),
}).refine(
  data => {
    if (data.type === 'escrow') {
      return !!data.task_flow_id
    }
    if (data.type === 'subscription') {
      return !!data.plan
    }
    return false
  },
  { message: 'Missing required fields for checkout type' }
)

// Types
export type CreateEscrow = z.infer<typeof createEscrowSchema>
export type ReleaseEscrow = z.infer<typeof releaseEscrowSchema>
export type Refund = z.infer<typeof refundSchema>
export type CreateSubscription = z.infer<typeof createSubscriptionSchema>
export type CancelSubscription = z.infer<typeof cancelSubscriptionSchema>
export type CreateCheckout = z.infer<typeof createCheckoutSchema>
