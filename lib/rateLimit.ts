/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Uses a sliding window per IP. No Redis required.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  limit: number;    // max requests allowed
  windowMs: number; // time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  ip: string,
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const storeKey = `${key}:${ip}`;
  const now = Date.now();
  const entry = store.get(storeKey);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs;
    store.set(storeKey, { count: 1, resetAt });
    return { allowed: true, remaining: options.limit - 1, resetAt };
  }

  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: options.limit - entry.count, resetAt: entry.resetAt };
}

// Extract real IP from Vercel headers
export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

// Rate limit presets per route
export const LIMITS = {
  bookings:       { limit: 10, windowMs: 60_000 },  // 10 bookings/min
  slots:          { limit: 60, windowMs: 60_000 },  // 60 slot checks/min
  googleConnect:  { limit: 5,  windowMs: 60_000 },  // 5 OAuth attempts/min
  googleCallback: { limit: 10, windowMs: 60_000 },  // 10 callbacks/min
};
