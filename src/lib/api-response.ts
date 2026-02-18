/**
 * Standardized API response helpers.
 * All API routes should use these for consistent response format.
 */
import { NextResponse } from 'next/server'

interface SuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

interface ErrorResponse {
  success: false
  error: string
  details?: unknown
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: SuccessResponse<T> = { success: true, data }
  if (meta) body.meta = meta
  return NextResponse.json(body, { status })
}

export function apiError(error: string, status = 400, details?: unknown) {
  const body: ErrorResponse = { success: false, error }
  if (details) body.details = details
  return NextResponse.json(body, { status })
}

export function apiUnauthorized(message = 'Unauthorized') {
  return apiError(message, 401)
}

export function apiForbidden(message = 'Access denied') {
  return apiError(message, 403)
}

export function apiNotFound(message = 'Not found') {
  return apiError(message, 404)
}

export function apiTooManyRequests(retryAfter?: number) {
  return NextResponse.json(
    { success: false, error: 'Too many attempts. Try again later.', retryAfter },
    { status: 429 }
  )
}

export function apiServerError(message = 'Internal server error') {
  return apiError(message, 500)
}
