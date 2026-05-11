import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type Bucket = { count: number; resetAt: number }
const localStore = new Map<string, Bucket>()

const redisRestUrl = process.env.KADERNIM_KV_REST_API_URL
const redisToken = (() => {
  const kvUrl = process.env.KADERNIM_KV_URL
  if (!kvUrl) return undefined
  try { return new URL(kvUrl).password } catch { return undefined }
})()
const redis = redisRestUrl && redisToken
  ? new Redis({ url: redisRestUrl, token: redisToken })
  : null
const limiterCache = new Map<string, Ratelimit>()

export type RateLimitOptions = {
  windowMs?: number
  limit?: number
}

export type RateLimitResult = {
  allowed: boolean
  retryAfter: number
}

function checkRateLimitLocal(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000
  const limit = options.limit ?? 60
  const now = Date.now()
  const b = localStore.get(key)
  if (!b || b.resetAt <= now) {
    localStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }
  if (b.count < limit) {
    b.count += 1
    return { allowed: true, retryAfter: 0 }
  }
  const retryAfter = Math.max(1, Math.ceil((b.resetAt - now) / 1000))
  return { allowed: false, retryAfter }
}

export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  return checkRateLimitLocal(key, options)
}

export async function checkDistributedRateLimit(key: string, options: RateLimitOptions = {}): Promise<RateLimitResult> {
  if (!redis) {
    return checkRateLimitLocal(key, options)
  }

  const limit = options.limit ?? 60
  const windowMs = options.windowMs ?? 60_000
  const seconds = Math.max(1, Math.round(windowMs / 1000))
  const cacheKey = `${limit}:${seconds}`
  let limiter = limiterCache.get(cacheKey)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${seconds} s`),
      prefix: 'rl:v1',
    })
    limiterCache.set(cacheKey, limiter)
  }
  const result = await limiter.limit(key)
  const retryAfter = result.reset ? Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) : 1
  return { allowed: result.success, retryAfter }
}
