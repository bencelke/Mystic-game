'use client';

import { db } from '@/lib/firebase/client';
import { RuneFavoritesDoc } from '@/types/mystic';
import { RuneId } from '@/content/runes-ids';

/**
 * Get user's favorite runes
 */
export async function getFavoriteRunes(uid: string): Promise<Set<RuneId>> {
  try {
    const doc = await db.collection('favorites_runes').doc(uid).get();
    
    if (!doc.exists) {
      return new Set();
    }
    
    const data = doc.data() as RuneFavoritesDoc;
    const favorites = new Set<RuneId>();
    
    Object.entries(data).forEach(([runeId, isFavorite]) => {
      if (isFavorite) {
        favorites.add(runeId as RuneId);
      }
    });
    
    return favorites;
  } catch (error) {
    console.error('Error fetching favorite runes:', error);
    return new Set();
  }
}

/**
 * Toggle a rune's favorite status
 */
export async function toggleRuneFavorite(uid: string, runeId: RuneId): Promise<boolean> {
  try {
    const docRef = db.collection('favorites_runes').doc(uid);
    const doc = await docRef.get();
    
    let currentFavorites: RuneFavoritesDoc = {};
    if (doc.exists) {
      currentFavorites = doc.data() as RuneFavoritesDoc;
    }
    
    const newStatus = !currentFavorites[runeId];
    currentFavorites[runeId] = newStatus;
    
    await docRef.set(currentFavorites, { merge: true });
    
    return newStatus;
  } catch (error) {
    console.error('Error toggling rune favorite:', error);
    throw error;
  }
}

/**
 * Set multiple runes as favorites
 */
export async function setRuneFavorites(uid: string, runeIds: RuneId[]): Promise<void> {
  try {
    const favorites: RuneFavoritesDoc = {};
    runeIds.forEach(runeId => {
      favorites[runeId] = true;
    });
    
    await db.collection('favorites_runes').doc(uid).set(favorites, { merge: true });
  } catch (error) {
    console.error('Error setting rune favorites:', error);
    throw error;
  }
}

/**
 * Remove multiple runes from favorites
 */
export async function removeRuneFavorites(uid: string, runeIds: RuneId[]): Promise<void> {
  try {
    const updates: RuneFavoritesDoc = {};
    runeIds.forEach(runeId => {
      updates[runeId] = false;
    });
    
    await db.collection('favorites_runes').doc(uid).set(updates, { merge: true });
  } catch (error) {
    console.error('Error removing rune favorites:', error);
    throw error;
  }
}