type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()

export type RateLimitOptions = {
  windowMs?: number
  limit?: number
}

export type RateLimitResult = {
  allowed: boolean
  retryAfter: number
}

export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000
  const limit = options.limit ?? 60
  const now = Date.now()
  const b = store.get(key)
  if (!b || b.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }
  if (b.count < limit) {
    b.count += 1
    return { allowed: true, retryAfter: 0 }
  }
  const retryAfter = Math.max(1, Math.ceil((b.resetAt - now) / 1000))
  return { allowed: false, retryAfter }
}
