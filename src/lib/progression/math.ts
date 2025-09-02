// Progression Math Functions

/**
 * Calculate level from total XP
 * Simple formula: L = floor(0.1 * sqrt(xp))
 * Can be tuned later for better progression curve
 */
export function levelFromXP(totalXP: number): number {
  if (totalXP <= 0) return 1;
  return Math.max(1, Math.floor(0.1 * Math.sqrt(totalXP)));
}

/**
 * Check if two dates are the same UTC date (ignoring time)
 */
export function isSameUTCDate(a: Date, b: Date): boolean {
  const aDate = new Date(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bDate = new Date(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return aDate.getTime() === bDate.getTime();
}

/**
 * Get XP required for next level
 * Simple formula: nextLevel^2 * 100
 */
export function getXPForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel + 1, 2) * 100;
}

/**
 * Get XP progress within current level (0-1)
 */
export function getLevelProgress(currentXP: number, currentLevel: number): number {
  const xpForCurrentLevel = Math.pow(currentLevel, 2) * 100;
  const xpForNextLevel = getXPForNextLevel(currentLevel);
  const xpInLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  
  return Math.min(1, Math.max(0, xpInLevel / xpNeededForLevel));
}
