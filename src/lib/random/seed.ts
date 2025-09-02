// Seeded Random Number Generator for Daily Rituals

/**
 * Generate a daily seed string for a user and ritual type
 * This ensures the same user gets the same result for the same ritual on the same day
 */
export function dailySeed(uid: string, ritual: string, date: string): string {
  return `${uid}-${ritual}-${date}`;
}

/**
 * Simple hash function to convert a string to a number
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Pick a random element from an array using a seed
 * The same seed will always return the same element
 */
export function pickFrom<T>(arr: T[], seed: string): T {
  if (arr.length === 0) {
    throw new Error('Cannot pick from empty array');
  }
  
  const hash = simpleHash(seed);
  const index = hash % arr.length;
  return arr[index];
}

/**
 * Generate a random number between 0 and 1 using a seed
 */
export function seededRandom(seed: string): number {
  const hash = simpleHash(seed);
  // Use the hash to generate a pseudo-random number between 0 and 1
  return (hash % 10000) / 10000;
}

/**
 * Check if a rune should be reversed based on seed
 * 50% chance of reversal
 */
export function isReversed(seed: string): boolean {
  return seededRandom(seed) < 0.5;
}
