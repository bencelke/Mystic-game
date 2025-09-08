'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { featuresConfigSchema } from '@/lib/validation/inputs';
import { logAudit } from '@/lib/audit/log';
import { checkAndConsume } from '@/lib/security/rate-limit';

export interface FeaturesConfigResult {
  success: boolean;
  config?: any;
  error?: string;
}

/**
 * Get current features configuration
 */
export async function getFeaturesConfigAction(): Promise<FeaturesConfigResult> {
  try {
    const docRef = adminDb.collection('features').doc('config');
    const doc = await docRef.get();
    
    if (!doc.exists) {
      // Return default config if none exists
      const defaultConfig = {
        watchToEarnEnabled: true,
        watchCooldownMin: 30,
        watchDailyLimit: 5,
        dailyRitualEnabled: true,
        proFeaturesEnabled: true,
        socialFeaturesEnabled: false,
        offlineModeEnabled: false,
        inlineWheelEnabled: false,
        proXpMultiplier: 2,
        wheelDailyFree: 1,
        wheelDailyFreePro: 2,
        wheelAllowVisionExtra: true,
        wheelDailyMax: 5,
        wheelVisionPlacement: 'wheel'
      };
      
      return {
        success: true,
        config: defaultConfig
      };
    }
    
    const config = doc.data();
    return {
      success: true,
      config
    };
    
  } catch (error) {
    console.error('Error getting features config:', error);
    return {
      success: false,
      error: 'Failed to load configuration'
    };
  }
}

/**
 * Update features configuration
 */
export async function updateFeaturesConfigAction(formData: FormData): Promise<void> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-admin-user';
    
    // Rate limiting
    const rateLimitResult = await checkAndConsume(uid, 'admin:features');
    if (!rateLimitResult.allowed) {
      throw new Error('Too many requests. Please wait a moment.');
    }
    
    // Parse form data
    const rawConfig = {
      watchToEarnEnabled: formData.get('watchToEarnEnabled') === 'on',
      watchCooldownMin: parseInt(formData.get('watchCooldownMin') as string) || 30,
      watchDailyLimit: parseInt(formData.get('watchDailyLimit') as string) || 5,
      dailyRitualEnabled: formData.get('dailyRitualEnabled') === 'on',
      proFeaturesEnabled: formData.get('proFeaturesEnabled') === 'on',
      socialFeaturesEnabled: formData.get('socialFeaturesEnabled') === 'on',
      offlineModeEnabled: formData.get('offlineModeEnabled') === 'on',
      inlineWheelEnabled: formData.get('inlineWheelEnabled') === 'on',
      proXpMultiplier: parseFloat(formData.get('proXpMultiplier') as string) || 2,
      wheelDailyFree: parseInt(formData.get('wheelDailyFree') as string) || 1,
      wheelDailyFreePro: parseInt(formData.get('wheelDailyFreePro') as string) || 2,
      wheelAllowVisionExtra: formData.get('wheelAllowVisionExtra') === 'on',
      wheelDailyMax: parseInt(formData.get('wheelDailyMax') as string) || 5,
      wheelVisionPlacement: formData.get('wheelVisionPlacement') as string || 'wheel'
    };
    
    // Validate input
    const validatedConfig = featuresConfigSchema.parse(rawConfig);
    
    // Get current config for comparison
    const docRef = adminDb.collection('features').doc('config');
    const currentDoc = await docRef.get();
    const currentConfig = currentDoc.exists ? currentDoc.data() : {};
    
    // Update configuration
    await docRef.set({
      ...validatedConfig,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: uid
    }, { merge: true });
    
    // Log audit event
    const changes = Object.keys(validatedConfig).filter(
      key => validatedConfig[key as keyof typeof validatedConfig] !== currentConfig[key]
    );
    
    if (changes.length > 0) {
      await logAudit({
        actorUid: uid,
        action: 'features_config_updated',
        targetPath: 'features/config',
        meta: {
          changes,
          oldConfig: currentConfig,
          newConfig: validatedConfig
        }
      });
    }
    
  } catch (error) {
    console.error('Error updating features config:', error);
    throw error; // Re-throw to let Next.js handle the error
  }
}
