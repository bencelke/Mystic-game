import { WHEEL_SEGMENTS, WheelSegment } from './rewards';

/**
 * Generate a secure random float between 0 and 1
 * Uses crypto.getRandomValues on server (Node crypto) or Math.random() fallback
 */
export function secureRandomFloat(): number {
  if (typeof window === 'undefined') {
    // Server-side: use Node.js crypto
    try {
      const crypto = require('crypto');
      const randomBytes = crypto.randomBytes(4);
      const randomValue = randomBytes.readUInt32BE(0);
      return randomValue / 0xffffffff;
    } catch (error) {
      console.warn('Failed to use crypto.randomBytes, falling back to Math.random()');
      return Math.random();
    }
  } else {
    // Client-side: use Web Crypto API if available, fallback to Math.random()
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      try {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] / 0xffffffff;
      } catch (error) {
        console.warn('Failed to use crypto.getRandomValues, falling back to Math.random()');
        return Math.random();
      }
    } else {
      return Math.random();
    }
  }
}

/**
 * Select a reward from the wheel segments using weighted random selection
 * @returns The selected segment and its index
 */
export function selectReward(): { segment: WheelSegment; index: number } {
  const randomFloat = secureRandomFloat();
  
  // Calculate total weight
  const totalWeight = WHEEL_SEGMENTS.reduce((sum, segment) => sum + segment.weight, 0);
  const randomValue = randomFloat * totalWeight;
  
  let currentWeight = 0;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    currentWeight += WHEEL_SEGMENTS[i].weight;
    if (randomValue <= currentWeight) {
      return { segment: WHEEL_SEGMENTS[i], index: i };
    }
  }
  
  // Fallback to last segment (should never happen with proper random values)
  return { 
    segment: WHEEL_SEGMENTS[WHEEL_SEGMENTS.length - 1], 
    index: WHEEL_SEGMENTS.length - 1 
  };
}

/**
 * Generate a random seed for reproducible results (if needed)
 * @returns A random seed string
 */
export function generateSeed(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}_${random}`;
}
