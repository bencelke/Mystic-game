import { getProgress, getQuizStats } from './local';
import { getRune } from '@/lib/content/runes';
import { getNumber } from '@/lib/content/numbers';
import { RuneId } from '@/content/runes-ids';
import { NumberId } from '@/content/numbers-ids';

// Count unlocked runes
export function countUnlockedRunes(): number {
  const progress = getProgress();
  return progress.unlockedRunes.length;
}

// Count unlocked numbers
export function countUnlockedNumbers(): number {
  const progress = getProgress();
  return progress.unlockedNumbers.length;
}

// Get quiz averages
export function quizAverages(): { bestAvg: number; attempted: number } {
  const progress = getProgress();
  const allStats = [
    ...Object.values(progress.quiz.runes),
    ...Object.values(progress.quiz.numbers)
  ];

  if (allStats.length === 0) {
    return { bestAvg: 0, attempted: 0 };
  }

  const bestAvg = allStats.reduce((sum, stat) => sum + stat.best, 0) / allStats.length;
  const attempted = allStats.filter(stat => stat.attempts > 0).length;

  return {
    bestAvg: Math.round(bestAvg),
    attempted
  };
}

// Pick weakest unlocked item for suggested quiz
export function pickWeakestItem(): { kind: 'rune' | 'number'; id: string | number; name: string } | null {
  const progress = getProgress();
  
  // Get all unlocked runes with their quiz stats
  const runeStats = progress.unlockedRunes.map(id => {
    const stats = getQuizStats('rune', id);
    const rune = getRune(id as RuneId);
    return {
      kind: 'rune' as const,
      id,
      name: rune?.name || `Rune ${id}`,
      best: stats?.best || 0,
      attempts: stats?.attempts || 0
    };
  });

  // Get all unlocked numbers with their quiz stats
  const numberStats = progress.unlockedNumbers.map(id => {
    const stats = getQuizStats('number', id);
    const number = getNumber(id as NumberId);
    return {
      kind: 'number' as const,
      id,
      name: number?.name || `Number ${id}`,
      best: stats?.best || 0,
      attempts: stats?.attempts || 0
    };
  });

  // Combine and sort by priority: no attempts first, then lowest best score
  const allItems = [...runeStats, ...numberStats];
  
  if (allItems.length === 0) {
    return null;
  }

  // Sort by attempts (ascending) then by best score (ascending)
  allItems.sort((a, b) => {
    if (a.attempts === 0 && b.attempts > 0) return -1;
    if (a.attempts > 0 && b.attempts === 0) return 1;
    return a.best - b.best;
  });

  return {
    kind: allItems[0].kind,
    id: allItems[0].id,
    name: allItems[0].name
  };
}

// Get progress percentage for runes
export function getRunesProgress(): { current: number; total: number; percentage: number } {
  const current = countUnlockedRunes();
  const total = 24; // Elder Futhark has 24 runes
  const percentage = Math.round((current / total) * 100);
  
  return { current, total, percentage };
}

// Get progress percentage for numbers
export function getNumbersProgress(): { current: number; total: number; percentage: number } {
  const current = countUnlockedNumbers();
  const total = 11; // 1-9 + 11 + 22
  const percentage = Math.round((current / total) * 100);
  
  return { current, total, percentage };
}

// Get overall progress
export function getOverallProgress(): { 
  runes: { current: number; total: number; percentage: number };
  numbers: { current: number; total: number; percentage: number };
  quiz: { bestAvg: number; attempted: number };
} {
  return {
    runes: getRunesProgress(),
    numbers: getNumbersProgress(),
    quiz: quizAverages()
  };
}
