import { z } from 'zod';
import { NUMEROLOGY_IDS, type NumId } from '@/content/numbers-ids';
import numbersData from '@/content/numerology.json';

// Zod schema for individual number content
const NumberContentSchema = z.object({
  id: z.number(),
  name: z.string(),
  keywords: z.array(z.string()),
  overview: z.string(),
  strengths: z.string(),
  challenges: z.string(),
  love: z.string().optional(),
  career: z.string().optional(),
  advice: z.array(z.string()),
  shadow: z.string().optional(),
  master: z.boolean(),
});

// Zod schema for the numbers array
const NumbersArraySchema = z.array(NumberContentSchema);

// Type for individual number content
export type NumberContent = z.infer<typeof NumberContentSchema>;

// Type for the numbers record (Map-like structure)
export type NumberRecord = Record<NumId, NumberContent>;

// Validate and parse numbers data
let validatedNumbers: NumberContent[] | null = null;
let numbersMap: NumberRecord | null = null;

function validateNumbersData() {
  if (validatedNumbers === null) {
    try {
      validatedNumbers = NumbersArraySchema.parse(numbersData);
      
      // Check that we have exactly 11 numbers
      if (validatedNumbers.length !== 11) {
        throw new Error(`Expected 11 numbers, got ${validatedNumbers.length}`);
      }
      
      // Check that all canonical IDs are present
      const presentIds = new Set(validatedNumbers.map(n => n.id));
      const missingIds = NUMEROLOGY_IDS.filter(id => !presentIds.has(id));
      
      if (missingIds.length > 0) {
        console.warn('Missing canonical number IDs:', missingIds);
      }
      
      // Check for extra IDs not in canonical list
      const extraIds = validatedNumbers
        .map(n => n.id)
        .filter(id => !NUMEROLOGY_IDS.includes(id as NumId));
      
      if (extraIds.length > 0) {
        console.warn('Extra number IDs not in canonical list:', extraIds);
      }
      
      // Check for duplicates
      const duplicateIds = validatedNumbers
        .map(n => n.id)
        .filter((id, index, arr) => arr.indexOf(id) !== index);
      
      if (duplicateIds.length > 0) {
        throw new Error(`Duplicate number IDs found: ${duplicateIds.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Number data validation failed:', error);
      throw error;
    }
  }
  return validatedNumbers;
}

function createNumbersMap(): NumberRecord {
  if (numbersMap === null) {
    const numbers = validateNumbersData();
    numbersMap = {} as NumberRecord;
    
    for (const number of numbers) {
      numbersMap[number.id as NumId] = number;
    }
  }
  return numbersMap;
}

// Public API functions
export async function getNumbers(): Promise<NumberRecord> {
  return createNumbersMap();
}

export function getNumber(id: NumId): NumberContent | undefined {
  const numbers = createNumbersMap();
  return numbers[id];
}

export function missingIds(): NumId[] {
  const numbers = validateNumbersData();
  const presentIds = new Set(numbers.map(n => n.id));
  return NUMEROLOGY_IDS.filter(id => !presentIds.has(id));
}

export function getAllNumbers(): NumberContent[] {
  return validateNumbersData();
}

// Development helper to check for missing content
export function getNumbersWithMissingContent(): NumId[] {
  const numbers = validateNumbersData();
  return numbers
    .filter(number => 
      !number.overview || 
      number.overview.trim() === '' ||
      !number.strengths ||
      number.strengths.trim() === ''
    )
    .map(number => number.id as NumId);
}

// Log warnings on module load in development
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    const missing = missingIds();
    if (missing.length > 0) {
      console.warn(`Missing canonical number IDs: ${missing.join(', ')}`);
    }
    
    const missingContent = getNumbersWithMissingContent();
    if (missingContent.length > 0) {
      console.warn(`Numbers with missing content: ${missingContent.join(', ')}`);
    }
  } catch (error) {
    console.error('Error validating number data on load:', error);
  }
}
