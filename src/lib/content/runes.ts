import { z } from 'zod';
import { ELDER_FUTHARK_IDS, type RuneId } from '@/content/runes-ids';
import runesData from '@/content/runes.json';

// Zod schema for individual rune content
const RuneContentSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  upright: z.string(),
  reversed: z.string().optional(),
  info: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  element: z.enum(['fire', 'water', 'earth', 'air']).optional(),
  phoneme: z.string().optional(),
  altNames: z.array(z.string()).optional(),
  // Lore fields
  history: z.string().optional(),
  advice: z.string().optional(),
  shadow: z.string().optional(),
  ritualIdeas: z.array(z.string()).optional(),
});

// Zod schema for the runes array
const RunesArraySchema = z.array(RuneContentSchema);

// Type for individual rune content
export type RuneContent = z.infer<typeof RuneContentSchema>;

// Type for the runes record (Map-like structure)
export type RuneRecord = Map<RuneId, RuneContent>;

// Validate and parse runes data
let validatedRunes: RuneContent[] | null = null;
let runesMap: RuneRecord | null = null;

function validateRunesData() {
  if (validatedRunes === null) {
    try {
      validatedRunes = RunesArraySchema.parse(runesData);
      
      // Check that we have exactly 24 runes
      if (validatedRunes.length !== 24) {
        throw new Error(`Expected 24 runes, got ${validatedRunes.length}`);
      }
      
      // Check that all canonical IDs are present
      const presentIds = new Set(validatedRunes.map(r => r.id));
      const missingIds = ELDER_FUTHARK_IDS.filter(id => !presentIds.has(id));
      
      if (missingIds.length > 0) {
        console.warn('Missing canonical rune IDs:', missingIds);
      }
      
      // Check for extra IDs not in canonical list
      const extraIds = validatedRunes
        .map(r => r.id)
        .filter(id => !ELDER_FUTHARK_IDS.includes(id as RuneId));
      
      if (extraIds.length > 0) {
        console.warn('Extra rune IDs not in canonical list:', extraIds);
      }
      
      // Check for duplicates
      const duplicateIds = validatedRunes
        .map(r => r.id)
        .filter((id, index, arr) => arr.indexOf(id) !== index);
      
      if (duplicateIds.length > 0) {
        throw new Error(`Duplicate rune IDs found: ${duplicateIds.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Rune data validation failed:', error);
      throw error;
    }
  }
  return validatedRunes;
}

function createRunesMap(): RuneRecord {
  if (runesMap === null) {
    const runes = validateRunesData();
    runesMap = new Map();
    
    for (const rune of runes) {
      runesMap.set(rune.id as RuneId, rune);
    }
  }
  return runesMap;
}

// Public API functions
export async function getRunes(): Promise<RuneRecord> {
  return createRunesMap();
}

export function getRune(id: RuneId): RuneContent | undefined {
  const runes = createRunesMap();
  return runes.get(id);
}

export function getRuneFull(id: RuneId): RuneContent | undefined {
  const rune = getRune(id);
  if (!rune) return undefined;
  
  // Return rune with all optional fields filled with defaults
  return {
    ...rune,
    history: rune.history || '',
    advice: rune.advice || '',
    shadow: rune.shadow || '',
    ritualIdeas: rune.ritualIdeas || [],
  };
}

export function missingIds(): RuneId[] {
  const runes = validateRunesData();
  const presentIds = new Set(runes.map(r => r.id));
  return ELDER_FUTHARK_IDS.filter(id => !presentIds.has(id));
}

export function getAllRunes(): RuneContent[] {
  return validateRunesData();
}

// Development helper to check for missing info fields
export function getRunesWithMissingInfo(): RuneId[] {
  const runes = validateRunesData();
  return runes
    .filter(rune => !rune.info || rune.info.trim() === '')
    .map(rune => rune.id as RuneId);
}

// Log warnings on module load in development
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    const missing = missingIds();
    if (missing.length > 0) {
      console.warn(`Missing canonical rune IDs: ${missing.join(', ')}`);
    }
    
    const missingInfo = getRunesWithMissingInfo();
    if (missingInfo.length > 0) {
      console.warn(`Runes with missing info field: ${missingInfo.join(', ')}`);
    }
  } catch (error) {
    console.error('Error validating rune data on load:', error);
  }
}
