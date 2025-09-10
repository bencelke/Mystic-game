'use server';

import { auth } from '@/lib/firebase/client';
import { adminDb, serverTimestamp } from '@/lib/firebase/admin';
import { getNumber } from '@/lib/content/numbers';
import { NumId } from '@/content/numbers-ids';
import { NumberFavoritesDoc, NumberNoteDoc } from '@/types/mystic';
import { checkAndConsume, formatRateLimitError } from '@/lib/security/rate-limit';
import { z } from 'zod';

// Validation schemas
const noteSchema = z.object({
  text: z.string().trim().max(2000, 'Note text must be 2000 characters or less'),
});

/**
 * Get number detail content
 */
export async function getNumberDetailAction(numId: NumId) {
  try {
    const number = getNumber(numId);
    
    if (!number) {
      return {
        success: false,
        error: 'Number not found',
      };
    }

    return {
      success: true,
      number,
    };
  } catch (error) {
    console.error('Error getting number detail:', error);
    return {
      success: false,
      error: 'Failed to get number detail',
    };
  }
}

/**
 * Get user's favorite status for a number
 */
export async function getNumberFavoriteAction(numId: NumId) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const docRef = adminDb.collection('favorites_numbers').doc(user.uid);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data() as NumberFavoritesDoc;
      const isFavorite = data[numId.toString()] === true;
      
      return {
        success: true,
        isFavorite,
      };
    }

    return {
      success: true,
      isFavorite: false,
    };
  } catch (error) {
    console.error('Error getting number favorite:', error);
    return {
      success: false,
      error: 'Failed to get favorite status',
    };
  }
}

/**
 * Toggle favorite status for a number
 */
export async function toggleFavoriteNumberAction(numId: NumId, fav: boolean) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const docRef = adminDb.collection('favorites_numbers').doc(user.uid);
    const docSnap = await docRef.get();
    
    const currentFavorites = docSnap.exists 
      ? (docSnap.data() as NumberFavoritesDoc)
      : {};
    
    const updatedFavorites = {
      ...currentFavorites,
      [numId.toString()]: fav,
    };
    
    if (!docSnap.exists) {
      await docRef.set(updatedFavorites);
    } else {
      await docRef.update(updatedFavorites);
    }

    return {
      success: true,
      isFavorite: fav,
    };
  } catch (error) {
    console.error('Error toggling number favorite:', error);
    return {
      success: false,
      error: 'Failed to update favorite status',
    };
  }
}

/**
 * Get user's note for a number
 */
export async function getNumberNoteAction(numId: NumId) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const docRef = adminDb.collection('number_notes').doc(user.uid).collection('items').doc(numId.toString());
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data() as NumberNoteDoc;
      return {
        success: true,
        note: data.text || '',
      };
    }

    return {
      success: true,
      note: '',
    };
  } catch (error) {
    console.error('Error getting number note:', error);
    return {
      success: false,
      error: 'Failed to get note',
    };
  }
}

/**
 * Save user's note for a number
 */
export async function saveNumberNoteAction(numId: NumId, { text }: { text: string }) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Rate limiting
    const rateLimitResult = await checkAndConsume(
      user.uid,
      'notes:number',
      12, // 12 requests per minute
      60 * 1000 // 1 minute window
    );

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: formatRateLimitError(rateLimitResult),
      };
    }

    // Validate input
    const validationResult = noteSchema.safeParse({ text });
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message || 'Invalid note data',
      };
    }

    const validatedText = validationResult.data.text;

    const docRef = adminDb.collection('number_notes').doc(user.uid).collection('items').doc(numId.toString());
    const docSnap = await docRef.get();
    
    const noteData: NumberNoteDoc = {
      numId,
      text: validatedText,
      updatedAt: serverTimestamp(),
    };
    
    if (!docSnap.exists) {
      await docRef.set(noteData);
    } else {
      await docRef.update(noteData);
    }

    return {
      success: true,
      note: validatedText,
    };
  } catch (error) {
    console.error('Error saving number note:', error);
    return {
      success: false,
      error: 'Failed to save note',
    };
  }
}
