interface RateLimitEntry {
  count: number
  resetAt: number
}

// Module-level Map persists across requests within the same serverless instance.
// Not perfectly consistent across multiple instances, but provides strong protection
// against single-source abuse without needing external state (Redis/KV).
const store = new Map<string, RateLimitEntry>()

// Prune expired entries periodically to prevent memory growth.
function prune() {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key)
  })
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  if (store.size > 5000) prune()

  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now > existing.resetAt) {
    const entry = { count: 1, resetAt: now + windowMs }
    store.set(key, entry)
    return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt }
}
