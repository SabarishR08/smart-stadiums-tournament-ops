# Scripts Directory

This folder contains one-off administrative scripts for StadiumPulse AI.

---

## 📋 seed-demo-staff.ts

**Purpose**: Creates a demo staff account for evaluator/demo purposes using Firebase Admin SDK.

This script bypasses the public signup flow (which correctly defaults new users to `role: 'fan'`) and creates a privileged staff account directly in Firebase Auth + Firestore.

### Prerequisites

1. **Firebase Admin SDK Service Account Key** (DO NOT COMMIT TO GIT!)
   
   You need to download this once from Firebase Console:
   
   **Steps to get the key:**
   ```
   1. Go to: https://console.firebase.google.com/
   2. Select project: gen-lang-client-0639363380
   3. Click gear icon (⚙️) → Project Settings
   4. Navigate to: Service Accounts tab
   5. Click: "Generate New Private Key" button
   6. Save downloaded JSON file as: scripts/serviceAccountKey.json
   ```
   
   **⚠️ SECURITY WARNING**: This file grants admin access to your Firebase project.
   - Never commit it to Git (already in .gitignore)
   - Delete it after running the script
   - Store securely if you need to keep it

### Usage

```bash
# 1. Download service account key (see above)

# 2. Run the seeder script
npm run seed-demo-staff

# 3. Save the generated credentials somewhere secure (NOT in the repo)
#    The script outputs:
#    - Email: admin@stadium.test
#    - Password: [randomly generated]
#    - UID: [Firebase user ID]

# 4. Delete the service account key file
rm scripts/serviceAccountKey.json
```

### What It Does

1. Checks for service account key file
2. Initializes Firebase Admin SDK
3. Creates Firebase Auth user with:
   - Email: `admin@stadium.test`
   - Password: Randomly generated (16 characters)
   - Email verified: `true`
4. Creates Firestore document at `users/{uid}` with:
   - `email`: admin@stadium.test
   - `role`: **staff**
   - `createdAt`: timestamp
   - `displayName`: "Demo Staff Account"
5. Outputs credentials to console AND saves to `demo-credentials.txt` (gitignored)

### Generated Files (Gitignored)

- `scripts/serviceAccountKey.json` - Firebase Admin SDK key (DELETE AFTER USE)
- `scripts/demo-credentials.txt` - Generated login credentials (safe to keep locally)

### Security Notes

- **No credentials are hardcoded** in source code
- The demo account exists only in your Firebase backend
- Evaluators cannot access it without knowing:
  1. Your Firebase project credentials (private)
  2. The specific password generated (not in repo)
- This matches the secure pattern: backend-enforced roles, zero hardcoded secrets

### Troubleshooting

**Error: "Service account key not found"**
- Make sure you downloaded the key from Firebase Console
- Saved it as `scripts/serviceAccountKey.json` (exact filename)
- Run from project root: `npm run seed-demo-staff`

**Error: "User already exists"**
- Script will update the existing user's Firestore role to 'staff'
- Password remains unchanged (use the original password)

**Error: "Permission denied"**
- Check that your service account key is valid
- Verify your Firebase project ID matches: `gen-lang-client-0639363380`
- Ensure Firestore database ID is: `ai-studio-605ea102-90d9-41ca-940e-737ad40bc9d4`

---

## Why This Approach?

This pattern keeps the privilege escalation fix (fan-by-default signup) fully intact while providing a secure way to create demo staff accounts outside the public signup flow, exactly as production systems should work.

**Alternative rejected approaches:**
- ❌ Hardcode credentials in source → public security vulnerability
- ❌ Auto-assign staff role on signup → privilege escalation bug (fixed in Step 6)
- ✅ Server-side admin script with Firebase Admin SDK → secure, auditable, no secrets in code
