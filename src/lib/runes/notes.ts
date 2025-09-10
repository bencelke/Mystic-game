'use client';

import { db } from '@/lib/firebase/client';
import { RuneNoteDoc } from '@/types/mystic';
import { RuneId } from '@/content/runes-ids';

/**
 * Get a user's note for a specific rune
 */
export async function getRuneNote(uid: string, runeId: RuneId): Promise<RuneNoteDoc | null> {
  try {
    const doc = await db
      .collection('rune_notes')
      .doc(uid)
      .collection('items')
      .doc(runeId)
      .get();
    
    if (!doc.exists) {
      return null;
    }
    
    return doc.data() as RuneNoteDoc;
  } catch (error) {
    console.error('Error fetching rune note:', error);
    return null;
  }
}

/**
 * Save or update a rune note
 */
export async function saveRuneNote(uid: string, runeId: RuneId, text: string): Promise<void> {
  try {
    // Validate text length
    if (text.length > 2000) {
      throw new Error('Note text exceeds maximum length of 2000 characters');
    }
    
    const noteData: RuneNoteDoc = {
      runeId,
      text: text.trim(),
      updatedAt: new Date()
    };
    
    await db
      .collection('rune_notes')
      .doc(uid)
      .collection('items')
      .doc(runeId)
      .set(noteData);
  } catch (error) {
    console.error('Error saving rune note:', error);
    throw error;
  }
}

/**
 * Delete a rune note
 */
export async function deleteRuneNote(uid: string, runeId: RuneId): Promise<void> {
  try {
    await db
      .collection('rune_notes')
      .doc(uid)
      .collection('items')
      .doc(runeId)
      .delete();
  } catch (error) {
    console.error('Error deleting rune note:', error);
    throw error;
  }
}

/**
 * Get all rune notes for a user
 */
export async function getAllRuneNotes(uid: string): Promise<Map<RuneId, RuneNoteDoc>> {
  try {
    const snapshot = await db
      .collection('rune_notes')
      .doc(uid)
      .collection('items')
      .get();
    
    const notes = new Map<RuneId, RuneNoteDoc>();
    
    snapshot.forEach((doc: any) => {
      const data = doc.data() as RuneNoteDoc;
      notes.set(data.runeId as RuneId, data);
    });
    
    return notes;
  } catch (error) {
    console.error('Error fetching all rune notes:', error);
    return new Map();
  }
}