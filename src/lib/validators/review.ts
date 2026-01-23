/**
 * Review & Dispute Validation Schemas
 */
import { z } from 'zod'

// Review schemas
export const createReviewSchema = z.object({
  task_flow_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
})

export const reportReviewSchema = z.object({
  review_id: z.string().uuid(),
  reason: z.string().max(500),
})

// Dispute schemas
export const createDisputeSchema = z.object({
  task_flow_id: z.string().uuid(),
  shift_id: z.string().uuid(),
  respondent_id: z.string().uuid(),
  type: z.enum(['payment', 'quality', 'no_show', 'harassment', 'other']),
  description: z.string().min(10).max(2000),
  evidence: z.array(z.string().url()).max(10).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

export const updateDisputeSchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'escalated']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().uuid().optional(),
})

export const resolveDisputeSchema = z.object({
  dispute_id: z.string().uuid(),
  resolution_outcome: z.enum(['initiator_favor', 'respondent_favor', 'split', 'dismissed']),
  resolution_description: z.string().min(10).max(2000),
  refund_amount: z.number().min(0).optional(),
})

export const disputeMessageSchema = z.object({
  dispute_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  attachments: z.array(z.string().url()).max(5).optional(),
})

// Types
export type CreateReview = z.infer<typeof createReviewSchema>
export type ReportReview = z.infer<typeof reportReviewSchema>
export type CreateDispute = z.infer<typeof createDisputeSchema>
export type UpdateDispute = z.infer<typeof updateDisputeSchema>
export type ResolveDispute = z.infer<typeof resolveDisputeSchema>
export type DisputeMessage = z.infer<typeof disputeMessageSchema>
