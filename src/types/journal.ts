export type JournalKind = 'rune' | 'number';

export interface PromptBank {
  runes: Record<string, string[]>;
  numbers: Record<string, string[]>;
  generic: {
    daily: string[];
  };
}

export interface JournalEntry {
  id: string; // `${dateKey}:${kind}:${ref}`
  kind: JournalKind;
  ref: string; // runeId or number string
  dateKey: string; // YYYY-MM-DD (UTC)
  prompt: string;
  text: string;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export interface JournalStorage {
  entries: Record<string, JournalEntry>;
  indexByDate: Record<string, string[]>; // dateKey -> entryIds
}

export interface JournalLimits {
  ok: boolean;
  reason?: 'limit';
}

export interface JournalFeedOptions {
  limit?: number;
  kind?: JournalKind;
  dateRange?: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
}

export interface JournalSaveOptions {
  kind: JournalKind;
  ref: string;
  dateKey: string;
  prompt: string;
  text: string;
}
