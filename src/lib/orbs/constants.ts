// Mystic Energy Orbs System Constants

// Free user limits
export const FREE_MAX = 6;
export const FREE_REGEN_PER_HOUR = 1; // 1 orb per hour
export const REGEN_INTERVAL_SEC = 3600; // 1 hour per orb (3600 seconds)

// Watch-to-earn cooldown (default 30 minutes if not in FeaturesConfig)
export const WATCH_COOLDOWN_MIN = 30;

// Pro user limits (effectively unlimited)
export const PRO_MAX = 9999;
export const PRO_REGEN_PER_HOUR = 9999;

// UI refresh intervals
export const HUD_POLL_INTERVAL_MS = 60000; // 60 seconds
export const COUNTDOWN_UPDATE_INTERVAL_MS = 1000; // 1 second for countdown

// Orb display thresholds
export const LOW_ORBS_THRESHOLD = 2; // Show warning when orbs are low
export const CRITICAL_ORBS_THRESHOLD = 1; // Show critical warning
