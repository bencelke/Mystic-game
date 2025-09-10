// Canonical Numerology number IDs in fixed order
export const NUMEROLOGY_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22] as const;

export type NumId = typeof NUMEROLOGY_IDS[number];
