import { RuneId } from '@/content/runes-ids';
import { NumberId } from '@/content/numbers-ids';
import { QuizStats, LocalProgress } from '@/types/quiz';
import { JournalEntry, JournalStorage, JournalLimits, JournalFeedOptions, JournalSaveOptions } from '@/types/journal';
import { getLocalPro } from '@/lib/pro/localPro';

// Progress data structure (backward compatible)
export interface ProgressData {
  unlockedRunes: string[];
  unlockedNumbers: number[];
  quiz: {
    runes: Record<string, QuizStats>;
    numbers: Record<string, QuizStats>;
  };
  xp?: number;
  journal: JournalStorage;
  loreRead: {
    runes: Record<string, boolean>;
    numbers: Record<string, boolean>;
  };
  notesCount: {
    runes: Record<string, number>;
    numbers: Record<string, number>;
  };
}

// Default progress data
const defaultProgress: ProgressData = {
  unlockedRunes: [],
  unlockedNumbers: [],
  quiz: {
    runes: {},
    numbers: {},
  },
  xp: 0,
  journal: {
    entries: {},
    indexByDate: {},
  },
  loreRead: {
    runes: {},
    numbers: {},
  },
  notesCount: {
    runes: {},
    numbers: {},
  },
};

// Storage key
const STORAGE_KEY = 'mystic:progress';

// Helper to safely access localStorage
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

// Migrate old quiz format to new QuizStats format
function migrateQuizStats(oldStats: Record<string, any>): Record<string, QuizStats> {
  const migrated: Record<string, QuizStats> = {};
  
  for (const [id, stats] of Object.entries(oldStats)) {
    if (stats && typeof stats === 'object') {
      // If it's already the new format, use it as-is
      if ('attempts' in stats && 'best' in stats && 'last' in stats) {
        migrated[id] = stats as QuizStats;
      } else {
        // Migrate from old format { correct, total }
        const correct = stats.correct || 0;
        const total = stats.total || 0;
        const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
        
        migrated[id] = {
          attempts: 1,
          best: percent,
          last: percent,
          correct,
          total,
        };
      }
    }
  }
  
  return migrated;
}

// Get current progress data
export function getProgress(): ProgressData {
  const storage = getStorage();
  if (!storage) return defaultProgress;

  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    
    const parsed = JSON.parse(stored) as ProgressData;
    
    // Ensure all required fields exist and migrate old format
    return {
      unlockedRunes: parsed.unlockedRunes || [],
      unlockedNumbers: parsed.unlockedNumbers || [],
      quiz: {
        runes: migrateQuizStats(parsed.quiz?.runes || {}),
        numbers: migrateQuizStats(parsed.quiz?.numbers || {}),
      },
      xp: parsed.xp || 0,
      journal: parsed.journal || {
        entries: {},
        indexByDate: {},
      },
      loreRead: parsed.loreRead || {
        runes: {},
        numbers: {},
      },
      notesCount: parsed.notesCount || {
        runes: {},
        numbers: {},
      },
    };
  } catch (error) {
    console.error('Error parsing progress data:', error);
    return defaultProgress;
  }
}

// Save progress data
export function setProgress(progress: ProgressData): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress data:', error);
  }
}

// Unlock a rune
export function unlockRune(runeId: RuneId): void {
  const progress = getProgress();
  if (!progress.unlockedRunes.includes(runeId)) {
    progress.unlockedRunes.push(runeId);
    setProgress(progress);
  }
}

// Unlock a number
export function unlockNumber(numberId: NumberId): void {
  const progress = getProgress();
  if (!progress.unlockedNumbers.includes(numberId)) {
    progress.unlockedNumbers.push(numberId);
    setProgress(progress);
  }
}

// Check if a rune is unlocked
export function isRuneUnlocked(runeId: RuneId): boolean {
  const progress = getProgress();
  return progress.unlockedRunes.includes(runeId);
}

// Check if a number is unlocked
export function isNumberUnlocked(numberId: NumberId): boolean {
  const progress = getProgress();
  return progress.unlockedNumbers.includes(numberId);
}

// Get quiz stats for a specific item
export function getQuizStats(
  kind: 'rune' | 'number',
  id: string | number
): QuizStats | null {
  const progress = getProgress();
  const idStr = id.toString();
  
  if (kind === 'rune') {
    return progress.quiz.runes[idStr] || null;
  } else {
    return progress.quiz.numbers[idStr] || null;
  }
}

// Record a quiz attempt
export function recordQuizAttempt(
  kind: 'rune' | 'number',
  id: string | number,
  result: { correct: number; total: number }
): void {
  const progress = getProgress();
  const idStr = id.toString();
  const percent = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
  
  const currentStats = getQuizStats(kind, id) || {
    attempts: 0,
    best: 0,
    last: 0,
    correct: 0,
    total: 0,
  };
  
  const newStats: QuizStats = {
    attempts: currentStats.attempts + 1,
    best: Math.max(currentStats.best, percent),
    last: percent,
    correct: currentStats.correct + result.correct,
    total: currentStats.total + result.total,
  };
  
  if (kind === 'rune') {
    progress.quiz.runes[idStr] = newStats;
  } else {
    progress.quiz.numbers[idStr] = newStats;
  }
  
  setProgress(progress);
}

// Add XP to the user's total
export function addLocalXP(amount: number): void {
  const progress = getProgress();
  progress.xp = (progress.xp || 0) + amount;
  setProgress(progress);
}

// Get current XP total
export function getLocalXP(): number {
  const progress = getProgress();
  return progress.xp || 0;
}

// Legacy function for backward compatibility
export function recordQuiz(
  kind: 'runes' | 'numbers',
  id: string | number,
  results: { correct: number; total: number }
): void {
  const newKind = kind === 'runes' ? 'rune' : 'number';
  recordQuizAttempt(newKind, id, results);
}

// Legacy function for backward compatibility
export function getQuizResults(
  kind: 'runes' | 'numbers',
  id: string | number
): { correct: number; total: number } | null {
  const newKind = kind === 'runes' ? 'rune' : 'number';
  const stats = getQuizStats(newKind, id);
  return stats ? { correct: stats.correct, total: stats.total } : null;
}

// Get all unlocked runes
export function getUnlockedRunes(): RuneId[] {
  const progress = getProgress();
  return progress.unlockedRunes as RuneId[];
}

// Get all unlocked numbers
export function getUnlockedNumbers(): NumberId[] {
  const progress = getProgress();
  return progress.unlockedNumbers as NumberId[];
}

// Reset all progress (for development/testing)
export function resetProgress(): void {
  setProgress(defaultProgress);
}

// Journal functions
export function saveJournalEntry(options: JournalSaveOptions): void {
  const progress = getProgress();
  if (!progress.journal) {
    progress.journal = { entries: {}, indexByDate: {} };
  }

  const entryId = `${options.dateKey}:${options.kind}:${options.ref}`;
  const now = Date.now();
  
  const entry: JournalEntry = {
    id: entryId,
    kind: options.kind,
    ref: options.ref,
    dateKey: options.dateKey,
    prompt: options.prompt,
    text: options.text,
    createdAt: progress.journal.entries[entryId]?.createdAt || now,
    updatedAt: now,
  };

  // Save entry
  progress.journal.entries[entryId] = entry;

  // Update date index
  if (!progress.journal.indexByDate[options.dateKey]) {
    progress.journal.indexByDate[options.dateKey] = [];
  }
  if (!progress.journal.indexByDate[options.dateKey].includes(entryId)) {
    progress.journal.indexByDate[options.dateKey].push(entryId);
  }

  setProgress(progress);
}

export function getJournalEntry(
  kind: 'rune' | 'number',
  ref: string,
  dateKey: string
): JournalEntry | null {
  const progress = getProgress();
  if (!progress.journal) return null;

  const entryId = `${dateKey}:${kind}:${ref}`;
  return progress.journal.entries[entryId] || null;
}

export function getJournalFeed(options: JournalFeedOptions = {}): JournalEntry[] {
  const progress = getProgress();
  if (!progress.journal) return [];

  let entries: JournalEntry[] = Object.values(progress.journal.entries);

  // Filter by kind if specified
  if (options.kind) {
    entries = entries.filter(entry => entry.kind === options.kind);
  }

  // Filter by date range if specified
  if (options.dateRange) {
    entries = entries.filter(entry => {
      return entry.dateKey >= options.dateRange!.start && entry.dateKey <= options.dateRange!.end;
    });
  }

  // Sort by updatedAt descending (latest first)
  entries.sort((a, b) => b.updatedAt - a.updatedAt);

  // Apply limit if specified
  if (options.limit) {
    entries = entries.slice(0, options.limit);
  }

  return entries;
}

export function deleteJournalEntry(id: string): void {
  const progress = getProgress();
  if (!progress.journal) return;

  const entry = progress.journal.entries[id];
  if (!entry) return;

  // Remove from entries
  delete progress.journal.entries[id];

  // Remove from date index
  if (progress.journal.indexByDate[entry.dateKey]) {
    const index = progress.journal.indexByDate[entry.dateKey].indexOf(id);
    if (index > -1) {
      progress.journal.indexByDate[entry.dateKey].splice(index, 1);
    }
    // Clean up empty date entries
    if (progress.journal.indexByDate[entry.dateKey].length === 0) {
      delete progress.journal.indexByDate[entry.dateKey];
    }
  }

  setProgress(progress);
}

export function canSaveJournal(options: { kind: 'rune' | 'number'; dateKey: string }): JournalLimits {
  const progress = getProgress();
  if (!progress.journal) {
    return { ok: true };
  }

  // Check if user has Pro (local)
  const isPro = getLocalPro();
  if (isPro) {
    return { ok: true };
  }

  // For free users, check if they already have an entry for this kind today
  const existingEntries: JournalEntry[] = Object.values(progress.journal.entries).filter(entry => 
    entry.kind === options.kind && entry.dateKey === options.dateKey
  );

  if (existingEntries.length > 0) {
    return { ok: false, reason: 'limit' };
  }

  return { ok: true };
}

// Get recent entries for a specific rune/number
export function getRecentJournalEntries(
  kind: 'rune' | 'number',
  ref: string,
  limit: number = 3
): JournalEntry[] {
  const progress = getProgress();
  if (!progress.journal) return [];

  const entries: JournalEntry[] = Object.values(progress.journal.entries)
    .filter(entry => entry.kind === kind && entry.ref === ref)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);

  return entries;
}

// Lore read tracking
export function markLoreRead(kind: 'rune' | 'number', id: string | number): void {
  const progress = getProgress();
  const idStr = String(id);
  
  if (kind === 'rune') {
    progress.loreRead.runes[idStr] = true;
  } else {
    progress.loreRead.numbers[idStr] = true;
  }
  
  setProgress(progress);
}

export function getLoreRead(kind: 'rune' | 'number', id: string | number): boolean {
  const progress = getProgress();
  const idStr = String(id);
  
  if (kind === 'rune') {
    return progress.loreRead.runes[idStr] || false;
  } else {
    return progress.loreRead.numbers[idStr] || false;
  }
}

// Notes count tracking
export function setNotesCount(kind: 'rune' | 'number', id: string | number, count: number): void {
  const progress = getProgress();
  const idStr = String(id);
  
  if (kind === 'rune') {
    progress.notesCount.runes[idStr] = count;
  } else {
    progress.notesCount.numbers[idStr] = count;
  }
  
  setProgress(progress);
}

export function getNotesCount(kind: 'rune' | 'number', id: string | number): number {
  const progress = getProgress();
  const idStr = String(id);
  
  if (kind === 'rune') {
    return progress.notesCount.runes[idStr] || 0;
  } else {
    return progress.notesCount.numbers[idStr] || 0;
  }
}

// Update notes count when journal entry is saved
export function updateNotesCount(kind: 'rune' | 'number', id: string | number): void {
  const progress = getProgress();
  if (!progress.journal) return;

  const idStr = String(id);
  const count = Object.values(progress.journal.entries).filter(entry => 
    entry.kind === kind && entry.ref === idStr
  ).length;

  setNotesCount(kind, id, count);
}
