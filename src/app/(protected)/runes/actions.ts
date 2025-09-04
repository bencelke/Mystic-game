'use server';

import { auth } from '@/lib/firebase/client';
import { adminDb, serverTimestamp } from '@/lib/firebase/admin';
import { addRitualXPAction } from '@/app/(protected)/progression/actions';
import { spendOrbsAction } from '@/app/(protected)/orbs/actions';
import { dailySeed, pickFrom, isReversed } from '@/lib/random/seed';
import runesData from '@/content/runes.json';

// Type for rune data
interface RuneData {
  id: string;
  symbol: string;
  name: string;
  upright: string;
  reversed: string;
}

// Type for ritual log
interface RitualLog {
  type: 'rune';
  mode: 'daily';
  runeId: string;
  reversed: boolean;
  costOrbs: number;
  xpAwarded: number;
  seed: string;
  createdAt: any; // serverTimestamp
}

/**
 * Daily rune ritual action
 * Returns the same rune for the same user on the same day
 */
export async function dailyRuneAction() {
  try {
    // For now, we'll use a mock user since auth is not fully implemented
    // In production, this would use proper server-side authentication
    const uid = 'mock-user-id';
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Generate seed for today's rune
    const seed = dailySeed(uid, 'rune', today);
    
    // Check if user already claimed today's rune
    const existingLog = await adminDb
      .collection('ritual_logs')
      .doc(uid)
      .collection('daily')
      .doc(today)
      .get();

    if (existingLog.exists) {
      // User already claimed today - return the same result
      const logData = existingLog.data() as RitualLog;
      const rune = runesData.find(r => r.id === logData.runeId);
      
      if (!rune) {
        throw new Error('Rune not found in existing log');
      }

      return {
        success: true,
        rune,
        reversed: logData.reversed,
        xpAwarded: 0,
        alreadyClaimed: true,
      };
    }

    // First time today - generate new rune
    const rune = pickFrom(runesData as RuneData[], seed);
    const reversed = isReversed(seed);
    const xpAwarded = 10;

    // Create ritual log
    const ritualLog: RitualLog = {
      type: 'rune',
      mode: 'daily',
      runeId: rune.id,
      reversed,
      costOrbs: 0,
      xpAwarded,
      seed,
      createdAt: serverTimestamp,
    };

    // Write to ritual_logs/{uid}/daily/{date}
    await adminDb
      .collection('ritual_logs')
      .doc(uid)
      .collection('daily')
      .doc(today)
      .set(ritualLog);

    // Update codex/{uid}.runes (arrayUnion)
    await adminDb
      .collection('codex')
      .doc(uid)
      .set({
        runes: adminDb.FieldValue.arrayUnion(rune.id)
      }, { merge: true });

    // Award XP
    await addRitualXPAction('rune_single');

    return {
      success: true,
      rune,
      reversed,
      xpAwarded,
      alreadyClaimed: false,
    };

  } catch (error) {
    console.error('Daily rune action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Type for spread rune result
interface SpreadRuneResult {
  id: string;
  symbol: string;
  name: string;
  reversed: boolean;
  upright: string;
  reversedMeaning: string;
}

// Type for two-rune spread ritual log
interface TwoRuneSpreadLog {
  type: 'rune';
  mode: 'spread2';
  cards: Array<{ id: string; reversed: boolean }>;
  costOrbs: number;
  xpAwarded: number;
  createdAt: any; // serverTimestamp
}

// Type for three-rune spread ritual log
interface ThreeRuneSpreadLog {
  type: 'rune';
  mode: 'spread3';
  cards: Array<{ id: string; reversed: boolean }>;
  costOrbs: number;
  xpAwarded: number;
  createdAt: any; // serverTimestamp
}

/**
 * Two-rune spread ritual action
 * Costs 1 orb and returns 2 unique runes
 */
export async function twoRuneSpreadAction() {
  try {
    // For now, we'll use a mock user since auth is not fully implemented
    // In production, this would use proper server-side authentication
    const uid = 'mock-user-id';

    // Check if user has enough orbs (1 orb required)
    const orbResult = await spendOrbsAction(1);
    if (!orbResult.success) {
      return {
        success: false,
        error: orbResult.error || 'Not enough energy. Wait or watch a vision (ad).',
      };
    }

    // Pick 2 unique runes using crypto RNG
    const availableRunes = [...runesData] as RuneData[];
    const selectedRunes: RuneData[] = [];
    
    // Select first rune
    const firstIndex = Math.floor(Math.random() * availableRunes.length);
    selectedRunes.push(availableRunes[firstIndex]);
    
    // Remove first rune and select second unique rune
    availableRunes.splice(firstIndex, 1);
    const secondIndex = Math.floor(Math.random() * availableRunes.length);
    selectedRunes.push(availableRunes[secondIndex]);

    // Determine if each rune is reversed (50% chance each)
    const runeResults: SpreadRuneResult[] = selectedRunes.map(rune => ({
      id: rune.id,
      symbol: rune.symbol,
      name: rune.name,
      reversed: Math.random() < 0.5,
      upright: rune.upright,
      reversedMeaning: rune.reversed,
    }));

    const xpAwarded = 18;

    // Create ritual log
    const ritualLog: TwoRuneSpreadLog = {
      type: 'rune',
      mode: 'spread2',
      cards: runeResults.map(rune => ({ id: rune.id, reversed: rune.reversed })),
      costOrbs: 1,
      xpAwarded,
      createdAt: serverTimestamp,
    };

    // Write to ritual_logs/{uid}
    const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await adminDb
      .collection('ritual_logs')
      .doc(uid)
      .collection('spreads')
      .doc(logId)
      .set(ritualLog);

    // Update codex/{uid}.runes (arrayUnion each rune id)
    const runeIds = runeResults.map(rune => rune.id);
    await adminDb
      .collection('codex')
      .doc(uid)
      .set({
        runes: adminDb.FieldValue.arrayUnion(...runeIds)
      }, { merge: true });

    // Award XP
    await addRitualXPAction('rune_spread2');

    return {
      success: true,
      runes: runeResults,
      xpAwarded,
    };

  } catch (error) {
    console.error('Two-rune spread action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Three-rune spread ritual action
 * Costs 2 orbs and returns 3 unique runes
 */
export async function threeRuneSpreadAction() {
  try {
    // For now, we'll use a mock user since auth is not fully implemented
    // In production, this would use proper server-side authentication
    const uid = 'mock-user-id';

    // Check if user has enough orbs (2 orbs required)
    const orbResult = await spendOrbsAction(2);
    if (!orbResult.success) {
      return {
        success: false,
        error: orbResult.error || 'Not enough energy. Wait or watch a vision (ad).',
      };
    }

    // Pick 3 unique runes using crypto RNG
    const availableRunes = [...runesData] as RuneData[];
    const selectedRunes: RuneData[] = [];
    
    // Select first rune
    const firstIndex = Math.floor(Math.random() * availableRunes.length);
    selectedRunes.push(availableRunes[firstIndex]);
    
    // Remove first rune and select second unique rune
    availableRunes.splice(firstIndex, 1);
    const secondIndex = Math.floor(Math.random() * availableRunes.length);
    selectedRunes.push(availableRunes[secondIndex]);
    
    // Remove second rune and select third unique rune
    availableRunes.splice(secondIndex, 1);
    const thirdIndex = Math.floor(Math.random() * availableRunes.length);
    selectedRunes.push(availableRunes[thirdIndex]);

    // Determine if each rune is reversed (50% chance each)
    const runeResults: SpreadRuneResult[] = selectedRunes.map(rune => ({
      id: rune.id,
      symbol: rune.symbol,
      name: rune.name,
      reversed: Math.random() < 0.5,
      upright: rune.upright,
      reversedMeaning: rune.reversed,
    }));

    const xpAwarded = 24;

    // Create ritual log
    const ritualLog: ThreeRuneSpreadLog = {
      type: 'rune',
      mode: 'spread3',
      cards: runeResults.map(rune => ({ id: rune.id, reversed: rune.reversed })),
      costOrbs: 2,
      xpAwarded,
      createdAt: serverTimestamp,
    };

    // Write to ritual_logs/{uid}
    const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await adminDb
      .collection('ritual_logs')
      .doc(uid)
      .collection('spreads')
      .doc(logId)
      .set(ritualLog);

    // Update codex/{uid}.runes (arrayUnion each rune id)
    const runeIds = runeResults.map(rune => rune.id);
    await adminDb
      .collection('codex')
      .doc(uid)
      .set({
        runes: adminDb.FieldValue.arrayUnion(...runeIds)
      }, { merge: true });

    // Award XP
    await addRitualXPAction('rune_spread3');

    return {
      success: true,
      runes: runeResults,
      xpAwarded,
    };

  } catch (error) {
    console.error('Three-rune spread action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Ad-based rune ritual action
 * Allows Free users to watch ads for extra ritual pulls
 */
export async function adRuneAction(mode: 'daily' | 'spread2' | 'spread3') {
  try {
    // For now, we'll use a mock user since auth is not fully implemented
    const uid = 'mock-user-id';

    // Mock user data - in production, this would come from Firestore
    const mockUser = {
      proEntitlement: false, // Set to true to test Pro user behavior
      lastWatchAt: null, // Set to a recent timestamp to test cooldown
    };

    // Check if user is Pro - if so, skip ad and run ritual directly
    if (mockUser.proEntitlement) {
      switch (mode) {
        case 'daily':
          return await dailyRuneAction();
        case 'spread2':
          return await twoRuneSpreadAction();
        case 'spread3':
          return await threeRuneSpreadAction();
        default:
          return { success: false, error: 'Invalid ritual mode' };
      }
    }

    // For Free users, check ad eligibility
    const featuresConfig = {
      watchToEarnEnabled: true,
      watchCooldownMin: 30, // 30 minutes cooldown
    };

    if (!featuresConfig.watchToEarnEnabled) {
      return {
        success: false,
        error: 'Watch-to-earn is currently disabled',
      };
    }

    // Check cooldown
    if (mockUser.lastWatchAt) {
      const lastWatchTime = new Date(mockUser.lastWatchAt);
      const cooldownMs = featuresConfig.watchCooldownMin * 60 * 1000;
      const timeSinceLastWatch = Date.now() - lastWatchTime.getTime();
      
      if (timeSinceLastWatch < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastWatch) / (60 * 1000));
        return {
          success: false,
          error: `Vision not ready. Come back in ${remainingMinutes}m.`,
        };
      }
    }

    // Simulate ad completion (placeholder)
    // In production, this would be triggered by the actual ad SDK
    console.log('Simulating ad completion...');

    // Update user's lastWatchAt timestamp
    await adminDb
      .collection('users')
      .doc(uid)
      .set({
        lastWatchAt: serverTimestamp,
      }, { merge: true });

    // Run the appropriate ritual
    let ritualResult;
    switch (mode) {
      case 'daily':
        ritualResult = await dailyRuneAction();
        break;
      case 'spread2':
        ritualResult = await twoRuneSpreadAction();
        break;
      case 'spread3':
        ritualResult = await threeRuneSpreadAction();
        break;
      default:
        return { success: false, error: 'Invalid ritual mode' };
    }

    // Add adUnlocked flag to the result
    if (ritualResult.success) {
      return {
        ...ritualResult,
        adUnlocked: true,
      };
    }

    return ritualResult;

  } catch (error) {
    console.error('Ad rune action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
