/**
 * Shift Validation Schemas
 */
import { z } from 'zod'

// Time format validation (HH:MM)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

// Date format validation (YYYY-MM-DD)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

// Create shift schema
export const createShiftSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000).optional(),
  city: z.string().min(2).max(100),
  address: z.string().max(500).optional(),
  location_lat: z.number().min(-90).max(90).optional(),
  location_lng: z.number().min(-180).max(180).optional(),
  date: z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)'),
  start_time: z.string().regex(timeRegex, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(timeRegex, 'Invalid time format (HH:MM)'),
  urgency: z.enum(['instant', 'today', 'scheduled']).default('scheduled'),
  base_rate: z.number()
    .min(30, 'Minimum rate is 30 ILS/hour')
    .max(500, 'Maximum rate is 500 ILS/hour'),
  surge_multiplier: z.number().min(1).max(3).default(1),
  payment_guarantee: z.boolean().default(false),
  slots: z.number().min(1).max(50).default(1),
  needs_car: z.boolean().default(false),
  needs_tools: z.boolean().default(false),
  needs_team: z.number().min(0).max(20).default(0),
  min_experience: z.number().min(0).max(20).default(0),
  min_rating: z.number().min(0).max(5).default(0),
  required_skills: z.array(z.string()).default([]),
  specialization: z.string().max(100).optional(),
  is_instant: z.boolean().default(false),
  accepts_teams: z.boolean().default(false),
  has_escrow: z.boolean().default(true),
}).refine(
  data => {
    // Ensure end time is after start time
    const start = data.start_time.split(':').map(Number)
    const end = data.end_time.split(':').map(Number)
    const startMinutes = start[0] * 60 + start[1]
    const endMinutes = end[0] * 60 + end[1]
    return endMinutes > startMinutes
  },
  { message: 'End time must be after start time', path: ['end_time'] }
)

// Base shift schema (without refine, for partial)
const baseShiftSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000).optional(),
  city: z.string().min(2).max(100),
  address: z.string().max(500).optional(),
  location_lat: z.number().min(-90).max(90).optional(),
  location_lng: z.number().min(-180).max(180).optional(),
  date: z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)'),
  start_time: z.string().regex(timeRegex, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(timeRegex, 'Invalid time format (HH:MM)'),
  urgency: z.enum(['instant', 'today', 'scheduled']).default('scheduled'),
  base_rate: z.number()
    .min(30, 'Minimum rate is 30 ILS/hour')
    .max(500, 'Maximum rate is 500 ILS/hour'),
  surge_multiplier: z.number().min(1).max(3).default(1),
  payment_guarantee: z.boolean().default(false),
  slots: z.number().min(1).max(50).default(1),
  needs_car: z.boolean().default(false),
  needs_tools: z.boolean().default(false),
  needs_team: z.number().min(0).max(20).default(0),
  min_experience: z.number().min(0).max(20).default(0),
  min_rating: z.number().min(0).max(5).default(0),
  required_skills: z.array(z.string()).default([]),
  specialization: z.string().max(100).optional(),
  is_instant: z.boolean().default(false),
  accepts_teams: z.boolean().default(false),
  has_escrow: z.boolean().default(true),
})

// Update shift schema
export const updateShiftSchema = baseShiftSchema.partial()

// Search shifts schema
export const searchShiftsSchema = z.object({
  query: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  date: z.string().regex(dateRegex).optional(),
  date_from: z.string().regex(dateRegex).optional(),
  date_to: z.string().regex(dateRegex).optional(),
  min_rate: z.number().min(0).optional(),
  max_rate: z.number().max(1000).optional(),
  urgency: z.array(z.enum(['instant', 'today', 'scheduled'])).optional(),
  needs_car: z.boolean().optional(),
  needs_tools: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  specialization: z.string().optional(),
  instant_only: z.boolean().optional(),
  verified_only: z.boolean().optional(),
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  // Sorting
  sort_by: z.enum(['date', 'rate', 'created_at', 'distance']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Nearby shifts schema
export const nearbyShiftsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_km: z.number().min(1).max(100).default(50),
  limit: z.number().min(1).max(100).default(20),
})

// Application schemas
export const applyToShiftSchema = z.object({
  shift_id: z.string().uuid(),
  agreed_rate: z.number().min(30).max(500),
  application_message: z.string().max(500).optional(),
})

export const updateApplicationSchema = z.object({
  status: z.enum([
    'applied', 'reviewing', 'approved', 'rejected',
    'upcoming', 'in_progress', 'completed',
    'awaiting_review', 'reviewed',
    'payment_pending', 'paid', 'cancelled', 'disputed'
  ]),
  hours_worked: z.number().min(0).max(24).optional(),
  total_amount: z.number().min(0).optional(),
})

// Types
export type CreateShift = z.infer<typeof createShiftSchema>
export type UpdateShift = z.infer<typeof updateShiftSchema>
export type SearchShifts = z.infer<typeof searchShiftsSchema>
export type NearbyShifts = z.infer<typeof nearbyShiftsSchema>
export type ApplyToShift = z.infer<typeof applyToShiftSchema>
export type UpdateApplication = z.infer<typeof updateApplicationSchema>
