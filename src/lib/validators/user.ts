/**
 * User Validation Schemas
 */
import { z } from 'zod'

// Phone number validation (Israel format)
const phoneRegex = /^(\+972|0)([23489]|5[0-9]|7[0-9])[0-9]{7}$/

export const phoneSchema = z.string()
  .transform(val => {
    // Strip spaces and dashes before validation
    const cleaned = val.replace(/[\s\-()]/g, '')
    // Normalize to +972 format
    if (cleaned.startsWith('0')) {
      return '+972' + cleaned.slice(1)
    }
    return cleaned
  })
  .pipe(z.string().regex(phoneRegex, 'Invalid Israeli phone number'))

// Profile schemas
export const createProfileSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  photo_url: z.string().url().optional(),
  language: z.enum(['ru', 'he', 'en', 'ar']).default('ru'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  photo_url: z.string().url().nullable().optional(),
  language: z.enum(['ru', 'he', 'en', 'ar']).optional(),
  current_mode: z.enum(['free-world', 'worker', 'employer']).optional(),
})

// Worker profile schemas
export const createWorkerProfileSchema = z.object({
  age: z.number().min(16).max(100).optional(),
  city: z.string().min(2).max(100).optional(),
  specialization: z.string().max(100).optional(),
  experience: z.number().min(0).max(50).default(0),
  about: z.string().max(1000).optional(),
  has_car: z.boolean().default(false),
  has_tools: z.boolean().default(false),
  team_size: z.number().min(0).max(20).default(0),
  min_rate: z.number().min(30).max(1000).default(35),
  max_rate: z.number().min(30).max(1000).default(100),
  availability: z.enum(['now', 'today', 'tomorrow', 'flexible']).default('flexible'),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(['ru']),
})

export const updateWorkerProfileSchema = createWorkerProfileSchema.partial()

export const updateWorkerLocationSchema = z.object({
  location_lat: z.number().min(-90).max(90),
  location_lng: z.number().min(-180).max(180),
  location_address: z.string().max(500).optional(),
})

export const updateWorkerAvailabilitySchema = z.object({
  availability_status: z.enum(['available', 'busy', 'offline']),
  available_until: z.string().datetime().optional(),
})

// Employer profile schemas
export const createEmployerProfileSchema = z.object({
  company: z.string().min(2, 'Company name required').max(200),
  contact_person: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
})

export const updateEmployerProfileSchema = createEmployerProfileSchema.partial()

// Document schemas
export const uploadDocumentSchema = z.object({
  type: z.enum(['passport', 'work_permit', 'driver_license', 'other']),
  image_url: z.string().url(),
})

// Auth schemas
export const sendOtpSchema = z.object({
  phone: phoneSchema,
})

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, 'Code must be 6 digits'),
})

// Types
export type CreateProfile = z.infer<typeof createProfileSchema>
export type UpdateProfile = z.infer<typeof updateProfileSchema>
export type CreateWorkerProfile = z.infer<typeof createWorkerProfileSchema>
export type UpdateWorkerProfile = z.infer<typeof updateWorkerProfileSchema>
export type CreateEmployerProfile = z.infer<typeof createEmployerProfileSchema>
export type UpdateEmployerProfile = z.infer<typeof updateEmployerProfileSchema>
export type UploadDocument = z.infer<typeof uploadDocumentSchema>
export type SendOtp = z.infer<typeof sendOtpSchema>
export type VerifyOtp = z.infer<typeof verifyOtpSchema>
