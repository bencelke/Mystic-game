// Canonical Elder Futhark rune IDs in fixed order
export const ELDER_FUTHARK_IDS = [
  "fehu",
  "uruz", 
  "thurisaz",
  "ansuz",
  "raidho",
  "kenaz",
  "gebo",
  "wunjo",
  "hagalaz",
  "nauthiz",
  "isa",
  "jera",
  "eihwaz",
  "perthro",
  "algiz",
  "sowilo",
  "tiwaz",
  "berkano", // Note: using "berkano" to match existing content
  "ehwaz",
  "mannaz",
  "laguz",
  "ingwaz",
  "othala",
  "dagaz"
] as const;

export type RuneId = typeof ELDER_FUTHARK_IDS[number];
