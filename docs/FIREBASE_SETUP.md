# Firebase Project Setup Guide

Your StadiumPulse AI app has been migrated to use the new Firebase project:

**Project Name**: Carbon Foot Print  
**Project ID**: `agentflow-prod-assistant`  
**Project Number**: `1025941268003`

---

## ✅ Configuration Updated

All Firebase configuration has been updated in:
- ✅ `src/lib/firebase.ts` - Client SDK config
- ✅ `.env.example` - Environment template
- ✅ `.env - actual data - dont push.txt` - Your local env
- ✅ `scripts/seed-demo-staff.ts` - Admin SDK script

---

## 🔧 Required Setup Steps

### 1. Enable Firebase Authentication

1. Go to: https://console.firebase.google.com/project/agentflow-prod-assistant/authentication
2. Click **"Get Started"**
3. Enable **Email/Password** provider:
   - Click "Email/Password"
   - Toggle "Enable"
   - Save

### 2. Create Firestore Database

1. Go to: https://console.firebase.google.com/project/agentflow-prod-assistant/firestore
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add custom rules next)
4. Select a location (e.g., `us-central1`)
5. Click "Enable"

### 3. Deploy Firestore Security Rules

Copy the rules from `firestore.rules` in this repo:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Check if authenticated and has staff role
    function isStaff() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff';
    }

    // Users collection: staff can read/write their own, authenticated users can read their own
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if isStaff() || (request.auth != null && request.auth.uid == userId);
    }

    // Public read collections (anyone can read, only staff can write)
    match /crowd_status/{docId} {
      allow read: if true;
      allow write: if isStaff();
    }

    match /transportation/{docId} {
      allow read: if true;
      allow write: if isStaff();
    }

    match /broadcasts/{docId} {
      allow read: if true;
      allow write: if isStaff();
    }

    match /sustainability_scores/{docId} {
      allow read: if true;
      allow write: if request.auth != null; // Any authenticated user can log scores
    }

    // Staff-only collections
    match /incidents/{docId} {
      allow read, write: if isStaff();
    }
  }
}
```

**To deploy:**
1. Go to: https://console.firebase.google.com/project/agentflow-prod-assistant/firestore/rules
2. Paste the rules above
3. Click **"Publish"**

### 4. Initialize Firestore Collections (Optional but Recommended)

The app will auto-seed initial data when it first runs, but you can pre-create collections:

**Collections to create:**
- `crowd_status` - Stadium crowd density data
- `transportation` - Shuttle and parking status
- `incidents` - Operations incident logs
- `broadcasts` - Multilingual announcements
- `sustainability_scores` - EcoCup waste classification scores
- `users` - User profiles with roles

**Note**: The app's `seedInitialDataIfEmpty()` function will automatically populate `crowd_status` and `transportation` on first run if empty.

### 5. Create Demo Staff Account

Now you can run the seeder script:

```bash
# 1. Download service account key from Firebase Console
#    Settings > Service Accounts > Generate New Private Key
#    Save as: scripts/serviceAccountKey.json

# 2. Run the seeder
npm run seed-demo-staff

# 3. Save the output credentials (email + password)

# 4. Delete the service account key
rm scripts/serviceAccountKey.json
```

Full instructions: See `scripts/README.md`

---

## 📊 Firebase Free Tier Limits (Spark Plan)

Your new project is on the **Spark (free) plan**:

**Firestore:**
- 50,000 reads/day ✅
- 20,000 writes/day ✅
- 1 GB storage ✅
- More than enough for demos/hackathons

**Authentication:**
- Unlimited email/password auth ✅
- 10K phone auth/month

**Hosting:**
- 10 GB storage
- 360 MB/day bandwidth

---

## 🧪 Testing the Migration

After completing the setup steps above:

1. **Test Frontend**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000
   
2. **Test Fan View**:
   - Click "Fan View"
   - Try the AI Chat (requires Gemini API key)
   - Check crowd density map

3. **Test Ops Dashboard**:
   - Click "Ops Dashboard"
   - Try registering a new account (will be 'fan' role)
   - Login with demo staff account (after running seeder)
   - Verify you can access staff features

4. **Test Firestore Connection**:
   - Check browser console for any Firebase errors
   - Verify data loads from Firestore
   - Try updating crowd density (staff only)

---

## 🚨 Troubleshooting

### "Permission denied" errors in console

**Cause**: Firestore rules not deployed or incorrect

**Fix**:
1. Check Firestore rules are deployed (step 3 above)
2. Verify database ID is `(default)` (not a custom name)
3. Check user has proper `role` field in `users/{uid}` document

### "User not found" when logging in

**Cause**: Demo staff account not created yet

**Fix**:
1. Run `npm run seed-demo-staff` (see step 5 above)
2. Or create account via signup form (will be 'fan' role)
3. Manually promote to 'staff' in Firestore Console if needed

### "Quota exceeded" errors

**Cause**: Hit free tier limits on old project

**Fix**: Already done - migrated to new project! ✅

---

## 📝 Project Comparison

| Feature | Old Project | New Project |
|---------|-------------|-------------|
| **Project ID** | `gen-lang-client-0639363380` | `agentflow-prod-assistant` ✅ |
| **Project Name** | AI Studio Auto | Carbon Foot Print ✅ |
| **Database ID** | `ai-studio-605ea102...` | `(default)` ✅ |
| **Status** | Quota exceeded ❌ | Fresh, ready to use ✅ |

---

## ✅ Migration Checklist

Complete these in order:

- [ ] Enable Firebase Authentication (Email/Password)
- [ ] Create Firestore Database (production mode)
- [ ] Deploy Firestore Security Rules
- [ ] Download Service Account Key
- [ ] Run `npm run seed-demo-staff`
- [ ] Save demo credentials securely
- [ ] Delete service account key file
- [ ] Test login with demo account
- [ ] Test Fan View (AI chat, crowd map)
- [ ] Test Ops Dashboard (staff features)

---

**Once all steps complete, reply with "proceed with Part B"** to continue with:
- STEP 7: Code Quality (ESLint + Prettier)
- STEP 8: Security audit
- STEP 9: Testing & coverage
- STEP 10: Accessibility audit
- STEP 11: Problem statement alignment
- STEP 12: Frontend modularity (split large components)
