// Vision System Types for Watch-to-Earn functionality
import { Timestamp } from './mystic';

export type VisionPlacement =
  | "rune_daily"
  | "rune_spread2"
  | "rune_spread3"
  | "numerology_daily"
  | "numerology_compat"
  | "wheel";

export type VisionReward = "ORB" | "PASS";

export type VisionEligibility = {
  enabled: boolean;
  reason?: "not-auth" | "pro" | "cooldown" | "daily-limit" | "ok";
  cooldownEtaSec?: number;
  remainingToday?: number;
};

export interface VisionSession {
  id: string;
  placement: VisionPlacement;
  reward: VisionReward;
  userId: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  rewardedAt?: Timestamp;
  status: "started" | "completed" | "rewarded" | "failed";
}

export interface VisionResult {
  success: boolean;
  reward?: VisionReward;
  orbsGranted?: number;
  ritualUnlocked?: boolean;
  error?: string;
}

export interface VisionConfig {
  enabled: boolean;
  cooldownMinutes: number;
  dailyLimit: number;
  orbRewardAmount: number;
}

// Analytics events for vision tracking
export type VisionAnalyticsEvent = 
  | "vision_start"
  | "vision_complete" 
  | "vision_reward"
  | "vision_failed"
  | "vision_cooldown_hit"
  | "vision_daily_limit_hit";

export interface VisionAnalyticsData {
  event: VisionAnalyticsEvent;
  placement: VisionPlacement;
  reward?: VisionReward;
  userId: string;
  sessionId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}
