import { QuizResult } from '@/types/quiz';

// Simple seeded random number generator
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
}

// Deterministic shuffle using a seed
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const shuffled = [...items];
  const staticSalt = 'mystic-quiz-v1';
  const fullSeed = `${seed}:${staticSalt}`;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const random = seededRandom(`${fullSeed}:${i}`);
    const j = Math.floor(random * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Calculate quiz score
export function scoreQuiz(answered: Array<{ correct: boolean }>): QuizResult {
  const correct = answered.filter(a => a.correct).length;
  const total = answered.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  // XP calculation: 5 per correct answer + 15 bonus for perfect score
  let xpEarned = correct * 5;
  if (percent === 100) {
    xpEarned += 15;
  }
  
  return {
    correct,
    total,
    percent,
    xpEarned
  };
}

// Generate a quiz seed for consistent question ordering
export function generateQuizSeed(kind: 'rune' | 'number', id: string | number): string {
  return `${kind}:${id}:v1`;
}

// Format percentage for display
export function formatPercentage(percent: number): string {
  return `${percent}%`;
}

// Format XP for display
export function formatXP(xp: number): string {
  return `+${xp} XP`;
}
