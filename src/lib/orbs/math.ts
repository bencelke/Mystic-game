// Mystic Energy Orbs Math Utilities (Pure Functions)

/**
 * Calculate seconds elapsed since a timestamp
 */
export const secondsSince = (ts: Date | number): number => {
  const now = Date.now();
  const timestamp = ts instanceof Date ? ts.getTime() : ts;
  return Math.floor((now - timestamp) / 1000);
};

/**
 * Calculate how many whole orbs should be granted based on elapsed time
 * @param elapsedSec - Seconds since last regeneration
 * @param intervalSec - Seconds per orb regeneration
 * @returns Number of whole orbs to grant
 */
export const regenEligible = (elapsedSec: number, intervalSec: number): number => {
  if (elapsedSec < intervalSec) return 0;
  return Math.floor(elapsedSec / intervalSec);
};

/**
 * Apply regeneration to current orb count, respecting maximum
 * @param current - Current orb count
 * @param max - Maximum orb capacity
 * @param toGrant - Orbs to grant
 * @returns Object with new count and actual granted amount
 */
export const applyRegen = (
  current: number, 
  max: number, 
  toGrant: number
): { next: number; granted: number } => {
  if (toGrant <= 0) {
    return { next: current, granted: 0 };
  }

  const newTotal = current + toGrant;
  const actualGranted = Math.min(toGrant, max - current);
  const next = Math.min(newTotal, max);

  return {
    next,
    granted: actualGranted
  };
};

/**
 * Calculate next regeneration ETA in seconds
 * @param current - Current orb count
 * @param max - Maximum orb capacity
 * @param elapsedSec - Seconds since last regeneration
 * @param intervalSec - Seconds per orb regeneration
 * @returns Seconds until next orb regeneration, or 0 if full
 */
export const nextRegenEta = (
  current: number,
  max: number,
  elapsedSec: number,
  intervalSec: number
): number => {
  if (current >= max) return 0;
  
  const remainder = elapsedSec % intervalSec;
  return intervalSec - remainder;
};

/**
 * Format seconds into human-readable time
 * @param seconds - Seconds to format
 * @returns Formatted string like "45m" or "2h 30m"
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return 'Now';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
};

/**
 * Check if user can spend orbs
 * @param current - Current orb count
 * @param amount - Amount to spend
 * @param isPro - Whether user has pro entitlement
 * @returns True if can spend
 */
export const canSpend = (current: number, amount: number = 1, isPro: boolean = false): boolean => {
  if (isPro) return true;
  return current >= amount;
};
