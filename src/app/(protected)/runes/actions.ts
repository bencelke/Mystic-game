'use server';

import { auth } from '@/lib/firebase/client';
import { adminDb, serverTimestamp } from '@/lib/firebase/admin';
import { addRitualXPAction } from '@/app/(protected)/progression/actions';
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
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const uid = user.uid;
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
