/**
 * Content helpers for sharing functionality
 */

/**
 * Truncate text safely without cutting mid-word
 * @param text - Text to truncate
 * @param max - Maximum length (default 120)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateMeaning(text: string, max: number = 120): string {
  if (text.length <= max) {
    return text;
  }

  // Find the last space before the max length
  const truncated = text.substring(0, max);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If no space found, just cut at max length
  if (lastSpace === -1) {
    return truncated + '…';
  }
  
  // Cut at the last space and add ellipsis
  return truncated.substring(0, lastSpace) + '…';
}

/**
 * Format date as UTC string for sharing
 * @param date - Date to format (defaults to now)
 * @returns Formatted date string like "Sep 10, 2025 (UTC)"
 */
export function formatDateUTC(date: Date = new Date()): string {
  const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  };
  
  const formatted = utcDate.toLocaleDateString('en-US', options);
  return `${formatted} (UTC)`;
}

/**
 * Format date as YYYY-MM-DD for URL parameters
 * @param date - Date to format (defaults to now)
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForUrl(date: Date = new Date()): string {
  const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  return utcDate.toISOString().split('T')[0];
}

/**
 * Parse date from YYYY-MM-DD format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDateFromUrl(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get a short description for sharing based on content type
 * @param type - Type of content
 * @param data - Content data
 * @returns Short description for sharing
 */
export function getShareDescription(type: 'rune' | 'number' | 'compat', data: any): string {
  switch (type) {
    case 'rune':
      return `Today's rune: ${data.name} - ${truncateMeaning(data.upright, 80)}`;
    case 'number':
      return `Today's numerology: ${data.number} - ${truncateMeaning(data.meaning, 80)}`;
    case 'compat':
      return `Numerology compatibility: ${data.score}% match`;
    default:
      return 'Mystic guidance for today';
  }
}

/**
 * Generate share title based on content type
 * @param type - Type of content
 * @param data - Content data
 * @returns Share title
 */
export function getShareTitle(type: 'rune' | 'number' | 'compat', data: any): string {
  switch (type) {
    case 'rune':
      return `${data.name} - Daily Rune | Mystic`;
    case 'number':
      return `Number ${data.number} - Daily Numerology | Mystic`;
    case 'compat':
      return `Compatibility Score: ${data.score}% | Mystic`;
    default:
      return 'Mystic Guidance | Mystic';
  }
}