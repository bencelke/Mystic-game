'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { RuneId } from '@/content/runes-ids';
import { getRuneFavorites, toggleRuneFavorite, setRuneFavorite } from './favorites';
import { getRuneNote, saveRuneNote, deleteRuneNote } from './notes';

export function useRuneData() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<RuneId>>(new Set());
  const [notes, setNotes] = useState<Map<RuneId, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Load user's favorites on mount
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites(new Set());
      setNotes(new Map());
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const userFavorites = await getRuneFavorites(user.uid);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadNote = async (runeId: RuneId) => {
    if (!user) return '';
    
    try {
      const note = await getRuneNote(user.uid, runeId);
      setNotes(prev => new Map(prev).set(runeId, note));
      return note;
    } catch (error) {
      console.error('Error loading note:', error);
      return '';
    }
  };

  const toggleFavorite = useCallback(async (runeId: RuneId) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const newStatus = await toggleRuneFavorite(user.uid, runeId);
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newStatus) {
          newFavorites.add(runeId);
        } else {
          newFavorites.delete(runeId);
        }
        return newFavorites;
      });
      return newStatus;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const setFavorite = useCallback(async (runeId: RuneId, isFavorite: boolean) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await setRuneFavorite(user.uid, runeId, isFavorite);
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isFavorite) {
          newFavorites.add(runeId);
        } else {
          newFavorites.delete(runeId);
        }
        return newFavorites;
      });
    } catch (error) {
      console.error('Error setting favorite:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveNote = useCallback(async (runeId: RuneId, text: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await saveRuneNote(user.uid, runeId, text);
      setNotes(prev => new Map(prev).set(runeId, text));
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteNote = useCallback(async (runeId: RuneId) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await deleteRuneNote(user.uid, runeId);
      setNotes(prev => {
        const newNotes = new Map(prev);
        newNotes.delete(runeId);
        return newNotes;
      });
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const isFavorite = useCallback((runeId: RuneId) => {
    return favorites.has(runeId);
  }, [favorites]);

  const getNote = useCallback((runeId: RuneId) => {
    return notes.get(runeId) || '';
  }, [notes]);

  return {
    favorites,
    notes,
    isLoading,
    isFavorite,
    getNote,
    loadNote,
    toggleFavorite,
    setFavorite,
    saveNote,
    deleteNote,
  };
}
