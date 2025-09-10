/**
 * Share link builders for generating canonical URLs and OG image URLs
 */

import { formatDateForUrl } from './text';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mystic.app';

interface RuneShareParams {
  runeId: string;
  reversed: boolean;
  dateUTC: Date;
}

interface NumberShareParams {
  numId: number;
  dateUTC: Date;
  mode: 'daily' | 'deep';
}

interface CompatShareParams {
  score: number;
  dateUTC: Date;
}

/**
 * Generate share URL for rune results
 */
export function runeShareUrl({ runeId, reversed, dateUTC }: RuneShareParams): string {
  const date = formatDateForUrl(dateUTC);
  const rev = reversed ? '1' : '0';
  return `${BASE_URL}/share/rune/${runeId}?rev=${rev}&d=${date}`;
}

/**
 * Generate OG image URL for rune results
 */
export function runeOgUrl({ runeId, reversed, dateUTC }: RuneShareParams): string {
  const date = formatDateForUrl(dateUTC);
  const rev = reversed ? '1' : '0';
  return `${BASE_URL}/api/og/rune?runeId=${runeId}&rev=${rev}&d=${date}`;
}

/**
 * Generate share URL for numerology results
 */
export function numberShareUrl({ numId, dateUTC, mode }: NumberShareParams): string {
  const date = formatDateForUrl(dateUTC);
  return `${BASE_URL}/share/number/${numId}?d=${date}&mode=${mode}`;
}

/**
 * Generate OG image URL for numerology results
 */
export function numberOgUrl({ numId, dateUTC, mode }: NumberShareParams): string {
  const date = formatDateForUrl(dateUTC);
  return `${BASE_URL}/api/og/number?numId=${numId}&d=${date}&mode=${mode}`;
}

/**
 * Generate share URL for compatibility results
 */
export function compatShareUrl({ score, dateUTC }: CompatShareParams): string {
  const date = formatDateForUrl(dateUTC);
  return `${BASE_URL}/share/compat?score=${score}&d=${date}`;
}

/**
 * Generate OG image URL for compatibility results
 */
export function compatOgUrl({ score, dateUTC }: CompatShareParams): string {
  const date = formatDateForUrl(dateUTC);
  return `${BASE_URL}/api/og/compat?score=${score}&d=${date}`;
}

/**
 * Add UTM parameters to any URL for analytics
 */
export function addUtmParams(url: string, source: string = 'share'): string {
  const urlObj = new URL(url);
  urlObj.searchParams.set('utm_source', source);
  urlObj.searchParams.set('utm_medium', 'organic');
  urlObj.searchParams.set('utm_campaign', 'mystic-share');
  return urlObj.toString();
}

/**
 * Generate share URLs with UTM parameters
 */
export const runeShareUrlWithUtm = (params: RuneShareParams) => addUtmParams(runeShareUrl(params));
export const numberShareUrlWithUtm = (params: NumberShareParams) => addUtmParams(numberShareUrl(params));
export const compatShareUrlWithUtm = (params: CompatShareParams) => addUtmParams(compatShareUrl(params));

/**
 * Get the app URL for deep-linking to specific tabs
 */
export function getAppUrl(tab: 'runes' | 'numerology' | 'compat'): string {
  switch (tab) {
    case 'runes':
      return `${BASE_URL}/runes`;
    case 'numerology':
      return `${BASE_URL}/numerology`;
    case 'compat':
      return `${BASE_URL}/numerology?tab=compat`;
    default:
      return BASE_URL;
  }
}