// Simple i18n utility for journal strings
import enJournal from '@/i18n/ui.journal.en.json';
import ruJournal from '@/i18n/ui.journal.ru.json';

type Locale = 'en' | 'ru';

const journalStrings = {
  en: enJournal.journal,
  ru: ruJournal.journal,
};

// Simple template replacement
function replaceTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return String(values[key] || match);
  });
}

// Get journal string with optional template replacement
export function t(key: string, values?: Record<string, string | number>, locale: Locale = 'en'): string {
  const keys = key.split('.');
  let value: any = journalStrings[locale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    // Fallback to English
    value = journalStrings.en;
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
