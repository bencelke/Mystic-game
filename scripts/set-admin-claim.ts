#!/usr/bin/env tsx

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_ADMIN_CREDENTIALS_B64
      ? JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS_B64, 'base64').toString())
      : null;

    if (!serviceAccount) {
      console.error('❌ FIREBASE_ADMIN_CREDENTIALS_B64 environment variable is required');
      process.exit(1);
    }

    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }
}

// Set admin custom claim
async function setAdminClaim(uid: string, isAdmin: boolean) {
  try {
    const auth = getAuth();
    const db = getFirestore();

    // Set custom claim
    await auth.setCustomUserClaims(uid, { admin: isAdmin });

    // Get user email for audit log
    const userRecord = await auth.getUser(uid);
    const userEmail = userRecord.email || 'unknown';

    // Log audit event
    await db.collection('audit_logs').add({
      actorUid: 'system', // System action
      action: isAdmin ? 'admin_granted' : 'admin_revoked',
      targetPath: `users/${uid}`,
      meta: {
        targetEmail: userEmail,
        adminStatus: isAdmin,
        timestamp: FieldValue.serverTimestamp()
      },
      createdAt: FieldValue.serverTimestamp()
    });

    console.log(`✅ ${isAdmin ? 'Granted' : 'Revoked'} admin access for user ${uid} (${userEmail})`);
    
  } catch (error) {
    console.error('❌ Error setting admin claim:', error);
    process.exit(1);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('Usage: tsx scripts/set-admin-claim.ts <UID> <true|false>');
    console.log('Example: tsx scripts/set-admin-claim.ts abc123 true');
    process.exit(1);
  }

  const [uid, adminFlag] = args;
  const isAdmin = adminFlag.toLowerCase() === 'true';

  if (!uid || (adminFlag !== 'true' && adminFlag !== 'false')) {
    console.error('❌ Invalid arguments. UID must be provided and admin flag must be true or false');
    process.exit(1);
  }

  console.log(`🔧 ${isAdmin ? 'Granting' : 'Revoking'} admin access for UID: ${uid}`);

  initializeFirebaseAdmin();
  await setAdminClaim(uid, isAdmin);
}

// Run the script
main().catch(console.error);
