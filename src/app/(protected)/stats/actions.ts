'use server';

import { getTodayRuneCount, getTodayNumCount, getTodayCompatCount } from '@/lib/stats/service';

/**
 * Get today's rune count for a specific rune
 */
export async function getTodayRuneCountAction(runeId: string): Promise<{ count: number }> {
  try {
    const count = await getTodayRuneCount(runeId);
    return { count };
  } catch (error) {
    console.error('Error getting today rune count:', error);
    return { count: 0 };
  }
}

/**
 * Get today's numerology count for a specific number
 */
export async function getTodayNumCountAction(numKey: string): Promise<{ count: number }> {
  try {
    const count = await getTodayNumCount(numKey);
    return { count };
  } catch (error) {
    console.error('Error getting today num count:', error);
    return { count: 0 };
  }
}

/**
 * Get today's compatibility read count
 */
export async function getTodayCompatCountAction(): Promise<{ count: number }> {
  try {
    const count = await getTodayCompatCount();
    return { count };
  } catch (error) {
    console.error('Error getting today compat count:', error);
    return { count: 0 };
  }
}
