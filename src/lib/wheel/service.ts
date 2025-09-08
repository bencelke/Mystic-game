import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { FeaturesConfig, WheelLedgerDoc, InventoryDoc } from '@/types/mystic';
import { selectReward } from './random';
import { WHEEL_SEGMENTS } from './rewards';

/**
 * Get wheel configuration with defaults
 */
export async function getConfig(): Promise<FeaturesConfig> {
  try {
    const configRef = adminDb.collection('features').doc('config');
    const configSnap = await configRef.get();
    
    if (configSnap.exists) {
      const config = configSnap.data() as FeaturesConfig;
      return {
        ...config,
        // Ensure wheel settings have defaults
        wheelDailyFree: config.wheelDailyFree ?? 1,
        wheelDailyFreePro: config.wheelDailyFreePro ?? 2,
        wheelAllowVisionExtra: config.wheelAllowVisionExtra ?? true,
        wheelDailyMax: config.wheelDailyMax ?? 5,
        wheelVisionPlacement: config.wheelVisionPlacement ?? 'wheel'
      };
    } else {
      // Return default config if not found
      return {
        watchToEarnEnabled: true,
        watchCooldownMin: 30,
        watchDailyLimit: 5,
        dailyRitualEnabled: true,
        proFeaturesEnabled: true,
        socialFeaturesEnabled: false,
        offlineModeEnabled: false,
        inlineWheelEnabled: false,
        wheelDailyFree: 1,
        wheelDailyFreePro: 2,
        wheelAllowVisionExtra: true,
        wheelDailyMax: 5,
        wheelVisionPlacement: 'wheel'
      };
    }
  } catch (error) {
    console.error('Error getting wheel config:', error);
    // Return safe defaults
    return {
      watchToEarnEnabled: true,
      watchCooldownMin: 30,
      watchDailyLimit: 5,
      dailyRitualEnabled: true,
      proFeaturesEnabled: true,
      socialFeaturesEnabled: false,
      offlineModeEnabled: false,
      inlineWheelEnabled: false,
      wheelDailyFree: 1,
      wheelDailyFreePro: 2,
      wheelAllowVisionExtra: true,
      wheelDailyMax: 5,
      wheelVisionPlacement: 'wheel'
    };
  }
}

/**
 * Get or create wheel ledger for a user
 */
export async function getOrCreateLedger(uid: string): Promise<WheelLedgerDoc> {
  const today = new Date().toISOString().split('T')[0]; // UTC date key
  const ledgerRef = adminDb.collection('wheel_ledger').doc(uid);
  const ledgerSnap = await ledgerRef.get();
  
  if (ledgerSnap.exists) {
    const ledger = ledgerSnap.data() as WheelLedgerDoc;
    
    // Reset if date changed
    if (ledger.dateKey !== today) {
      const resetLedger: WheelLedgerDoc = {
        dateKey: today,
        spinsToday: 0
      };
      await ledgerRef.set(resetLedger);
      return resetLedger;
    }
    
    return ledger;
  } else {
    // Create new ledger
    const newLedger: WheelLedgerDoc = {
      dateKey: today,
      spinsToday: 0
    };
    await ledgerRef.set(newLedger);
    return newLedger;
  }
}

/**
 * Get remaining spins for a user
 */
export async function spinsRemaining(uid: string): Promise<{
  used: number;
  freeLimit: number;
  max: number;
  remaining: number;
}> {
  const config = await getConfig();
  const ledger = await getOrCreateLedger(uid);
  
  // Get user's pro status
  const userDoc = await adminDb.collection('users').doc(uid).get();
  const userData = userDoc.exists ? userDoc.data() : null;
  const isPro = userData?.proEntitlement || false;
  
  const freeLimit = isPro ? config.wheelDailyFreePro : config.wheelDailyFree;
  const max = config.wheelDailyMax;
  const used = ledger.spinsToday;
  const remaining = Math.max(0, max - used);
  
  return { used, freeLimit, max, remaining };
}

/**
 * Check if user can spin
 */
export async function canSpin(uid: string): Promise<boolean> {
  const { remaining } = await spinsRemaining(uid);
  return remaining > 0;
}

/**
 * Apply a reward to the user
 */
export async function applyReward(uid: string, reward: { kind: "ORB" | "XP" | "STREAK_FREEZE"; value: number }): Promise<{
  orbsGranted?: number;
  xpGranted?: number;
  streakFreezeGranted?: number;
}> {
  const result: any = {};
  
  try {
    if (reward.kind === "ORB") {
      // Grant orbs by calling the orbs service
      const { grantOrbAction } = await import('@/app/(protected)/orbs/actions');
      for (let i = 0; i < reward.value; i++) {
        await grantOrbAction();
      }
      result.orbsGranted = reward.value;
    } else if (reward.kind === "XP") {
      // Grant XP by calling the progression service
      const { addRitualXPAction } = await import('@/app/(protected)/progression/actions');
      // Add XP multiple times for the value
      for (let i = 0; i < reward.value; i++) {
        await addRitualXPAction('wheel');
      }
      result.xpGranted = reward.value;
    } else if (reward.kind === "STREAK_FREEZE") {
      // Update inventory
      const inventoryRef = adminDb.collection('inventory').doc(uid);
      await inventoryRef.set({
        streakFreeze: FieldValue.increment(reward.value)
      }, { merge: true });
      result.streakFreezeGranted = reward.value;
    }
    
    return result;
  } catch (error) {
    console.error('Error applying reward:', error);
    throw new Error('Failed to apply reward');
  }
}

/**
 * Perform a wheel spin
 */
export async function spin(uid: string, mode: "daily" | "vision"): Promise<{
  segment: any;
  summary: any;
  spinsRemainingAfter: number;
}> {
  // Check if user can spin
  const canSpinResult = await canSpin(uid);
  if (!canSpinResult) {
    throw new Error('No spins remaining today');
  }
  
  // Select reward
  const { segment, index } = selectReward();
  
  // Apply reward
  const summary = await applyReward(uid, { kind: segment.kind, value: segment.value });
  
  // Update ledger
  const ledgerRef = adminDb.collection('wheel_ledger').doc(uid);
  await ledgerRef.update({
    spinsToday: FieldValue.increment(1),
    lastSpinAt: FieldValue.serverTimestamp()
  });
  
  // Write ritual log
  const ritualLog = {
    type: "wheel",
    mode: mode,
    wheelResult: {
      kind: segment.kind,
      value: segment.value
    },
    costOrbs: 0,
    xpAwarded: 0,
    createdAt: FieldValue.serverTimestamp()
  };
  
  const ritualLogsRef = adminDb.collection('ritual_logs').doc(uid);
  const ritualLogsDoc = await ritualLogsRef.get();
  
  let existingLogs = [];
  if (ritualLogsDoc.exists) {
    const logsData = ritualLogsDoc.data();
    existingLogs = logsData?.logs || [];
  }
  
  await ritualLogsRef.set({
    logs: [...existingLogs, ritualLog]
  }, { merge: true });
  
  // Get updated spins remaining
  const { remaining } = await spinsRemaining(uid);
  
  return {
    segment: { ...segment, index },
    summary,
    spinsRemainingAfter: remaining
  };
}
