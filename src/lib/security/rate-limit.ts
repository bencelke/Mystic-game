import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { rateLimitKeySchema } from '@/lib/validation/inputs';

export interface RateLimitConfig {
  capacity: number; // Maximum tokens
  refillPerSec: number; // Tokens added per second
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Default rate limit configurations
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'ritual:rune': { capacity: 10, refillPerSec: 0.2, windowMs: 300000 }, // 10 per 5 minutes
  'ritual:compat': { capacity: 5, refillPerSec: 0.1, windowMs: 300000 }, // 5 per 5 minutes
  'vision:rune_daily': { capacity: 3, refillPerSec: 0.05, windowMs: 300000 }, // 3 per 5 minutes
  'vision:rune_spread2': { capacity: 3, refillPerSec: 0.05, windowMs: 300000 },
  'vision:rune_spread3': { capacity: 3, refillPerSec: 0.05, windowMs: 300000 },
  'vision:numerology_daily': { capacity: 3, refillPerSec: 0.05, windowMs: 300000 },
  'vision:numerology_compat': { capacity: 3, refillPerSec: 0.05, windowMs: 300000 },
  'vision:wheel': { capacity: 3, refillPerSec: 0.05, windowMs: 300000 },
  'wheel:spin': { capacity: 6, refillPerSec: 0.2, windowMs: 60000 }, // 6 per minute
  'admin:features': { capacity: 20, refillPerSec: 1, windowMs: 60000 }, // 20 per minute
  'admin:users': { capacity: 50, refillPerSec: 2, windowMs: 60000 }, // 50 per minute
};

/**
 * Check and consume rate limit tokens
 */
export async function checkAndConsume(
  uid: string,
  key: string,
  cost: number = 1
): Promise<RateLimitResult> {
  try {
    // Validate the rate limit key
    const validatedKey = rateLimitKeySchema.parse(key);
    const config = RATE_LIMITS[validatedKey];
    
    if (!config) {
      throw new Error(`Unknown rate limit key: ${key}`);
    }

    const docId = `${uid}_${validatedKey}`;
    const docRef = adminDb.collection('rate_limits').doc(docId);
    
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Use transaction to ensure atomicity
    const result = await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      
      let currentTokens: number;
      let lastRefillAt: number;
      
      if (doc.exists) {
        const data = doc.data()!;
        currentTokens = data.tokens || 0;
        lastRefillAt = data.lastRefillAt?.toMillis?.() || now;
      } else {
        currentTokens = config.capacity;
        lastRefillAt = now;
      }
      
      // Calculate tokens to add based on elapsed time
      const elapsedMs = now - lastRefillAt;
      const tokensToAdd = Math.floor(elapsedMs / 1000) * config.refillPerSec;
      
      // Refill tokens (capped at capacity)
      const newTokens = Math.min(config.capacity, currentTokens + tokensToAdd);
      
      // Check if we have enough tokens
      if (newTokens < cost) {
        const tokensNeeded = cost - newTokens;
        const timeToRefill = Math.ceil(tokensNeeded / config.refillPerSec) * 1000;
        const resetTime = now + timeToRefill;
        
        return {
          allowed: false,
          remaining: newTokens,
          resetTime,
          retryAfter: Math.ceil(timeToRefill / 1000)
        };
      }
      
      // Consume tokens
      const remainingTokens = newTokens - cost;
      
      // Update document
      transaction.set(docRef, {
        tokens: remainingTokens,
        lastRefillAt: FieldValue.serverTimestamp(),
        capacity: config.capacity,
        refillPerSec: config.refillPerSec,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      
      return {
        allowed: true,
        remaining: remainingTokens,
        resetTime: now + config.windowMs
      };
    });
    
    return result;
    
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 60000 // 1 minute
    };
  }
}

/**
 * Get current rate limit status without consuming tokens
 */
export async function getRateLimitStatus(
  uid: string,
  key: string
): Promise<RateLimitResult> {
  try {
    const validatedKey = rateLimitKeySchema.parse(key);
    const config = RATE_LIMITS[validatedKey];
    
    if (!config) {
      throw new Error(`Unknown rate limit key: ${key}`);
    }

    const docId = `${uid}_${validatedKey}`;
    const docRef = adminDb.collection('rate_limits').doc(docId);
    const doc = await docRef.get();
    
    const now = Date.now();
    let currentTokens: number;
    let lastRefillAt: number;
    
    if (doc.exists) {
      const data = doc.data()!;
      currentTokens = data.tokens || 0;
      lastRefillAt = data.lastRefillAt?.toMillis?.() || now;
    } else {
      currentTokens = config.capacity;
      lastRefillAt = now;
    }
    
    // Calculate current tokens after refill
    const elapsedMs = now - lastRefillAt;
    const tokensToAdd = Math.floor(elapsedMs / 1000) * config.refillPerSec;
    const newTokens = Math.min(config.capacity, currentTokens + tokensToAdd);
    
    return {
      allowed: true,
      remaining: newTokens,
      resetTime: now + config.windowMs
    };
    
  } catch (error) {
    console.error('Rate limit status error:', error);
    return {
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 60000
    };
  }
}

/**
 * Reset rate limit for a user and key
 */
export async function resetRateLimit(
  uid: string,
  key: string
): Promise<void> {
  try {
    const validatedKey = rateLimitKeySchema.parse(key);
    const config = RATE_LIMITS[validatedKey];
    
    if (!config) {
      throw new Error(`Unknown rate limit key: ${key}`);
    }

    const docId = `${uid}_${validatedKey}`;
    const docRef = adminDb.collection('rate_limits').doc(docId);
    
    await docRef.set({
      tokens: config.capacity,
      lastRefillAt: FieldValue.serverTimestamp(),
      capacity: config.capacity,
      refillPerSec: config.refillPerSec,
      updatedAt: FieldValue.serverTimestamp()
    });
    
  } catch (error) {
    console.error('Rate limit reset error:', error);
    throw error;
  }
}

/**
 * Format rate limit error message for users
 */
export function formatRateLimitError(result: RateLimitResult): string {
  if (result.allowed) {
    return '';
  }
  
  if (result.retryAfter) {
    if (result.retryAfter < 60) {
      return `Too many attempts. Please wait ${result.retryAfter} seconds.`;
    } else {
      const minutes = Math.ceil(result.retryAfter / 60);
      return `Too many attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    }
  }
  
  return 'Too many attempts. Please try again later.';
}
