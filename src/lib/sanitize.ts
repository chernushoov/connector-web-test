/**
 * Input sanitization for user-generated content.
 * Prevents XSS attacks in stored content.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Sanitize a text field — escape HTML but preserve whitespace.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return ''
  return escapeHtml(input.trim())
}

/**
 * Sanitize an object's string fields recursively.
 * Only processes string values, leaves others unchanged.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T, fields?: string[]): T {
  const result = { ...obj }
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string' && (!fields || fields.includes(key))) {
      (result as Record<string, unknown>)[key] = sanitizeText(value)
    }
  }
  return result
}

/**
 * Strip potential script injection from URLs.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
    return ''
  }
  return trimmed
}
