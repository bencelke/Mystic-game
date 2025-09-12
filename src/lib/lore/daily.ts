import { RuneId } from '@/content/runes-ids';
import { NumberId } from '@/content/numbers-ids';
import { getRune } from '@/lib/content/runes';
import { getNumber } from '@/lib/content/numbers';

// Generate a deterministic seed from a date string
function createSeed(dateStr: string): string {
  // Simple hash function for deterministic seeding
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
}

// Deterministic pick from a list using a seed
export function seededPick<T>(list: T[], seed: string): T {
  const seedNum = parseInt(seed, 10);
  const index = seedNum % list.length;
  return list[index];
}

// Get today's date in UTC as YYYY-MM-DD
export function todayUTCKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get daily rune lore
export function dailyRuneLore(): { id: RuneId; name: string; symbol: string; loreShort: string } | null {
  const today = todayUTCKey();
  const seed = createSeed(today);
  
  // For now, we'll use a simple deterministic selection
  // In a real app, this might check if there's already a selected rune for the day
  const allRunes = [
    'fehu', 'uruz', 'thurisaz', 'ansuz', 'raidho', 'kenaz', 'gebo', 'wunjo',
    'hagalaz', 'nauthiz', 'isa', 'jera', 'eihwaz', 'perthro', 'algiz', 'sowilo',
    'tiwaz', 'berkano', 'ehwaz', 'mannaz', 'laguz', 'ingwaz', 'othala', 'dagaz'
  ] as RuneId[];
  
  const selectedRuneId = seededPick(allRunes, seed);
  const rune = getRune(selectedRuneId);
  
  if (!rune) return null;
  
  return {
    id: selectedRuneId,
    name: rune.name,
    symbol: rune.symbol,
    loreShort: rune.loreShort || 'Ancient wisdom flows through this rune today.',
  };
}

// Get daily number lore
export function dailyNumberLore(): { id: NumberId; name: string; loreShort: string } | null {
  const today = todayUTCKey();
  const seed = createSeed(today);
  
  // For now, we'll use a simple deterministic selection
  const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22] as NumberId[];
  
  const selectedNumberId = seededPick(allNumbers, seed);
  const number = getNumber(selectedNumberId);
  
  if (!number) return null;
  
  return {
    id: selectedNumberId,
    name: number.name,
    loreShort: number.loreShort || 'Numerical wisdom guides your path today.',
  };
}
