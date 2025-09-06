/**
 * Vision analytics service for tracking user interactions
 * Provides centralized analytics event tracking for the vision system
 */

import { VisionAnalyticsEvent, VisionAnalyticsData, VisionPlacement, VisionReward } from '@/types/vision';

/**
 * Track vision analytics events
 * In production, this would integrate with your analytics service (e.g., Google Analytics, Mixpanel, etc.)
 */
export function trackVisionEvent(data: VisionAnalyticsData): void {
  try {
    // Log to console for development
    console.log('Vision Analytics:', data);
    
    // In production, you would send to your analytics service
    // Example integrations:
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', data.event, {
        event_category: 'vision',
        event_label: data.placement,
        custom_parameter_1: data.reward,
        custom_parameter_2: data.userId,
        value: 1
      });
    }
    
    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(data.event, {
        placement: data.placement,
        reward: data.reward,
        userId: data.userId,
        sessionId: data.sessionId,
        timestamp: data.timestamp,
        ...data.metadata
      });
    }
    
    // Custom analytics endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).catch(error => {
        console.warn('Failed to send vision analytics:', error);
      });
    }
    
  } catch (error) {
    console.warn('Error tracking vision analytics:', error);
    // Don't throw - analytics failures shouldn't break the user experience
  }
}

/**
 * Track vision start event
 */
export function trackVisionStart(
  placement: VisionPlacement,
  reward: VisionReward,
  userId: string,
  sessionId?: string
): void {
  trackVisionEvent({
    event: 'vision_start',
    placement,
    reward,
    userId,
    sessionId,
    timestamp: Date.now()
  });
}

/**
 * Track vision complete event
 */
export function trackVisionComplete(
  placement: VisionPlacement,
  reward: VisionReward,
  userId: string,
  sessionId?: string
): void {
  trackVisionEvent({
    event: 'vision_complete',
    placement,
    reward,
    userId,
    sessionId,
    timestamp: Date.now()
  });
}

/**
 * Track vision reward event
 */
export function trackVisionReward(
  placement: VisionPlacement,
  reward: VisionReward,
  userId: string,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  trackVisionEvent({
    event: 'vision_reward',
    placement,
    reward,
    userId,
    sessionId,
    timestamp: Date.now(),
    metadata
  });
}

/**
 * Track vision failure event
 */
export function trackVisionFailed(
  placement: VisionPlacement,
  userId: string,
  reason: string,
  sessionId?: string
): void {
  trackVisionEvent({
    event: 'vision_failed',
    placement,
    userId,
    sessionId,
    timestamp: Date.now(),
    metadata: { reason }
  });
}

/**
 * Track cooldown hit event
 */
export function trackVisionCooldownHit(
  placement: VisionPlacement,
  userId: string,
  cooldownEtaSec: number
): void {
  trackVisionEvent({
    event: 'vision_cooldown_hit',
    placement,
    userId,
    timestamp: Date.now(),
    metadata: { cooldownEtaSec }
  });
}

/**
 * Track daily limit hit event
 */
export function trackVisionDailyLimitHit(
  placement: VisionPlacement,
  userId: string,
  remainingToday: number
): void {
  trackVisionEvent({
    event: 'vision_daily_limit_hit',
    placement,
    userId,
    timestamp: Date.now(),
    metadata: { remainingToday }
  });
}
