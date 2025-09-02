// Progression Service (Server-side)

import { adminDb } from '@/lib/firebase/admin';
import { levelFromXP, isSameUTCDate } from './math';
import { DAILY_CHECKIN_XP, ACHIEVEMENT_IDS, PRO_XP_MULTIPLIER } from './constants';
import type { UserDoc } from '@/types/mystic';

// Helper to get user document
async function getUser(uid: string): Promise<UserDoc | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) return null;
    return userDoc.data() as UserDoc;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Helper to update user document
async function setUser(uid: string, partial: Partial<UserDoc>): Promise<void> {
  try {
    await adminDb.collection('users').doc(uid).update(partial);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Get pro multiplier for user
export async function getProMultiplier(uid: string): Promise<number> {
  try {
    const user = await getUser(uid);
    if (!user) return 1;
    
    // TODO: When FeaturesConfig is available, check for override
    // For now, use simple proEntitlement check
    return user.proEntitlement ? PRO_XP_MULTIPLIER : 1;
  } catch (error) {
    console.error('Error getting pro multiplier:', error);
    return 1;
  }
}

// Add XP to user and recalculate level
export async function addXP(
  uid: string, 
  amount: number, 
  reason: string
): Promise<{ xp: number; level: number }> {
  try {
    const user = await getUser(uid);
    if (!user) {
      throw new Error('User not found');
    }

    // Apply pro multiplier for ritual XP (not daily check-in)
    const multiplier = reason === 'daily_checkin' ? 1 : await getProMultiplier(uid);
    const adjustedAmount = Math.floor(amount * multiplier);

    const newXP = user.xp + adjustedAmount;
    const newLevel = levelFromXP(newXP);

    // Update user document
    await setUser(uid, {
      xp: newXP,
      level: newLevel,
    });

    return { xp: newXP, level: newLevel };
  } catch (error) {
    console.error('Error adding XP:', error);
    throw error;
  }
}

// Update daily streak and award check-in XP
export async function updateDailyStreak(
  uid: string, 
  now = new Date()
): Promise<{ streak: number; awardedXP: number; newAchievement?: string }> {
  try {
    const user = await getUser(uid);
    if (!user) {
      throw new Error('User not found');
    }

    const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
    const isNewDay = !lastLogin || !isSameUTCDate(lastLogin, now);

    if (!isNewDay) {
      // Same day, no change
      return { 
        streak: user.streak, 
        awardedXP: 0 
      };
    }

    // New day, increment streak
    const newStreak = user.streak + 1;
    let newAchievement: string | undefined;

    // Check for new achievements
    const achievements = user.achievements || [];
    if (newStreak === 3 && !achievements.includes(ACHIEVEMENT_IDS.STREAK_3)) {
      newAchievement = ACHIEVEMENT_IDS.STREAK_3;
      achievements.push(ACHIEVEMENT_IDS.STREAK_3);
    } else if (newStreak === 7 && !achievements.includes(ACHIEVEMENT_IDS.STREAK_7)) {
      newAchievement = ACHIEVEMENT_IDS.STREAK_7;
      achievements.push(ACHIEVEMENT_IDS.STREAK_7);
    }

    // Award daily check-in XP
    const { xp, level } = await addXP(uid, DAILY_CHECKIN_XP, 'daily_checkin');

    // Update user document
    await setUser(uid, {
      streak: newStreak,
      lastLoginAt: now,
      achievements,
      xp,
      level,
    });

    return {
      streak: newStreak,
      awardedXP: DAILY_CHECKIN_XP,
      newAchievement,
    };
  } catch (error) {
    console.error('Error updating daily streak:', error);
    throw error;
  }
}
