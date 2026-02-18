/**
 * Centralized configuration constants.
 * Extracted from hardcoded values across the codebase.
 */

// Rate limiting
export const RATE_LIMITS = {
  PHONE_AUTH: { interval: 15 * 60 * 1000, maxRequests: 3 },
  VERIFY_OTP: { interval: 15 * 60 * 1000, maxRequests: 5 },
  ADMIN_AUTH: { interval: 15 * 60 * 1000, maxRequests: 5 },
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  ADMIN_MAX_LIMIT: 50,
} as const

// Auth
export const AUTH = {
  ADMIN_TOKEN_EXPIRY_SECONDS: 2 * 60 * 60, // 2 hours
  DEMO_COOKIE_MAX_AGE: 86400, // 24 hours
} as const

// Trial
export const TRIAL = {
  DURATION_MS: 3 * 24 * 60 * 60 * 1000, // 3 days
} as const

// Geo
export const GEO = {
  DEFAULT_LATITUDE: 32.0853, // Tel Aviv
  DEFAULT_LONGITUDE: 34.7818,
  DEFAULT_ZOOM: 13,
  DEFAULT_RADIUS_KM: 10,
} as const

// Content limits
export const CONTENT_LIMITS = {
  MAX_MESSAGE_LENGTH: 5000,
  MAX_REVIEW_LENGTH: 2000,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_EVIDENCE_ITEMS: 10,
} as const

// Shifts
export const SHIFTS = {
  ALLOWED_SORT_FIELDS: ['created_at', 'date', 'hourly_rate', 'title', 'city', 'urgency'],
} as const
