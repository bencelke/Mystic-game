'use client';

import { createContext, useContext, ReactNode } from 'react';
import { RuneRecord, RuneContent } from '@/lib/content/runes';
import { RuneId } from '@/content/runes-ids';

interface RunesContextValue {
  byId: RuneRecord;
  list: RuneContent[];
  getRune: (id: RuneId) => RuneContent | undefined;
}

const RunesContext = createContext<RunesContextValue | null>(null);

interface RunesProviderProps {
  children: ReactNode;
  runes: RuneContent[];
}

export function RunesProvider({ children, runes }: RunesProviderProps) {
  // Create a Map for efficient lookups
  const byId = new Map<RuneId, RuneContent>();
  runes.forEach(rune => {
    byId.set(rune.id as RuneId, rune);
  });

  const getRune = (id: RuneId): RuneContent | undefined => {
    return byId.get(id);
  };

  const value: RunesContextValue = {
    byId,
    list: runes,
    getRune,
  };

  return (
    <RunesContext.Provider value={value}>
      {children}
    </RunesContext.Provider>
  );
}

export function useRunesContent(): RunesContextValue {
  const context = useContext(RunesContext);
  if (!context) {
    throw new Error('useRunesContent must be used within a RunesProvider');
  }
  return context;
}

// Hook for getting a specific rune
export function useRune(id: RuneId): RuneContent | undefined {
  const { getRune } = useRunesContent();
  return getRune(id);
}
