/**
 * Vision eligibility service for Watch-to-Earn functionality
 * Handles cooldowns, daily limits, and Pro user checks
 */

import { VisionEligibility, VisionPlacement, FeaturesConfig } from '@/types/vision';
import { UserDoc } from '@/types/mystic';

export interface VisionEligibilityCheck {
  userId: string;
  userDoc: UserDoc;
  featuresConfig: FeaturesConfig;
  placement: VisionPlacement;
}

/**
 * Check if a user is eligible to watch a vision
 */
export function checkVisionEligibility({
  userId,
  userDoc,
  featuresConfig,
  placement
}: VisionEligibilityCheck): VisionEligibility {
  // Check if user is authenticated
  if (!userId || !userDoc) {
    return {
      enabled: false,
      reason: 'not-auth'
    };
  }

  // Check if vision system is enabled
  if (!featuresConfig.watchToEarnEnabled) {
    return {
      enabled: false,
      reason: 'cooldown' // Use cooldown as generic "not available" reason
    };
  }

  // Pro users skip ads automatically
  if (userDoc.proEntitlement) {
    return {
      enabled: false,
      reason: 'pro'
    };
  }

  // Check cooldown
  if (userDoc.lastWatchAt) {
    const lastWatchTime = new Date(userDoc.lastWatchAt.toDate());
    const cooldownMs = featuresConfig.watchCooldownMin * 60 * 1000;
    const timeSinceLastWatch = Date.now() - lastWatchTime.getTime();
    
    if (timeSinceLastWatch < cooldownMs) {
      const remainingMs = cooldownMs - timeSinceLastWatch;
      return {
        enabled: false,
        reason: 'cooldown',
        cooldownEtaSec: Math.ceil(remainingMs / 1000)
      };
    }
  }

  // Check daily limit
  const today = new Date().toISOString().split('T')[0];
  const lastWatchDate = userDoc.lastWatchAt 
    ? new Date(userDoc.lastWatchAt.toDate()).toISOString().split('T')[0]
    : null;
  
  // For now, we'll use a simple daily limit check
  // In production, this would query vision_sessions collection
  const visionsToday = userDoc.lastWatchAt && lastWatchDate === today ? 1 : 0;
  
  if (visionsToday >= featuresConfig.watchDailyLimit) {
    return {
      enabled: false,
      reason: 'daily-limit',
      remainingToday: 0
    };
  }

  return {
    enabled: true,
    reason: 'ok',
    remainingToday: featuresConfig.watchDailyLimit - visionsToday
  };
}

/**
 * Get default features config for vision system
 */
export function getDefaultVisionConfig(): FeaturesConfig {
  return {
    watchToEarnEnabled: true,
    watchCooldownMin: 30,
    watchDailyLimit: 5,
    dailyRitualEnabled: true,
    proFeaturesEnabled: true,
    socialFeaturesEnabled: false,
    offlineModeEnabled: false
  };
}

/**
 * Format cooldown time for display
 */
export function formatCooldownTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Get placement display name
 */
export function getPlacementDisplayName(placement: VisionPlacement): string {
  const names: Record<VisionPlacement, string> = {
    rune_daily: 'Daily Rune',
    rune_spread2: 'Two-Rune Spread',
    rune_spread3: 'Three-Rune Spread',
    numerology_daily: 'Daily Numerology',
    numerology_compat: 'Numerology Compatibility'
  };
  
  return names[placement] || 'Ritual';
}
