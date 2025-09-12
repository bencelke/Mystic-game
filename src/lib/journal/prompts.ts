import { PromptBank } from '@/types/journal';

// Load prompts data with locale support
function loadPromptsData(locale: 'en' | 'ru' = 'en'): any {
  try {
    if (locale === 'ru') {
      // Try to load Russian version, fallback to English
      try {
        return require(`@/content/${locale}/prompts.json`);
      } catch {
        return require('@/content/prompts.json');
      }
    }
    return require('@/content/prompts.json');
  } catch (error) {
    console.error('Error loading prompts data:', error);
    return {
      runes: {},
      numbers: {},
      generic: { daily: [] }
    };
  }
}

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

// Load the prompt bank from JSON
export async function loadPromptBank(locale: 'en' | 'ru' = 'en'): Promise<PromptBank> {
  return loadPromptsData(locale) as PromptBank;
}

// Pick a prompt for a specific rune
export function pickPromptForRune(id: string, seed: string, locale: 'en' | 'ru' = 'en'): string {
  const bank = loadPromptsData(locale) as PromptBank;
  const prompts = bank.runes[id] || [];
  
  if (prompts.length === 0) {
    return "Reflect on this rune's energy in your life today.";
  }
  
  const random = seededRandom(`${seed}:${id}`);
  const index = Math.floor(random * prompts.length);
  return prompts[index];
}

// Pick a prompt for a specific number
export function pickPromptForNumber(id: number | string, seed: string, locale: 'en' | 'ru' = 'en'): string {
  const bank = loadPromptsData(locale) as PromptBank;
  const key = String(id);
  const prompts = bank.numbers[key] || [];
  
  if (prompts.length === 0) {
    return "Reflect on this number's energy in your life today.";
  }
  
  const random = seededRandom(`${seed}:${key}`);
  const index = Math.floor(random * prompts.length);
  return prompts[index];
}

// Pick a generic daily prompt
export function pickGenericPrompt(seed: string, locale: 'en' | 'ru' = 'en'): string {
  const bank = loadPromptsData(locale) as PromptBank;
  const prompts = bank.generic.daily || [];
  
  if (prompts.length === 0) {
    return "What are you grateful for today?";
  }
  
  const random = seededRandom(seed);
  const index = Math.floor(random * prompts.length);
  return prompts[index];
}

// Generate a seed for consistent prompt selection
export function generatePromptSeed(dateKey: string, kind: string, ref: string): string {
  return `${dateKey}:${kind}:${ref}`;
}

// Get today's date key in UTC
export function todayUTCKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
