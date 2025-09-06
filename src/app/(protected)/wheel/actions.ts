'use server';

import { getConfig, spinsRemaining, canSpin, spin } from '@/lib/wheel/service';
import { checkAndConsume, formatRateLimitError } from '@/lib/security/rate-limit';

/**
 * Get wheel status for the current user
 */
export async function getWheelStatusAction(): Promise<{
  success: boolean;
  remaining?: number;
  used?: number;
  freeLimit?: number;
  max?: number;
  pro?: boolean;
  error?: string;
}> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Get user's pro status
    const { adminDb } = await import('@/lib/firebase/admin');
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const isPro = userData?.proEntitlement || false;
    
    const status = await spinsRemaining(uid);
    
    return {
      success: true,
      remaining: status.remaining,
      used: status.used,
      freeLimit: status.freeLimit,
      max: status.max,
      pro: isPro
    };
  } catch (error) {
    console.error('Error getting wheel status:', error);
    return {
      success: false,
      error: 'Failed to get wheel status'
    };
  }
}

/**
 * Spin the daily wheel (free spin)
 */
export async function spinDailyWheelAction(): Promise<{
  success: boolean;
  segment?: any;
  summary?: any;
  remaining?: number;
  error?: string;
}> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Check rate limiting
    try {
      const rateLimitResult = await checkAndConsume(uid, 'wheel:spin', 1);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: `Too many spins. Try again in ${Math.ceil((rateLimitResult.retryAfter || 0) / 1000)} seconds.`
        };
      }
    } catch (rateLimitError) {
      return {
        success: false,
        error: formatRateLimitError(rateLimitError as Error)
      };
    }
    
    // Check if user can spin
    const canSpinResult = await canSpin(uid);
    if (!canSpinResult) {
      return {
        success: false,
        error: 'No spins remaining today'
      };
    }
    
    // Perform spin
    const result = await spin(uid, 'daily');
    
    return {
      success: true,
      segment: result.segment,
      summary: result.summary,
      remaining: result.spinsRemainingAfter
    };
  } catch (error) {
    console.error('Error spinning daily wheel:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to spin wheel'
    };
  }
}

/**
 * Spin the wheel via Vision (extra spin)
 */
export async function spinVisionWheelAction(): Promise<{
  success: boolean;
  segment?: any;
  summary?: any;
  remaining?: number;
  error?: string;
}> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Check rate limiting
    try {
      const rateLimitResult = await checkAndConsume(uid, 'wheel:spin', 1);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: `Too many spins. Try again in ${Math.ceil((rateLimitResult.retryAfter || 0) / 1000)} seconds.`
        };
      }
    } catch (rateLimitError) {
      return {
        success: false,
        error: formatRateLimitError(rateLimitError as Error)
      };
    }
    
    // Check config for Vision extra spins
    const config = await getConfig();
    if (!config.wheelAllowVisionExtra) {
      return {
        success: false,
        error: 'Extra spins via Vision are not available'
      };
    }
    
    // Check if user can spin
    const canSpinResult = await canSpin(uid);
    if (!canSpinResult) {
      return {
        success: false,
        error: 'No spins remaining today'
      };
    }
    
    // Perform spin
    const result = await spin(uid, 'vision');
    
    return {
      success: true,
      segment: result.segment,
      summary: result.summary,
      remaining: result.spinsRemainingAfter
    };
  } catch (error) {
    console.error('Error spinning vision wheel:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to spin wheel'
    };
  }
}
