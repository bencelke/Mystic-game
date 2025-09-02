// Mystic Energy Orbs Service (Server-only)

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  runTransaction,
  serverTimestamp,
  type DocumentReference,
  type WriteBatch,
  type Transaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { adminDb, serverTimestamp as adminServerTimestamp } from '@/lib/firebase/admin';
import { orbsDoc, userDoc, featuresConfigDoc } from '@/lib/db/paths';
import { 
  FREE_MAX, 
  FREE_REGEN_PER_HOUR, 
  REGEN_INTERVAL_SEC,
  PRO_MAX,
  PRO_REGEN_PER_HOUR
} from '@/lib/orbs/constants';
import { 
  secondsSince, 
  regenEligible, 
  applyRegen, 
  nextRegenEta,
  canSpend 
} from '@/lib/orbs/math';
import type { OrbsDoc, UserDoc, FeaturesConfig } from '@/types/mystic';

// Default orbs document for new users
const createDefaultOrbs = (): OrbsDoc => ({
  current: FREE_MAX,
  max: FREE_MAX,
  regenRatePerHour: FREE_REGEN_PER_HOUR,
  lastRegenAt: new Date()
});

// Check if admin SDK is available
const isAdminAvailable = (): boolean => {
  return process.env.FIREBASE_ADMIN_CREDENTIALS_B64 !== undefined;
};

// Get or create orbs document for a user
export const getOrCreateOrbs = async (uid: string): Promise<OrbsDoc> => {
  try {
    if (isAdminAvailable()) {
      // Use Admin SDK
      const orbsRef = adminDb.doc(orbsDoc(uid));
      const orbsSnap = await orbsRef.get();
      
      if (orbsSnap.exists()) {
        return orbsSnap.data() as OrbsDoc;
      }
      
      // Create default orbs document
      const defaultOrbs = createDefaultOrbs();
      defaultOrbs.lastRegenAt = adminServerTimestamp();
      
      await orbsRef.set(defaultOrbs);
      return defaultOrbs;
    } else {
      // Fallback to client SDK (dev only)
      console.warn('⚠️  Admin SDK not available, using client fallback for orbs');
      
      const orbsRef = doc(db, orbsDoc(uid));
      const orbsSnap = await getDoc(orbsRef);
      
      if (orbsSnap.exists()) {
        return orbsSnap.data() as OrbsDoc;
      }
      
      // Create default orbs document
      const defaultOrbs = createDefaultOrbs();
      defaultOrbs.lastRegenAt = serverTimestamp();
      
      await setDoc(orbsRef, defaultOrbs);
      return defaultOrbs;
    }
  } catch (error) {
    console.error('Error getting/creating orbs:', error);
    // Return default orbs on error
    return createDefaultOrbs();
  }
};

// Check if user has pro entitlement
export const isPro = async (uid: string): Promise<boolean> => {
  try {
    if (isAdminAvailable()) {
      const userRef = adminDb.doc(userDoc(uid));
      const userSnap = await userRef.get();
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserDoc;
        return userData.proEntitlement === true;
      }
    } else {
      // Fallback to client SDK
      const userRef = doc(db, userDoc(uid));
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserDoc;
        return userData.proEntitlement === true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking pro status:', error);
    return false;
  }
};

// Maybe regenerate orbs based on elapsed time
export const maybeRegen = async (
  uid: string, 
  now: number = Date.now()
): Promise<{ doc: OrbsDoc; granted: number; nextEtaSec: number }> => {
  try {
    const orbs = await getOrCreateOrbs(uid);
    const isProUser = await isPro(uid);
    
    // Pro users have unlimited orbs
    if (isProUser) {
      return {
        doc: { ...orbs, current: PRO_MAX, max: PRO_MAX },
        granted: 0,
        nextEtaSec: 0
      };
    }
    
    const lastRegen = orbs.lastRegenAt instanceof Date 
      ? orbs.lastRegenAt.getTime() 
      : orbs.lastRegenAt?.toMillis?.() || now;
    
    const elapsedSec = secondsSince(lastRegen);
    const toGrant = regenEligible(elapsedSec, REGEN_INTERVAL_SEC);
    
    if (toGrant > 0) {
      const { next, granted } = applyRegen(
        orbs.current, 
        orbs.max, 
        toGrant * orbs.regenRatePerHour
      );
      
      if (granted > 0) {
        // Calculate new lastRegenAt preserving cadence
        const newLastRegenAt = new Date(lastRegen + (toGrant * REGEN_INTERVAL_SEC * 1000));
        
        const updatedOrbs: OrbsDoc = {
          ...orbs,
          current: next,
          lastRegenAt: newLastRegenAt
        };
        
        // Persist update
        if (isAdminAvailable()) {
          const orbsRef = adminDb.doc(orbsDoc(uid));
          await orbsRef.update({
            current: next,
            lastRegenAt: newLastRegenAt
          });
        } else {
          const orbsRef = doc(db, orbsDoc(uid));
          await updateDoc(orbsRef, {
            current: next,
            lastRegenAt: newLastRegenAt
          });
        }
        
        orbs.current = next;
        orbs.lastRegenAt = newLastRegenAt;
      }
    }
    
    // Calculate next ETA
    const nextEtaSec = nextRegenEta(
      orbs.current,
      orbs.max,
      secondsSince(orbs.lastRegenAt),
      REGEN_INTERVAL_SEC
    );
    
    return {
      doc: orbs,
      granted: 0, // Already applied above
      nextEtaSec
    };
  } catch (error) {
    console.error('Error in maybeRegen:', error);
    // Return current state on error
    const orbs = await getOrCreateOrbs(uid);
    return {
      doc: orbs,
      granted: 0,
      nextEtaSec: 0
    };
  }
};

// Check if user can spend orbs
export const canSpendOrbs = (doc: OrbsDoc, n: number = 1, pro: boolean = false): boolean => {
  if (pro) return true;
  return canSpend(doc.current, n, pro);
};

// Spend orbs (atomic operation)
export const spend = async (uid: string, n: number = 1): Promise<OrbsDoc> => {
  try {
    const isProUser = await isPro(uid);
    
    // Pro users can't spend orbs (they're unlimited)
    if (isProUser) {
      return { current: PRO_MAX, max: PRO_MAX, regenRatePerHour: PRO_REGEN_PER_HOUR, lastRegenAt: new Date() };
    }
    
    if (isAdminAvailable()) {
      // Use Admin SDK with transaction
      const result = await adminDb.runTransaction(async (transaction) => {
        const orbsRef = adminDb.doc(orbsDoc(uid));
        const orbsSnap = await transaction.get(orbsRef);
        
        if (!orbsSnap.exists()) {
          throw new Error('Orbs document not found');
        }
        
        const orbs = orbsSnap.data() as OrbsDoc;
        
        // Check if can spend
        if (!canSpendOrbs(orbs, n, false)) {
          throw new Error('Insufficient orbs');
        }
        
        // Decrement orbs
        const newCurrent = Math.max(0, orbs.current - n);
        
        transaction.update(orbsRef, {
          current: newCurrent
        });
        
        return { ...orbs, current: newCurrent };
      });
      
      return result;
    } else {
      // Fallback to client SDK
      const result = await runTransaction(db, async (transaction: Transaction) => {
        const orbsRef = doc(db, orbsDoc(uid));
        const orbsSnap = await transaction.get(orbsRef);
        
        if (!orbsSnap.exists()) {
          throw new Error('Orbs document not found');
        }
        
        const orbs = orbsSnap.data() as OrbsDoc;
        
        // Check if can spend
        if (!canSpendOrbs(orbs, n, false)) {
          throw new Error('Insufficient orbs');
        }
        
        // Decrement orbs
        const newCurrent = Math.max(0, orbs.current - n);
        
        transaction.update(orbsRef, {
          current: newCurrent
        });
        
        return { ...orbs, current: newCurrent };
      });
      
      return result;
    }
  } catch (error) {
    console.error('Error spending orbs:', error);
    throw error;
  }
};

// Grant one orb (used by watch-to-earn)
export const grantOne = async (uid: string): Promise<OrbsDoc> => {
  try {
    const orbs = await getOrCreateOrbs(uid);
    const isProUser = await isPro(uid);
    
    // Pro users don't need orb grants
    if (isProUser) {
      return orbs;
    }
    
    const { next } = applyRegen(orbs.current, orbs.max, 1);
    
    if (next > orbs.current) {
      // Persist update
      if (isAdminAvailable()) {
        const orbsRef = adminDb.doc(orbsDoc(uid));
        await orbsRef.update({ current: next });
      } else {
        const orbsRef = doc(db, orbsDoc(uid));
        await updateDoc(orbsRef, { current: next });
      }
      
      return { ...orbs, current: next };
    }
    
    return orbs;
  } catch (error) {
    console.error('Error granting orb:', error);
    throw error;
  }
};
