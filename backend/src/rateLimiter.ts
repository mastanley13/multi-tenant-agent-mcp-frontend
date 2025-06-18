import { Request, Response, NextFunction } from 'express'
import { rateLimitRemainingGauge } from './metrics'

let rateLimiter: ((key: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }>) | null = null

// Initialize Upstash rate limiter if credentials are present
if (process.env.UPSTASH_REST_URL && process.env.UPSTASH_REST_TOKEN) {
  try {
    // Dynamic import to avoid pulling in redis client when not configured (e.g. unit tests)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Ratelimit } = require('@upstash/ratelimit')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Redis } = require('@upstash/redis')

    const redis = new Redis({
      url: process.env.UPSTASH_REST_URL,
      token: process.env.UPSTASH_REST_TOKEN,
    })

    const ratelimit = new Ratelimit({
      redis,
      // 60 requests per 1 minute sliding window, per tenantId
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: 'mcp_rl',
    })

    rateLimiter = async (key: string) => {
      return await ratelimit.limit(key)
    }
  } catch (err) {
    console.error('Failed to configure Upstash RateLimit:', err)
  }
}

// Fallback in-memory window when Upstash not configured (dev/test mode)
if (!rateLimiter) {
  const map = new Map<string, { count: number; reset: number }>()
  const WINDOW = 60 * 1000 // 1 minute in ms
  const LIMIT = 60
  rateLimiter = async (key: string) => {
    const now = Date.now()
    const entry = map.get(key)
    if (!entry || now > entry.reset) {
      map.set(key, { count: 1, reset: now + WINDOW })
      return { success: true, limit: LIMIT, remaining: LIMIT - 1, reset: Math.floor((now + WINDOW) / 1000) }
    }
    if (entry.count >= LIMIT) {
      return { success: false, limit: LIMIT, remaining: 0, reset: Math.floor(entry.reset / 1000) }
    }
    entry.count += 1
    return { success: true, limit: LIMIT, remaining: LIMIT - entry.count, reset: Math.floor(entry.reset / 1000) }
  }
}

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'anonymous'
    const { success, limit, remaining, reset } = await rateLimiter!(tenantId)

    res.setHeader('X-RateLimit-Limit', limit.toString())
    res.setHeader('X-RateLimit-Remaining', remaining.toString())
    res.setHeader('X-RateLimit-Reset', reset.toString())
    rateLimitRemainingGauge.set({ tenantId }, remaining)

    if (!success) {
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }
    return next()
  } catch (err) {
    console.error('Rate limiter error:', err)
    // On failure to check, allow request but warn
    return next()
  }
} 