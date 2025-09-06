'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { 
  VisionPlacement, 
  VisionReward, 
  VisionResult, 
  VisionSession, 
  VisionEligibility,
  VisionAnalyticsEvent,
  VisionAnalyticsData
} from '@/types/vision';
import { checkVisionEligibility, getDefaultVisionConfig } from '@/lib/vision/eligibility';
import { grantOrbAction } from '../orbs/actions';

/**
 * Check vision eligibility for a user
 */
export async function checkVisionEligibilityAction(
  placement: VisionPlacement
): Promise<VisionEligibility> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Get user document
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return {
        enabled: false,
        reason: 'not-auth'
      };
    }

    const userData = userDoc.data();
    const featuresConfig = getDefaultVisionConfig();

    return checkVisionEligibility({
      userId: uid,
      userDoc: userData as any,
      featuresConfig,
      placement
    });

  } catch (error) {
    console.error('Error checking vision eligibility:', error);
    return {
      enabled: false,
      reason: 'cooldown'
    };
  }
}

/**
 * Start a vision session
 */
export async function startVisionAction(
  placement: VisionPlacement,
  reward: VisionReward
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Check eligibility first
    const eligibility = await checkVisionEligibilityAction(placement);
    if (!eligibility.enabled) {
      return {
        success: false,
        error: `Vision not available: ${eligibility.reason}`
      };
    }

    // Create vision session
    const sessionId = `vision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: VisionSession = {
      id: sessionId,
      placement,
      reward,
      userId: uid,
      startedAt: FieldValue.serverTimestamp() as any,
      status: 'started'
    };

    // Save session to database
    await adminDb.collection('vision_sessions').doc(sessionId).set(session);

    // Track analytics
    await trackVisionAnalytics({
      event: 'vision_start',
      placement,
      reward,
      userId: uid,
      sessionId,
      timestamp: Date.now()
    });

    return {
      success: true,
      sessionId
    };

  } catch (error) {
    console.error('Error starting vision:', error);
    return {
      success: false,
      error: 'Failed to start vision'
    };
  }
}

/**
 * Complete a vision session and grant rewards
 */
export async function completeVisionAction(
  sessionId: string
): Promise<VisionResult> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Get session
    const sessionDoc = await adminDb.collection('vision_sessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return {
        success: false,
        error: 'Vision session not found'
      };
    }

    const session = sessionDoc.data() as VisionSession;
    
    // Verify session belongs to user
    if (session.userId !== uid) {
      return {
        success: false,
        error: 'Unauthorized session'
      };
    }

    // Update session status
    await adminDb.collection('vision_sessions').doc(sessionId).update({
      completedAt: FieldValue.serverTimestamp(),
      status: 'completed'
    });

    // Grant rewards based on type
    if (session.reward === 'ORB') {
      // Grant 1 orb
      const orbResult = await grantOrbAction();
      if (!orbResult.success) {
        return {
          success: false,
          error: 'Failed to grant orb reward'
        };
      }
    }

    // Update user's last watch time
    await adminDb.collection('users').doc(uid).update({
      lastWatchAt: FieldValue.serverTimestamp()
    });

    // Mark session as rewarded
    await adminDb.collection('vision_sessions').doc(sessionId).update({
      rewardedAt: FieldValue.serverTimestamp(),
      status: 'rewarded'
    });

    // Track analytics
    await trackVisionAnalytics({
      event: 'vision_reward',
      placement: session.placement,
      reward: session.reward,
      userId: uid,
      sessionId,
      timestamp: Date.now()
    });

    return {
      success: true,
      reward: session.reward,
      orbsGranted: session.reward === 'ORB' ? 1 : 0,
      ritualUnlocked: session.reward === 'PASS'
    };

  } catch (error) {
    console.error('Error completing vision:', error);
    return {
      success: false,
      error: 'Failed to complete vision'
    };
  }
}

/**
 * Track vision analytics events
 */
async function trackVisionAnalytics(data: VisionAnalyticsData): Promise<void> {
  try {
    // In production, this would send to your analytics service
    // For now, we'll just log it
    console.log('Vision Analytics:', data);
    
    // You could also save to a Firestore collection for analysis
    await adminDb.collection('analytics').add({
      ...data,
      createdAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error tracking vision analytics:', error);
    // Don't throw - analytics failures shouldn't break the flow
  }
}

/**
 * Get user's vision statistics
 */
export async function getVisionStatsAction(): Promise<{
  success: boolean;
  stats?: {
    totalVisions: number;
    visionsToday: number;
    remainingToday: number;
    lastWatchAt?: Date;
  };
  error?: string;
}> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Get user document
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const userData = userDoc.data();
    const featuresConfig = getDefaultVisionConfig();
    
    // Calculate visions today
    const today = new Date().toISOString().split('T')[0];
    const lastWatchDate = userData.lastWatchAt 
      ? new Date(userData.lastWatchAt.toDate()).toISOString().split('T')[0]
      : null;
    
    const visionsToday = userData.lastWatchAt && lastWatchDate === today ? 1 : 0;
    const remainingToday = Math.max(0, featuresConfig.watchDailyLimit - visionsToday);

    // Get total visions (simplified - in production would query vision_sessions)
    const totalVisions = 0; // Placeholder

    return {
      success: true,
      stats: {
        totalVisions,
        visionsToday,
        remainingToday,
        lastWatchAt: userData.lastWatchAt ? userData.lastWatchAt.toDate() : undefined
      }
    };

  } catch (error) {
    console.error('Error getting vision stats:', error);
    return {
      success: false,
      error: 'Failed to get vision statistics'
    };
  }
}
