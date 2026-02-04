/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per IP
 */

import { env } from './env';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.store.delete(identifier);
    }

    const current = this.store.get(identifier);

    if (!current) {
      const resetTime = now + env.rateLimitWindowMs;
      this.store.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: env.rateLimitMaxRequests - 1, resetTime };
    }

    if (current.count >= env.rateLimitMaxRequests) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime };
    }

    current.count++;
    return {
      allowed: true,
      remaining: env.rateLimitMaxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

// Helper to get client IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

// Middleware function for Next.js API routes
export function withRateLimit(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    const ip = getClientIp(req);
    const { allowed, remaining, resetTime } = rateLimiter.check(ip);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          resetTime: new Date(resetTime).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': env.rateLimitMaxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const response = await handler(req);
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', env.rateLimitMaxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toString());

    return response;
  };
}
