/**
 * Validators exports
 */
export * from './user'
export * from './shift'
export * from './payment'
export * from './review'

/**
 * Validation helper
 */
import { z } from 'zod'

export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error }
}

/**
 * Format Zod errors for API response
 */
export function formatErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(issue.message)
  }

  return formatted
}
