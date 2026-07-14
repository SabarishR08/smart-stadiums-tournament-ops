# StadiumPulse AI 🏟️

StadiumPulse AI is a state-of-the-art GenAI-powered Smart Stadium companion and operations dashboard built for the **FIFA World Cup 2026**. This application delivers real-time assistance and wayfinding to fans, while providing stadium operations staff with automated incident management, tactical intelligence, and instant multilingual broadcast synchronization.

---

## 🚀 Key Features

### 📣 Public Fan View
1. **Multilingual AI Concierge Chat**: Conversational companion powered by server-side Gemini 2.5. Automatically detects language and replies instantly in English, Spanish, French, Arabic, Hindi, or Portuguese.
2. **Accessible Voice Mode**: One-touch Speech-to-Text inputs and automatic Text-to-Speech vocal output for eyes-free navigation.
3. **Interactive Wayfinding Map**: Responsive vector SVG diagram of sections A-Z detailing nearest gates, restrooms, and accessible ADA entry points.
4. **Live Crowd Status Grid**: Real-time traffic reports pulled from Firestore, integrated with a debounced 15-second Gemini routing recommendation to bypass stadium congestion.
5. **Transit Advisor**: Custom transit recommendations using real-time Firestore ETAs and parking metrics tailored to the fan's stated location.
6. **EcoCup Sustainability Helper**: Mobile camera or photo scanner using Gemini Vision to classify stadium trash as recyclable/compostable/landfill, and rewards points stored directly to cloud Firestore.
7. **One-Touch Accessibility**: Deep high-contrast theme, larger type layouts, full keyboard focus styling, and comprehensive screen-reader friendly landmarks.

### 💼 Staff Operations Hub (Secure)
1. **Firebase Authentication Access**: Enforced email/password sign-in with server-side role checks verifying `role: 'staff'` in user collections.
2. **Real-time Tactical Overview**: Operational control panel allowing instant crowd density scaling and transportation updates which reflect on fan screens in real-time.
3. **Incident Command Logger**: Log medical/security incidents to Firestore. Gemini reads incident notes and automatically generates structured tactical advice and priority levels.
4. **AI Decision Support Console**: Evaluate active stadium challenges using advanced operations reasoning to rank tactical maneuvers.
5. **Multilingual Broadcast Terminal**: Enter urgent announcements in English and translate them instantly into all 6 languages, immediately syncing translations to public feeds.
6. **Live Analytics Dashboard**: Clean SVG charts tracking real-time queue workloads, average response milestones, and incident counts by classification.

---

## 🛠️ Google Services Used & Core Integration Story

### 🧠 Google Gemini API (via `@google/genai` SDK)
- **Use Case**: Language auto-detection, contextual concierge chats, multi-format vision classifications, tactical support reasoning, and professional announcements translation.
- **Security**: The Gemini API keys are retrieved and managed **server-side only** inside our Express container, keeping secrets completely hidden from standard browser requests.

### 🗄️ Google Cloud Firestore
- **Use Case**: Real-time crowd tracking, live transit updates, durable fan sustainability points, active incident tickets, and synced translations feeds.
- **Security**: Bound by strict `/firestore.rules` preventing unauthorized writes to public feeds and restricting private incidents tables exclusively to authenticated operations staff.

### 🔐 Firebase Authentication
- **Use Case**: Secure sign-in/up operations for authorized stadium stewards.

---

## 🧪 Comprehensive Vitest Suite

StadiumPulse AI contains an automated testing suite validating core functions across critical security, logic, and integration barriers.

### Test Categories Covered:
1. **Crowd-Density Mapping**: Verifies that low/medium/high congestion values resolve to matching responsive Tailwind colors and screen labels.
2. **Gemini Parsing & Extraction**: Confirms that raw generated markdown block text is safely formatted and parsed into JSON structures.
3. **Sustainability Scoring Rules**: Asserts that proper impact points (10/15/5) are awarded based on item materials classification.
4. **Firestore Security Access Simulation**: Verifies that anonymous fans can read public feeds, but only verified operations staff can query private incidents logs.
5. **Multilingual Integration Mock**: Tests that sending Spanish questions returns proper Spanish translations and language indicators.

### Running the Test Suite
Run the following terminal command:
```bash
npm run test
```

---

## 💻 Tech Stack & Setup

- **Frontend**: React, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, tsx
- **Build/Bundler**: Vite, esbuild (bundling TypeScript server into single CommonJS file for production scaling)
- **Database/Auth**: Firebase Web SDK, Firestore Rules
- **Testing**: Vitest

### Local Development Setup:
1. Clone the project or use the AI Studio workspace.
2. Copy `.env.example` to `.env` and fill in all values (see Environment Variables below).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Boot development mode (Express backend + Vite frontend, proxied automatically):
   ```bash
   npm run dev
   ```
5. Execute a production build:
   ```bash
   npm run build
   ```
6. Run the production build locally:
   ```bash
   npm start
   ```

---

## 🌍 Deployment

### Environment Variables

Copy `.env.example` to `.env` (local) or paste the values into your host's dashboard. All variables are required unless marked optional.

| Variable | Where to get it | Notes |
|---|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | Server-side only, never exposed to browser |
| `APP_URL` | Your deployed domain, e.g. `https://stadiumpulse.onrender.com` | Used to lock CORS in production |
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your Apps | Embedded in frontend bundle |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same as above | |
| `VITE_FIREBASE_PROJECT_ID` | Same as above | |
| `VITE_FIREBASE_STORAGE_BUCKET` | Same as above | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same as above | |
| `VITE_FIREBASE_APP_ID` | Same as above | |
| `VITE_FIREBASE_DATABASE_ID` | Firebase Console → Firestore | Optional — leave blank to use the `(default)` database |

> **Important:** All `VITE_*` variables are baked into the JS bundle at build time. They are intentionally public (Firebase client config is safe to expose). `GEMINI_API_KEY` must never be set as a `VITE_` variable.

---

### Deploy to Render (recommended)

Render runs the full Express + static-file server in one service, which matches the app's architecture exactly.

1. Push the repo to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com) → **New → Web Service**.
3. Connect your GitHub repo.
4. Render auto-detects `render.yaml` — review it and click **Apply**.
5. Go to **Environment** tab and add every secret variable from the table above.
   - Render automatically sets `APP_URL` from the service's public hostname via `render.yaml`.
6. Click **Deploy**. Build runs `npm install && npm run build`, start runs `npm start`.
7. Once live, open `https://<your-service>.onrender.com/api/health` — you should see `{"status":"ok","geminiConfigured":true}`.

> **Free tier note:** Render free services spin down after 15 minutes of inactivity. The first request after a spin-down takes ~30 seconds to cold-start. Upgrade to a paid plan to avoid this.

---

### Deploy to Vercel

Vercel is primarily a frontend platform, so the Express routes are wrapped in a serverless function via `api/index.js`.

> **Prerequisites:** Run `npm run build` locally or let Vercel run it. The file `dist/server.cjs` must exist before `api/index.js` can load it.

1. Push the repo to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) → Import your repo.
3. Framework Preset: **Other** (leave as-is — `vercel.json` handles the config).
4. Add all environment variables from the table above in **Settings → Environment Variables**.
   - Set `APP_URL` to `https://<your-project>.vercel.app`.
5. Click **Deploy**.
6. Verify: `https://<your-project>.vercel.app/api/health`

> **Limitation:** Vercel's serverless functions have a 10 s default timeout on the Hobby plan. Gemini Vision calls on large images can exceed this. Use the Pro plan or prefer Render for production workloads.

---

### Firestore Setup (both platforms)

Before the first deploy, make sure Firestore is ready:

1. In [Firebase Console](https://console.firebase.google.com), create a Firestore database (Start in **production mode**).
2. Deploy the security rules:
   ```bash
   # Install Firebase CLI if needed
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```
3. Enable **Email/Password** sign-in under Authentication → Sign-in method.
4. The app seeds initial crowd and transport data automatically on first load.

