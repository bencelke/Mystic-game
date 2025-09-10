'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RuneId } from '@/content/runes-ids';

export function useRuneDrawer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [currentRuneId, setCurrentRuneId] = useState<RuneId | null>(null);

  // Check URL for rune parameter on mount and when searchParams change
  useEffect(() => {
    const runeParam = searchParams.get('rune');
    if (runeParam && runeParam !== currentRuneId) {
      // Validate that it's a valid rune ID
      const validRuneIds = [
        'fehu', 'uruz', 'thurisaz', 'ansuz', 'raidho', 'kenaz',
        'gebo', 'wunjo', 'hagalaz', 'nauthiz', 'isa', 'jera',
        'eihwaz', 'perthro', 'algiz', 'sowilo', 'tiwaz', 'berkano',
        'ehwaz', 'mannaz', 'laguz', 'ingwaz', 'othala', 'dagaz'
      ];
      
      if (validRuneIds.includes(runeParam)) {
        setCurrentRuneId(runeParam as RuneId);
        setIsOpen(true);
      }
    } else if (!runeParam && isOpen) {
      // URL doesn't have rune param but drawer is open - close it
      setIsOpen(false);
      setCurrentRuneId(null);
    }
  }, [searchParams, currentRuneId, isOpen]);

  const openRune = useCallback((runeId: RuneId) => {
    setCurrentRuneId(runeId);
    setIsOpen(true);
    
    // Update URL with rune parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('rune', runeId);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const closeRune = useCallback(() => {
    setIsOpen(false);
    setCurrentRuneId(null);
    
    // Remove rune parameter from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('rune');
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  const changeRune = useCallback((runeId: RuneId) => {
    setCurrentRuneId(runeId);
    
    // Update URL with new rune parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('rune', runeId);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return {
    isOpen,
    currentRuneId,
    openRune,
    closeRune,
    changeRune
  };
}
