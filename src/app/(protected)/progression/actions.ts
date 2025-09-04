'use server';

import { auth } from '@/lib/firebase/client';
import { updateDailyStreak, addXP } from '@/lib/progression/service';
import { RITUAL_XP } from '@/lib/progression/constants';

// Daily check-in action
export async function dailyCheckInAction() {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const result = await updateDailyStreak(user.uid);
    
    return {
      success: true,
      streak: result.streak,
      awardedXP: result.awardedXP,
      newAchievement: result.newAchievement,
    };
  } catch (error) {
    console.error('Daily check-in failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Add ritual XP action
export async function addRitualXPAction(
  kind: keyof typeof RITUAL_XP
) {
  try {
    // For now, we'll use a mock user since auth is not fully implemented
    // In production, this would use proper server-side authentication
    const uid = 'mock-user-id';

    const baseXP = RITUAL_XP[kind];
    const result = await addXP(uid, baseXP, `ritual_${kind}`);

    return {
      success: true,
      level: result.level,
      totalXP: result.xp,
      awardedXP: baseXP,
    };
  } catch (error) {
    console.error('Ritual XP addition failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
