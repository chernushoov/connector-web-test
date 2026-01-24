/**
 * In-memory rate limiter for API endpoints.
 * For production at scale, replace with Redis-based solution.
 */

interface RateLimitConfig {
  interval: number    // Time window in ms
  maxRequests: number // Max requests per key per interval
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter?: number // seconds until reset
}

export function rateLimit(config: RateLimitConfig) {
  const store = new Map<string, RateLimitEntry>()

  // Periodic cleanup to prevent memory leaks
  const CLEANUP_INTERVAL = 60 * 1000 // 1 minute
  let lastCleanup = Date.now()

  function cleanup() {
    const now = Date.now()
    if (now - lastCleanup < CLEANUP_INTERVAL) return
    lastCleanup = now

    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }

  return {
    check(key: string): RateLimitResult {
      cleanup()

      const now = Date.now()
      const entry = store.get(key)

      // No existing entry or window expired — allow
      if (!entry || now > entry.resetAt) {
        store.set(key, {
          count: 1,
          resetAt: now + config.interval,
        })
        return { allowed: true, remaining: config.maxRequests - 1 }
      }

      // Within window — check count
      if (entry.count >= config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
        return { allowed: false, remaining: 0, retryAfter }
      }

      // Increment
      entry.count++
      return { allowed: true, remaining: config.maxRequests - entry.count }
    },

    reset(key: string): void {
      store.delete(key)
    },
  }
}
