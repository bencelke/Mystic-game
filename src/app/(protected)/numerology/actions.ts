'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { dailyNumber, getNumberMeaning, formatNumber, lifePath, nameNumber, compatibilityScore, compatibilityBlurb } from '@/lib/numerology/calc';
import { addRitualXPAction } from '../progression/actions';
import { spendOrbsAction } from '../orbs/actions';
import { adRuneAction } from '../runes/actions';
import { incNumCount, incCompat } from '@/lib/stats/service';

export interface DailyNumerologyResult {
  success: boolean;
  number?: number;
  meaning?: string;
  xpAwarded?: number;
  alreadyClaimed?: boolean;
  error?: string;
}

export interface DeepNumerologyResult {
  success: boolean;
  number?: number;
  deepContent?: string;
  xpAwarded?: number;
  error?: string;
}

export interface CompatibilityInput {
  partnerName: string;
  partnerDob: string;
}

export interface CompatibilityResult {
  success: boolean;
  you?: {
    lp: number; // Life path
    nn: number; // Name number
  };
  partner?: {
    lp: number;
    nn: number;
  };
  score?: number;
  blurb?: string;
  xpAwarded?: number;
  error?: string;
}

export async function dailyNumerologyAction(): Promise<DailyNumerologyResult> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Get user document to check DOB
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const userData = userDoc.data();
    if (!userData?.dob) {
      return {
        success: false,
        error: 'Set your birth date in Account to unlock Numerology.'
      };
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already claimed today
    const ritualLogsRef = adminDb.collection('ritual_logs').doc(uid);
    const ritualLogsDoc = await ritualLogsRef.get();
    
    let existingLogs = [];
    if (ritualLogsDoc.exists) {
      const logsData = ritualLogsDoc.data();
      existingLogs = logsData?.logs || [];
    }

    // Check if numerology daily ritual was already performed today
    const todayLog = existingLogs.find((log: any) => 
      log.type === 'numerology' && 
      log.mode === 'daily' && 
      log.createdAt && 
      new Date(log.createdAt.toDate()).toISOString().split('T')[0] === today
    );

    if (todayLog) {
      return {
        success: true,
        number: todayLog.number,
        meaning: getNumberMeaning(todayLog.number),
        xpAwarded: todayLog.xpAwarded,
        alreadyClaimed: true
      };
    }

    // Calculate today's numerology number
    const number = dailyNumber(userData.dob, today);
    const meaning = getNumberMeaning(number);
    const xpAwarded = 10;

    // Create new ritual log
    const newLog = {
      type: 'numerology',
      mode: 'daily',
      number: number,
      costOrbs: 0,
      xpAwarded: xpAwarded,
      createdAt: FieldValue.serverTimestamp()
    };

    // Update ritual logs
    await ritualLogsRef.set({
      logs: [...existingLogs, newLog]
    }, { merge: true });

    // Update codex with new numerology number
    const codexRef = adminDb.collection('codex').doc(uid);
    await codexRef.set({
      numerology: FieldValue.arrayUnion(number)
    }, { merge: true });

    // Award XP
    await addRitualXPAction('numerology_basic');

    // Increment numerology count for stats
    await incNumCount(number.toString());

    return {
      success: true,
      number: number,
      meaning: meaning,
      xpAwarded: xpAwarded,
      alreadyClaimed: false
    };

  } catch (error) {
    console.error('Error in dailyNumerologyAction:', error);
    return {
      success: false,
      error: 'Failed to perform numerology ritual. Please try again.'
    };
  }
}

export async function deepNumerologyAction(): Promise<DeepNumerologyResult> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Get user document to check Pro entitlement and DOB
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const userData = userDoc.data();
    if (!userData?.dob) {
      return {
        success: false,
        error: 'Set your birth date in Account to unlock Numerology.'
      };
    }

    // Check Pro entitlement
    if (!userData?.proEntitlement) {
      return {
        success: false,
        error: 'Upgrade required'
      };
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate today's numerology number
    const number = dailyNumber(userData.dob, today);
    const xpAwarded = 18;

    // Generate deep content (placeholder for now, GPT integration later)
    const deepContent = `This is a deep placeholder interpretation for number ${number}. In a real implementation, this would be generated by GPT based on the user's numerology number, birth date, and current cosmic influences. The deep reading would provide detailed insights into personal growth, challenges, opportunities, and spiritual guidance specific to this number's energy for today.`;

    // Create new ritual log
    const newLog = {
      type: 'numerology',
      mode: 'deep',
      number: number,
      deepContent: deepContent,
      costOrbs: 0,
      xpAwarded: xpAwarded,
      createdAt: FieldValue.serverTimestamp()
    };

    // Get existing ritual logs
    const ritualLogsRef = adminDb.collection('ritual_logs').doc(uid);
    const ritualLogsDoc = await ritualLogsRef.get();
    
    let existingLogs = [];
    if (ritualLogsDoc.exists) {
      const logsData = ritualLogsDoc.data();
      existingLogs = logsData?.logs || [];
    }

    // Update ritual logs
    await ritualLogsRef.set({
      logs: [...existingLogs, newLog]
    }, { merge: true });

    // Update codex with new numerology number
    const codexRef = adminDb.collection('codex').doc(uid);
    await codexRef.set({
      numerology: FieldValue.arrayUnion(number)
    }, { merge: true });

    // Award XP
    await addRitualXPAction('numerology_deep');

    return {
      success: true,
      number: number,
      deepContent: deepContent,
      xpAwarded: xpAwarded
    };

  } catch (error) {
    console.error('Error in deepNumerologyAction:', error);
    return {
      success: false,
      error: 'Failed to perform deep numerology ritual. Please try again.'
    };
  }
}

export async function compatibilityAction(input: CompatibilityInput): Promise<CompatibilityResult> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-user-id';
    
    // Get user document to check Pro entitlement and get user data
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const userData = userDoc.data();
    const isPro = userData?.proEntitlement || false;
    
    // Check if user has DOB set, if not, we'll need to handle this in UI
    if (!userData?.dob) {
      return {
        success: false,
        error: 'Please set your birth date in Account settings first.'
      };
    }

    // For Free users, check orbs or handle ad flow
    if (!isPro) {
      try {
        // Try to spend orbs first
        const orbResult = await spendOrbsAction(1);
        if (!orbResult.success) {
          // If insufficient orbs, this would trigger ad flow in UI
          return {
            success: false,
            error: 'Insufficient orbs. Watch a Vision to proceed.'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to process orb payment. Please try again.'
        };
      }
    }

    // Calculate numerology numbers for both people
    const youLp = lifePath(userData.dob);
    const youNn = nameNumber(userData.name || 'User'); // Fallback name if not set
    const partnerLp = lifePath(input.partnerDob);
    const partnerNn = nameNumber(input.partnerName);

    // Calculate compatibility score
    const score = compatibilityScore(
      { lp: youLp, nn: youNn },
      { lp: partnerLp, nn: partnerNn }
    );

    // Generate compatibility blurb
    const masters = {
      a: (youLp === 11 || youLp === 22) ? youLp as 11 | 22 : undefined,
      b: (partnerLp === 11 || partnerLp === 22) ? partnerLp as 11 | 22 : undefined
    };
    
    const blurb = compatibilityBlurb(score, youLp, partnerLp, youNn, partnerNn, masters);

    // Create ritual log
    const newLog = {
      type: 'numerology',
      mode: 'compatibility',
      inputs: {
        you: { name: userData.name || 'User', dob: userData.dob },
        partner: { name: input.partnerName, dob: input.partnerDob }
      },
      results: {
        lpA: youLp,
        lpB: partnerLp,
        nnA: youNn,
        nnB: partnerNn,
        score: score
      },
      costOrbs: isPro ? 0 : 1,
      xpAwarded: 10,
      createdAt: FieldValue.serverTimestamp()
    };

    // Get existing ritual logs
    const ritualLogsRef = adminDb.collection('ritual_logs').doc(uid);
    const ritualLogsDoc = await ritualLogsRef.get();
    
    let existingLogs = [];
    if (ritualLogsDoc.exists) {
      const logsData = ritualLogsDoc.data();
      existingLogs = logsData?.logs || [];
    }

    // Update ritual logs
    await ritualLogsRef.set({
      logs: [...existingLogs, newLog]
    }, { merge: true });

    // Update codex with new numerology numbers
    const codexRef = adminDb.collection('codex').doc(uid);
    const newNumbers = [youLp, youNn, partnerLp, partnerNn].filter((num, index, arr) => 
      arr.indexOf(num) === index // Remove duplicates
    );
    
    await codexRef.set({
      numerology: FieldValue.arrayUnion(...newNumbers)
    }, { merge: true });

    // Award XP
    await addRitualXPAction('numerology_basic');

    // Increment compatibility count for stats
    await incCompat();

    return {
      success: true,
      you: { lp: youLp, nn: youNn },
      partner: { lp: partnerLp, nn: partnerNn },
      score: score,
      blurb: blurb,
      xpAwarded: 10
    };

  } catch (error) {
    console.error('Error in compatibilityAction:', error);
    return {
      success: false,
      error: 'Failed to perform compatibility ritual. Please try again.'
    };
  }
}
