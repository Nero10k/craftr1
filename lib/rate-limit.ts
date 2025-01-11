import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Create a new Redis instance
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Rate limit configurations for different routes
export const rateLimiter = {
  // Auth endpoints: 50 requests per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // API endpoints: 200 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Admin endpoints: 500 requests per minute
  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, '1 m'),
    analytics: true,
    prefix: 'ratelimit:admin',
  }),

  // Stripe webhooks: 100 requests per minute
  stripe: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:stripe',
  }),
}

// Helper function to get rate limiter based on path
export function getRateLimiterByPath(path: string) {
  if (path.startsWith('/api/auth')) {
    return rateLimiter.auth
  }
  if (path.startsWith('/api/admin')) {
    return rateLimiter.admin
  }
  if (path.startsWith('/api/webhooks/stripe') || path.startsWith('/api/stripe')) {
    return rateLimiter.stripe
  }
  // Default to API rate limiter
  return rateLimiter.api
}

// Helper function to get identifier for rate limiting
export function getRateLimitIdentifier(req: Request) {
  let ip = ''
  
  // Try to get IP from headers first
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    ip = forwardedFor.split(',')[0].trim()
  }
  
  // Fallback to connection remote address
  if (!ip) {
    ip = '127.0.0.1' // Default for local development
  }
  
  return ip
} 