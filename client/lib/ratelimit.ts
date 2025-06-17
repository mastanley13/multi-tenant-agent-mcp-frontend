import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create Redis instance using Upstash Redis client (optional)
let redis: Redis | null = null
let rateLimiter: Ratelimit | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    // Create rate limiter: 60 messages per minute per user
    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
      analytics: true,
    })
  }
} catch (error) {
  console.warn('Redis rate limiting not available:', error)
}

export async function checkRateLimit(userId: string) {
  // If no rate limiter is configured, allow all requests
  if (!rateLimiter) {
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 60000,
      retryAfter: Date.now() + 60000
    }
  }

  const identifier = `chat_${userId}`
  const { success, limit, remaining, reset } = await rateLimiter.limit(identifier)
  
  return {
    success,
    limit,
    remaining,
    reset,
    retryAfter: reset
  }
}

export function createRateLimitHeaders(rateLimitResult: Awaited<ReturnType<typeof checkRateLimit>>) {
  return {
    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': rateLimitResult.reset.toString(),
  }
} 