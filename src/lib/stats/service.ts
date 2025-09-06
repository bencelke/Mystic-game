import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Get UTC date key in YYYY-MM-DD format
 */
export function dateKeyUTC(d: Date = new Date()): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Increment rune draw count for today
 */
export async function incRuneCount(runeId: string, n: number = 1): Promise<void> {
  const dateKey = dateKeyUTC();
  const statsRef = adminDb.collection('global_stats').doc(dateKey);
  
  await statsRef.set({
    runeDraws: FieldValue.increment(n),
    [`runeCounts.${runeId}`]: FieldValue.increment(n),
    lastUpdated: FieldValue.serverTimestamp()
  }, { merge: true });
}

/**
 * Increment numerology read count for today
 */
export async function incNumCount(numKey: string, n: number = 1): Promise<void> {
  const dateKey = dateKeyUTC();
  const statsRef = adminDb.collection('global_stats').doc(dateKey);
  
  await statsRef.set({
    numerologyReads: FieldValue.increment(n),
    [`numCounts.${numKey}`]: FieldValue.increment(n),
    lastUpdated: FieldValue.serverTimestamp()
  }, { merge: true });
}

/**
 * Increment compatibility read count for today
 */
export async function incCompat(n: number = 1): Promise<void> {
  const dateKey = dateKeyUTC();
  const statsRef = adminDb.collection('global_stats').doc(dateKey);
  
  await statsRef.set({
    compatReads: FieldValue.increment(n),
    lastUpdated: FieldValue.serverTimestamp()
  }, { merge: true });
}

/**
 * Get today's rune count for a specific rune
 */
export async function getTodayRuneCount(runeId: string): Promise<number> {
  const dateKey = dateKeyUTC();
  const statsRef = adminDb.collection('global_stats').doc(dateKey);
  const statsDoc = await statsRef.get();
  
  if (!statsDoc.exists) {
    return 0;
  }
  
  const data = statsDoc.data();
  return data?.runeCounts?.[runeId] || 0;
}

/**
 * Get today's numerology count for a specific number
 */
export async function getTodayNumCount(numKey: string): Promise<number> {
  const dateKey = dateKeyUTC();
  const statsRef = adminDb.collection('global_stats').doc(dateKey);
  const statsDoc = await statsRef.get();
  
  if (!statsDoc.exists) {
    return 0;
  }
  
  const data = statsDoc.data();
  return data?.numCounts?.[numKey] || 0;
}

/**
 * Get today's compatibility read count
 */
export async function getTodayCompatCount(): Promise<number> {
  const dateKey = dateKeyUTC();
  const statsRef = adminDb.collection('global_stats').doc(dateKey);
  const statsDoc = await statsRef.get();
  
  if (!statsDoc.exists) {
    return 0;
  }
  
  const data = statsDoc.data();
  return data?.compatReads || 0;
}

/**
 * Get today's total rune draws
 */
export async function getTodayRuneDraws(): Promise<number> {
  const dateKey = dateKeyUTC();
  const statsRef = adminDb.collection('global_stats').doc(dateKey);
  const statsDoc = await statsRef.get();
  
  if (!statsDoc.exists) {
    return 0;
  }
  
  const data = statsDoc.data();
  return data?.runeDraws || 0;
}

/**
 * Get today's total numerology reads
 */
export async function getTodayNumerologyReads(): Promise<number> {
  const dateKey = dateKeyUTC();
  const statsRef = adminDb.collection('global_stats').doc(dateKey);
  const statsDoc = await statsRef.get();
  
  if (!statsDoc.exists) {
    return 0;
  }
  
  const data = statsDoc.data();
  return data?.numerologyReads || 0;
}
