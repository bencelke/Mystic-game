// Simple i18n utility for home and learn strings
import homeEn from '@/i18n/ui.home.en.json';
import homeRu from '@/i18n/ui.home.ru.json';
import learnEn from '@/i18n/ui.learn.en.json';
import learnRu from '@/i18n/ui.learn.ru.json';

type Locale = 'en' | 'ru';

const homeStrings = {
  en: homeEn.home,
  ru: homeRu.home,
};

const learnStrings = {
  en: learnEn.learn,
  ru: learnRu.learn,
};

// Simple template replacement
function replaceTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return String(values[key] || match);
  });
}

// Get home string with optional template replacement
export function t(key: string, values?: Record<string, string | number>, locale: Locale = 'en'): string {
  const keys = key.split('.');
  let value: any = homeStrings[locale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    // Fallback to English
    value = homeStrings.en;
    for (const k of keys) {
      value = value?.[k];
    }
  }
  
  if (typeof value !== 'string') {
    return key; // Return key if not found
  }
  
  return values ? replaceTemplate(value, values) : value;
}

// Get learn string with optional template replacement
export function tLearn(key: string, values?: Record<string, string | number>, locale: Locale = 'en'): string {
  const keys = key.split('.');
  let value: any = learnStrings[locale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    // Fallback to English
    value = learnStrings.en;
    for (const k of keys) {
      value = value?.[k];
    }
  }
  
  if (typeof value !== 'string') {
    return key; // Return key if not found
  }
  
  return values ? replaceTemplate(value, values) : value;
}

// Get current locale (simple implementation)
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  return (navigator.language.startsWith('ru') ? 'ru' : 'en') as Locale;
}
