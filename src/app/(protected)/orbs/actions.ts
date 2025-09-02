'use server';

import { auth } from '@/lib/firebase/client';
import { maybeRegen, spend } from '@/lib/orbs/service';
import { revalidatePath } from 'next/cache';

// Get orbs with regeneration
export async function getOrbsAction() {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const uid = user.uid;
    const result = await maybeRegen(uid);
    
    return {
      success: true,
      data: {
        current: result.doc.current,
        max: result.doc.max,
        nextEtaSec: result.nextEtaSec,
        granted: result.granted
      }
    };
  } catch (error) {
    console.error('Error in getOrbsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Spend orbs
export async function spendOrbsAction(amount: number = 1) {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const uid = user.uid;
    const result = await spend(uid, amount);
    
    // Revalidate relevant paths
    revalidatePath('/arcade');
    revalidatePath('/');
    
    return {
      success: true,
      data: {
        current: result.current,
        max: result.max,
        spent: amount
      }
    };
  } catch (error) {
    console.error('Error in spendOrbsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Grant one orb (for watch-to-earn, etc.)
export async function grantOrbAction() {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const uid = user.uid;
    const { grantOne } = await import('@/lib/orbs/service');
    const result = await grantOne(uid);
    
    // Revalidate relevant paths
    revalidatePath('/arcade');
    revalidatePath('/');
    
    return {
      success: true,
      data: {
        current: result.current,
        max: result.max
      }
    };
  } catch (error) {
    console.error('Error in grantOrbAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
