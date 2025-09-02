// Progression System Constants

// Daily check-in XP reward
export const DAILY_CHECKIN_XP = 15;

// Base XP rewards for different ritual types
export const RITUAL_XP = {
  rune_single: 10,
  rune_spread2: 18,
  rune_spread3: 24,
  numerology_basic: 10,
  numerology_deep: 18,
} as const;

// Pro subscription XP multiplier
export const PRO_XP_MULTIPLIER = 2;

// Achievement IDs
export const ACHIEVEMENT_IDS = {
  FIRST_LOGIN: 'first_login',
  STREAK_3: 'streak_3',
  STREAK_7: 'streak_7',
} as const;

// Achievement labels for display
export const ACHIEVEMENT_LABELS: Record<string, string> = {
  [ACHIEVEMENT_IDS.FIRST_LOGIN]: 'First Login',
  [ACHIEVEMENT_IDS.STREAK_3]: 'Streak 3',
  [ACHIEVEMENT_IDS.STREAK_7]: 'Streak 7',
};
