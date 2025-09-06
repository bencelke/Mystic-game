/**
 * Numerology calculation engine for Mystic Arcade
 * Implements life path and daily number calculations
 */

/**
 * Calculate life path number from date of birth
 * Sums all digits of yyyy+mm+dd and reduces to 1-9 (except master numbers 11, 22)
 */
export function lifePath(dob: string): number {
  const date = new Date(dob);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  const yearSum = sumDigits(year);
  const monthSum = sumDigits(month);
  const daySum = sumDigits(day);
  
  const total = yearSum + monthSum + daySum;
  return reduceToSingleDigit(total);
}

/**
 * Calculate daily number from DOB + current date
 * Sums digits of dob + current date and reduces to 1-9
 */
export function dailyNumber(dob: string, date: string): number {
  const dobSum = lifePath(dob);
  const dateSum = sumDateDigits(date);
  
  const total = dobSum + dateSum;
  return reduceToSingleDigit(total);
}

/**
 * Sum all digits of a number
 */
function sumDigits(num: number): number {
  let sum = 0;
  while (num > 0) {
    sum += num % 10;
    num = Math.floor(num / 10);
  }
  return sum;
}

/**
 * Sum all digits of a date string (yyyy-mm-dd)
 */
function sumDateDigits(dateStr: string): number {
  const digits = dateStr.replace(/-/g, '');
  let sum = 0;
  for (const digit of digits) {
    sum += parseInt(digit, 10);
  }
  return sum;
}

/**
 * Reduce a number to single digit (1-9) or master numbers (11, 22)
 */
function reduceToSingleDigit(num: number): number {
  while (num > 9) {
    // Check for master numbers before reducing
    if (num === 11 || num === 22) {
      return num;
    }
    num = sumDigits(num);
  }
  return num;
}

/**
 * Get numerology number meaning
 */
export function getNumberMeaning(number: number): string {
  const meanings: Record<number, string> = {
    1: "Leadership, independence, new beginnings",
    2: "Cooperation, balance, partnership",
    3: "Creativity, self-expression, communication",
    4: "Stability, hard work, foundation",
    5: "Freedom, adventure, change",
    6: "Harmony, responsibility, nurturing",
    7: "Spirituality, analysis, wisdom",
    8: "Material success, power, authority",
    9: "Completion, humanitarianism, wisdom",
    11: "Intuition, inspiration, spiritual insight",
    22: "Master builder, practical vision, large-scale impact"
  };
  
  return meanings[number] || "Unknown number";
}

/**
 * Format number for display
 */
export function formatNumber(number: number): string {
  if (number === 11 || number === 22) {
    return `${number} (Master Number)`;
  }
  return number.toString();
}

/**
 * Calculate name number using Pythagorean mapping (A=1, B=2, ..., I=9, J=1, etc.)
 * Ignores non-letters and is case-insensitive
 */
export function nameNumber(name: string): number {
  const letters = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  let sum = 0;
  
  for (const letter of letters) {
    const charCode = letter.charCodeAt(0) - 96; // 'a' = 1, 'b' = 2, etc.
    sum += charCode;
  }
  
  return reduceToSingleDigit(sum);
}

/**
 * Calculate compatibility score between two people
 * @param a - First person's numbers {lp: lifePath, nn: nameNumber}
 * @param b - Second person's numbers {lp: lifePath, nn: nameNumber}
 * @returns Compatibility score (0-100)
 */
export function compatibilityScore(
  a: { lp: number; nn: number },
  b: { lp: number; nn: number }
): number {
  // Convert master numbers to their reduced forms for distance calculation
  const lpA = a.lp === 11 ? 2 : a.lp === 22 ? 4 : a.lp;
  const lpB = b.lp === 11 ? 2 : b.lp === 22 ? 4 : b.lp;
  const nnA = a.nn === 11 ? 2 : a.nn === 22 ? 4 : a.nn;
  const nnB = b.nn === 11 ? 2 : b.nn === 22 ? 4 : b.nn;
  
  // Life Path distance score (0-100)
  const lpDistance = Math.min(Math.abs(lpA - lpB), 9 - Math.abs(lpA - lpB));
  const scoreLp = Math.max(0, 100 - (lpDistance * 12));
  
  // Name Number distance score (0-100)
  const nnDistance = Math.min(Math.abs(nnA - nnB), 9 - Math.abs(nnA - nnB));
  const scoreNn = 100 - (nnDistance * 8);
  
  // Weighted total: 65% life path, 35% name number
  const total = Math.round(0.65 * scoreLp + 0.35 * scoreNn);
  
  return Math.max(0, Math.min(100, total));
}

/**
 * Generate compatibility interpretation based on scores and numbers
 */
export function compatibilityBlurb(
  score: number,
  lpA: number,
  lpB: number,
  nnA: number,
  nnB: number,
  masters: { a?: 11 | 22; b?: 11 | 22 }
): string {
  let tier = '';
  let description = '';
  
  if (score >= 85) {
    tier = 'Excellent';
    description = 'Your energies flow together beautifully, creating a powerful and harmonious connection.';
  } else if (score >= 70) {
    tier = 'Good';
    description = 'You share strong compatibility with natural understanding and mutual growth potential.';
  } else if (score >= 50) {
    tier = 'Mixed';
    description = 'Your relationship offers both challenges and opportunities for learning and growth.';
  } else {
    tier = 'Challenging';
    description = 'Your paths may require extra effort and understanding to find common ground.';
  }
  
  // Add specific insights based on numbers
  const insights = [];
  
  // Same life path numbers
  if (lpA === lpB) {
    insights.push('You share the same life path number, creating deep soul-level understanding.');
  }
  
  // Master number insights
  if (masters.a || masters.b) {
    const masterInfo = [];
    if (masters.a) masterInfo.push(`You (${masters.a})`);
    if (masters.b) masterInfo.push(`Partner (${masters.b})`);
    insights.push(`Master number energy present: ${masterInfo.join(', ')} - powerful spiritual potential.`);
  }
  
  // Specific number synergies
  if ((lpA === 2 && lpB === 4) || (lpA === 4 && lpB === 2)) {
    insights.push('The 2-4 combination brings balance between intuition and practicality.');
  }
  if ((lpA === 3 && lpB === 5) || (lpA === 5 && lpB === 3)) {
    insights.push('The 3-5 pairing creates dynamic creativity and adventure.');
  }
  
  // Name number insights
  if (nnA === nnB) {
    insights.push('Your name numbers match, indicating similar expression and communication styles.');
  }
  
  const insightText = insights.length > 0 ? ` ${insights.join(' ')}` : '';
  
  return `${tier} compatibility (${score}/100). ${description}${insightText}`;
}
