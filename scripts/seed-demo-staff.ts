#!/usr/bin/env tsx
/**
 * One-off script to create a demo staff account for evaluator/demo purposes.
 * 
 * This script uses Firebase Admin SDK to:
 * 1. Create a Firebase Auth user with email/password
 * 2. Set their Firestore role to 'staff' directly
 * 
 * This bypasses the public signup flow (which correctly defaults to 'fan'),
 * creating a privileged account outside the app's normal registration path.
 * 
 * USAGE:
 *   1. Download service account key from Firebase Console:
 *      - Go to Project Settings > Service Accounts
 *      - Click "Generate New Private Key"
 *      - Save as scripts/serviceAccountKey.json (DO NOT COMMIT)
 *   
 *   2. Run this script once:
 *      npm run seed-demo-staff
 *   
 *   3. Delete the service account key file after use:
 *      rm scripts/serviceAccountKey.json
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DEMO_EMAIL = 'admin@stadium.test';
const DEMO_PASSWORD = crypto.randomBytes(16).toString('base64').slice(0, 16); // Generate secure random password
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');
const FIRESTORE_DATABASE_ID = '(default)'; // Using default Firestore database

async function seedDemoStaff() {
  console.log('🔧 StadiumPulse AI - Demo Staff Account Seeder\n');

  // 1. Check for service account key
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ ERROR: Service account key not found!');
    console.error(`\nExpected location: ${SERVICE_ACCOUNT_PATH}`);
    console.error('\n📋 How to get the service account key:');
    console.error('   1. Go to Firebase Console: https://console.firebase.google.com/');
    console.error('   2. Select your project: agentflow-prod-assistant');
    console.error('   3. Go to Project Settings (gear icon) > Service Accounts');
    console.error('   4. Click "Generate New Private Key"');
    console.error(`   5. Save the downloaded JSON file as: ${SERVICE_ACCOUNT_PATH}`);
    console.error('   6. Run this script again: npm run seed-demo-staff\n');
    process.exit(1);
  }

  // 2. Initialize Firebase Admin SDK
  console.log('📦 Initializing Firebase Admin SDK...');
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });

  const auth = getAuth();
  const db = getFirestore();
  db.settings({ databaseId: FIRESTORE_DATABASE_ID });

  try {
    // 3. Check if user already exists
    console.log(`\n🔍 Checking if ${DEMO_EMAIL} already exists...`);
    let userRecord;
    
    try {
      userRecord = await auth.getUserByEmail(DEMO_EMAIL);
      console.log(`✅ User already exists with UID: ${userRecord.uid}`);
      console.log('   Updating their Firestore role to ensure they have staff access...');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // 4. Create new Firebase Auth user
        console.log(`➕ Creating new Firebase Auth user: ${DEMO_EMAIL}`);
        userRecord = await auth.createUser({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          emailVerified: true,
          displayName: 'Demo Staff Account'
        });
        console.log(`✅ Created user with UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // 5. Set Firestore role to 'staff'
    console.log(`\n📝 Setting Firestore user document with role='staff'...`);
    const userDocRef = db.collection('users').doc(userRecord.uid);
    
    await userDocRef.set({
      email: DEMO_EMAIL,
      role: 'staff',
      createdAt: new Date().toISOString(),
      displayName: 'Demo Staff Account',
      createdBy: 'seed-demo-staff script'
    }, { merge: true });
    
    console.log('✅ Firestore document created/updated successfully');

    // 6. Verify the role
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    
    console.log('\n🎉 SUCCESS! Demo staff account is ready.\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📧 Email:    ', DEMO_EMAIL);
    console.log('🔑 Password: ', userRecord.uid === userRecord.uid ? DEMO_PASSWORD : '[use existing password]');
    console.log('👤 UID:      ', userRecord.uid);
    console.log('🏷️  Role:     ', userData?.role);
    console.log('═══════════════════════════════════════════════\n');

    console.log('💾 Save these credentials in a secure location (NOT in the repo).');
    console.log('🗑️  You can now delete the service account key file:');
    console.log(`   rm ${SERVICE_ACCOUNT_PATH}\n`);

    // 7. Write credentials to a local file (gitignored)
    const credentialsPath = path.join(__dirname, 'demo-credentials.txt');
    fs.writeFileSync(credentialsPath, 
      `StadiumPulse AI - Demo Staff Account\n` +
      `Generated: ${new Date().toISOString()}\n\n` +
      `Email:    ${DEMO_EMAIL}\n` +
      `Password: ${DEMO_PASSWORD}\n` +
      `UID:      ${userRecord.uid}\n` +
      `Role:     ${userData?.role}\n\n` +
      `DO NOT COMMIT THIS FILE TO GIT!\n`
    );
    console.log(`📄 Credentials also saved to: ${credentialsPath}`);
    console.log('   (This file is gitignored - safe to keep locally)\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

// Run the script
seedDemoStaff()
  .then(() => {
    console.log('✨ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
