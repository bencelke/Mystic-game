import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { idempotencyKeySchema } from '@/lib/validation/inputs';

export interface IdempotencyResult<T = any> {
  isNew: boolean;
  result?: T;
  createdAt?: Date;
}

/**
 * Check if an idempotency key exists and return cached result if available
 */
export async function checkIdempotency<T>(
  uid: string,
  key: string,
  ttlMinutes: number = 5
): Promise<IdempotencyResult<T>> {
  try {
    const validatedKey = idempotencyKeySchema.parse(key);
    const docId = `${uid}_${validatedKey}`;
    const docRef = adminDb.collection('idempotency').doc(docId);
    
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return { isNew: true };
    }
    
    const data = doc.data()!;
    const createdAt = data.createdAt?.toDate?.() || new Date();
    const ttlMs = ttlMinutes * 60 * 1000;
    const isExpired = Date.now() - createdAt.getTime() > ttlMs;
    
    if (isExpired) {
      // Delete expired entry
      await docRef.delete();
      return { isNew: true };
    }
    
    return {
      isNew: false,
      result: data.result,
      createdAt
    };
    
  } catch (error) {
    console.error('Idempotency check error:', error);
    // On error, treat as new request
    return { isNew: true };
  }
}

/**
 * Store idempotency result
 */
export async function storeIdempotencyResult<T>(
  uid: string,
  key: string,
  result: T,
  ttlMinutes: number = 5
): Promise<void> {
  try {
    const validatedKey = idempotencyKeySchema.parse(key);
    const docId = `${uid}_${validatedKey}`;
    const docRef = adminDb.collection('idempotency').doc(docId);
    
    await docRef.set({
      result,
      createdAt: FieldValue.serverTimestamp(),
      ttlMinutes,
      uid
    });
    
  } catch (error) {
    console.error('Idempotency store error:', error);
    // Don't throw - idempotency is best effort
  }
}

/**
 * Generate a unique idempotency key
 */
export function generateIdempotencyKey(prefix: string = 'req'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Clean up expired idempotency keys (admin function)
 */
export async function cleanupExpiredIdempotencyKeys(): Promise<number> {
  try {
    const now = Date.now();
    const cutoffTime = new Date(now - (24 * 60 * 60 * 1000)); // 24 hours ago
    
    const query = adminDb
      .collection('idempotency')
      .where('createdAt', '<', cutoffTime)
      .limit(100);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return 0;
    }
    
    const batch = adminDb.batch();
    let count = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });
    
    await batch.commit();
    return count;
    
  } catch (error) {
    console.error('Idempotency cleanup error:', error);
    return 0;
  }
}
