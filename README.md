# Smart Stadiums Tournament Ops

![License](https://img.shields.io/badge/license-MIT-green) ![Language](https://img.shields.io/badge/language-TypeScript-informational) ![Docker](https://img.shields.io/badge/docker-ready-2496ed) ![Deploy](https://img.shields.io/badge/deploy-Render-46e3b7)


## 📌 Overview

StadiumPulse AI — GenAI-enabled smart stadiums and tournament operations solution for FIFA World Cup 2026 (Challenge 4)

## 🏗️ Architecture

```text
Vite, React   (frontend)
     │   REST / WebSocket
     ▼
Express   (API server)
     │
     ├──▶ Database — Firestore (Google)
     └──▶ External services — Google Gemini
```

## 🧰 Tech Stack

- **Language:** TypeScript
- **Backend:** Express
- **Frontend:** Vite, React
- **Database:** Firestore (Google)
- **Integrations:** Google Gemini
- **Deployment:** Docker container / Render (render.yaml)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker (optional, for container runs)

### 1. Clone

```bash
git clone https://github.com/SabarishR08/smart-stadiums-tournament-ops.git
cd smart-stadiums-tournament-ops
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env   # then fill in values
```

Environment variables used: `GEMINI_API_KEY`, `APP_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_FIRESTORE_DATABASE_ID`.

External services involved: Google Gemini.

### 4. Run

```bash
npm run dev
```

### (Alternative) Run with Docker

```bash
docker build -t smart-stadiums-tournament-ops .
docker run -p 5000:5000 smart-stadiums-tournament-ops
```

## ☁️ Deployment

Defined in `render.yaml` (web service `stadiumpulse-ai`) with `autoDeploy` enabled — pushes to the default branch trigger a Render deploy.


---

**A GenAI-Enabled Solution for Smart Stadiums & Tournament Operations — FIFA World Cup 2026**

> **Challenge 4 — Smart Stadiums & Tournament Operations**
>
> Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff. The solution must leverage Generative AI to improve **navigation**, **crowd management**, **accessibility**, **transportation**, **sustainability**, **multilingual assistance**, **operational intelligence**, or **real-time decision support** during the FIFA World Cup 2026.

---

## 1. Chosen Verticals & Persona

**Verticals addressed:** All 8 PS-specified verticals — **navigation**, **crowd management**, **accessibility**, **transportation**, **sustainability**, **multilingual assistance**, **operational intelligence**, and **real-time decision support**.

**Personas served:**
- **Fans** — Multilingual AI concierge, interactive wayfinding, real-time crowd guidance, accessible transit advisor, and a Gemini Vision sustainability classifier.
- **Organizers & Venue Staff** — Secure Operations Hub with Firebase role-based authentication (`role: 'staff'`), live incident command logger, AI decision support console, and multilingual broadcast terminal.
- **Volunteers** — The RBAC architecture supports `role: 'volunteer'` extension via `setUserRole()` for read-only operational dashboard access.

**Product:** *StadiumPulse AI* — a comprehensive full-stack smart stadium companion that delivers **context-aware, real-time decision support** and **operational intelligence** to every stakeholder at a FIFA World Cup 2026 venue. Every AI response is shaped by the user's live context: their location, crowd conditions, language, transport status, and operational role.

---

## 2. Approach & Logic — Context-Driven Decision Making

The core design principle is **Generative AI grounded in live contextual data**:

```
User Context (language + location + crowd data + role) 
  → Security Layer (XSS strip + prompt-injection guard)
  → Gemini 3.5 Flash (context-aware reasoning)
  → Structured JSON response
  → Real-time Firestore sync
  → Fan / Staff UI
```

**How logical decision making based on user context works:**

| Context Signal | Decision Made by AI |
|---|---|
| Fan's stated location + live transit ETAs | Personalized routing suggestion via Transit Advisor |
| Live crowd density per gate (Firestore) | AI debounces recommendations; suggests least-congested gate |
| Uploaded waste image (Gemini Vision) | Classifies item as recyclable/compostable/landfill and awards EcoCup points |
| Incident type + zone + severity (Ops staff) | Gemini generates a prioritized tactical action with `low/medium/high/critical` tag |
| English broadcast text | Gemini translates into all 6 tournament languages; syncs to fan feeds via Firestore |
| User message language (auto-detected) | Concierge replies in exact same language (EN/ES/FR/AR/HI/PT) |

**Fallback Strategy:** When the Gemini API is unavailable (quota/network), smart offline fallbacks activate — context-aware keyword routing (language detection, crowd patterns, transit logic) — so the app **always provides a useful response**.

---

## 3. How It Works — Setup & Run

### Prerequisites
- Node.js 20+, npm
- A [Google AI Studio](https://aistudio.google.com/) API key (optional — app runs in offline fallback mode without it)
- A Firebase project (optional — app seeds demo data automatically)

### Local Development

```bash
# Clone and install
git clone https://github.com/SabarishR08/smart-stadiums-tournament-ops.git
cd smart-stadiums-tournament-ops
npm install

# Configure environment (copy and fill values)
cp .env.example .env

# Run development server (frontend + backend together)
npm run dev
# → Open http://localhost:5173
```

### Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `GEMINI_API_KEY` | Enables live Gemini 3.5 Flash. **Absent → smart offline fallback** | *(unset)* |
| `VITE_FIREBASE_API_KEY` | Firebase project credentials | bundled demo project |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `agentflow-prod-assistant` |
| `VITE_FIRESTORE_DATABASE_ID` | Firestore database ID | `(default)` |
| `PORT` | Server port | `10000` |

> 🔐 The app runs fully without any API key — if `GEMINI_API_KEY` is unset, it uses a deterministic offline fallback that covers all 8 PS verticals. No crashes, no blank responses.

### Production Build & Docker

```bash
# Production build
npm run build

# Run production server
npm start

# Docker (for Google Cloud Run / Render.com)
docker build -t stadiumpulse-ai .
docker run -p 10000:10000 stadiumpulse-ai
```

---

## 4. GenAI Integration — Navigation, Crowd Management, Accessibility, Transportation, Sustainability, Multilingual Assistance, Operational Intelligence, Real-Time Decision Support

StadiumPulse AI uses **Google Gemini 3.5 Flash** across all 8 problem-statement verticals via four server-side API endpoints. The API key is **never exposed to the browser** — all Gemini calls are proxied through the Express backend.

### Navigation
- `WayfindingPanel.tsx` + `MapSVG.tsx`: Interactive SVG stadium map with 26 sections (A–Z), nearest gates, accessible ADA entries, and restroom locators. Section selection triggers AI-powered routing context for the Concierge.
- `src/server/routes/chat.ts` → `/api/chat`: Fan asks "how do I get to Section G?" — Gemini replies with step-by-step navigation guidance in the fan's language.

### Crowd Management
- `CrowdStatusPanel.tsx`: Real-time crowd density heatmap from Firestore, auto-refreshing every 15 seconds. Live density levels (`low/medium/high`) per gate zone.
- `RealTimeControls.tsx` (Ops): Staff toggle crowd densities which reflect on fan screens in real-time via Firestore.
- Gemini analyses crowd data and generates a single-sentence routing recommendation: *"Gate B is congested — try Gate C for the fastest entry."*

### Accessibility
- One-touch **Speech-to-Text** input and automatic **Text-to-Speech** vocal output — eyes-free navigation for visually impaired fans.
- **High-contrast WCAG 2.1 AA mode**: Yellow-on-black palette, large font sizes, visible focus rings, skip-to-content link.
- `ChatConcierge.tsx`: `role="log"` + `aria-live="polite"` for screen-reader-compatible chat announcements.
- `MapSVG.tsx`: Full keyboard navigation, ARIA labels on every interactive SVG section.
- WCAG semantic HTML5: `<nav role="navigation">`, `<main>`, `<footer>`, skip links, landmark regions.

### Transportation
- `TransportPanel.tsx`: Real-time shuttle ETAs and parking availability pulled from Firestore.
- Transit Advisor: Fan enters their current location → Gemini analyses live transport status and recommends the optimal route, arrival timing, and parking availability.

### Sustainability
- `SustainabilityPanel.tsx` + `/api/classify-item` (Gemini Vision): Fan photographs a waste item → Gemini Vision classifies it as **recyclable/compostable/landfill** → correct bin is specified → EcoCup sustainability points saved to Firestore.
- Encourages eco-positive fan behaviour at all 16 FIFA WC 2026 host stadiums.

### Multilingual Assistance
- Auto-detects user message language and replies in the **exact same language**: English, Spanish, French, Arabic, Hindi, Portuguese.
- `BroadcastTerminal.tsx` + `/api/broadcast`: Staff compose an English announcement → Gemini translates instantly into all 6 tournament languages → synced to fan feeds via Firestore.

### Operational Intelligence
- `IncidentLogger.tsx` + `/api/chat`: Staff log incidents (medical/security/facility/crowd). Gemini analyses notes and generates a **structured tactical action with AI-assigned priority** (`low/medium/high/critical`).
- `AnalyticsDashboard.tsx`: Real-time SVG charts showing incident counts, severity distribution, and response queue metrics.

### Real-Time Decision Support
- `DecisionSupportPanel.tsx` + `/api/decision-support`: Staff describe an active stadium challenge → Gemini generates **2–3 ranked tactical maneuvers** with concrete action titles and reasoned justifications.
- Protected by `checkStaffRole` RBAC middleware — only authenticated staff can access.

---

## 5. Architecture

StadiumPulse AI uses a **React 19 / Vite SPA** frontend and a **Node.js / Express API proxy** backend, containerized in Docker.

```
┌────────────────────────────────────────────────────────┐
│                   Fan / Ops Browser                    │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │     Fan View UI       │   │  Ops Dashboard UI    │  │
│  └───────────┬───────────┘   └───────────┬──────────┘  │
└──────────────┼───────────────────────────┼─────────────┘
               │                           │ HTTPS / JSON
               ▼                           ▼
┌────────────────────────────────────────────────────────┐
│             Enterprise Express Proxy Server            │
│  ┌──────────────────────────────────────────────────┐  │
│  │                API Gateway Layer                 │  │
│  │   /api/chat       /api/decision-support          │  │
│  │   /api/classify-item   /api/broadcast            │  │
│  └──────┬─────────────────────────────────────┬─────┘  │
│         │                                     │        │
│         ▼                                     ▼        │
│  ┌──────────────┐                       ┌───────────┐  │
│  │ Security Guard│                       │ TTL Cache │  │
│  │  XSS Strip   │                       │           │  │
│  │  PromptInj   │                       │           │  │
│  └──────┬───────┘                       └─────┬─────┘  │
└─────────┼─────────────────────────────────────┼────────┘
          │ Outbound SSL                        │
          ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│ Google Gemini    │                  │ Firebase Firestore│
│ 3.5 Flash LLM    │                  │ Real-time DB     │
└──────────────────┘                  └──────────────────┘
```

### Frontend Component Structure
- **FanView** → 6 single-responsibility panels under `src/components/fan/`:
  - `WayfindingPanel.tsx` — Navigation: SVG map + section selection
  - `CrowdStatusPanel.tsx` — Crowd Management: live zones + AI routing
  - `SustainabilityPanel.tsx` — Sustainability: Gemini Vision classifier
  - `ChatConcierge.tsx` — Multilingual Assistance: `aria-live` chat
  - `TransportPanel.tsx` — Transportation: shuttle ETAs + transit advisor
  - `HeroBanner.tsx` — Tournament context + World Cup hub launcher

- **OpsDashboard** → 7 modular components under `src/components/ops/`:
  - `OpsDashboard.tsx` — Orchestration root with Firestore subscriptions
  - `AuthPanel.tsx` — Firebase auth with `role: 'fan'` default (privilege-escalation protection)
  - `IncidentLogger.tsx` — Operational Intelligence: incident form + AI advice
  - `AnalyticsDashboard.tsx` — Operational Intelligence: SVG charts
  - `RealTimeControls.tsx` — Crowd Management: ops crowd/transport toggles
  - `DecisionSupportPanel.tsx` — Real-Time Decision Support: ranked tactical recommendations
  - `BroadcastTerminal.tsx` — Multilingual Assistance: 6-language broadcast

### Backend Modular Server
Refactored from a monolithic server into organized modules under `src/server/`:
- **Middleware**: `cors.ts`, `csrf.ts`, `security.ts`, `rateLimit.ts`, `rbac.ts`, `logger.ts`
- **Routes**: `chat.ts`, `classify.ts`, `decisionSupport.ts`, `broadcast.ts`, `csrf.ts`, `health.ts`
- **Services**: `gemini.ts` (Gemini client + fallbacks), `cache.ts` (TTL cache), `security.ts` (XSS + injection)

---

## 6. Security

- **Zero Client-Side Secrets**: All Gemini API calls proxied server-side. Key never exposed to browser.
- **XSS Mitigation**: Regex-based tag stripping of `<script>`, inline handlers, and `javascript:` URIs before any LLM call.
- **Prompt Injection Defense**: Pattern scanning catches and blocks override/bypass/jailbreak phrases.
- **CSRF Protection**: Double-submit cookie token validated on all state-mutating routes.
- **Rate Limiting**: Sliding-window per-IP limits on all `/api/*` routes.
- **RBAC**: `checkStaffRole` middleware enforces staff role verification via Firebase Auth before any operational endpoint.
- **Input Validation**: All request bodies validated for type, length, and content before processing.

See [`docs/SECURITY_GUIDE.md`](./docs/SECURITY_GUIDE.md) for full details.

---

## 7. Testing

```bash
npm run test         # runs all 55 tests
npm run test:coverage  # with coverage report
```

**55 tests across 8 test files — all passing:**

| Test File | Coverage Area | Tests |
|---|---|---|
| `gemini.test.ts` | Gemini client, fallback generators, JSON repair, safe parse | 27 |
| `csrf.test.ts` | CSRF token generation, validation, header enforcement | 6 |
| `cache.test.ts` | TTL cache store/retrieve/expire/type safety | 5 |
| `rate-limit.test.ts` | Per-IP sliding-window rate limit enforcement | 4 |
| `density-mapping.test.ts` | Crowd density calculation accuracy | 4 |
| `sanitization.test.ts` | XSS stripping, prompt injection detection | 3 |
| `keyboard-nav.test.ts` | WCAG keyboard navigation accessibility | 3 |
| `tournament-utils.test.ts` | Match schedule and standings calculation | 3 |

All tests run offline — no API key or network required.

---

## 8. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Lucide Icons |
| Backend | Node.js, Express, Google Gemini 3.5 Flash (`@google/genai`) |
| Database | Firebase Firestore (real-time sync) |
| Auth | Firebase Authentication (email/password + RBAC) |
| Testing | Vitest (55 tests, 100% pass rate) |
| Linting | ESLint + TypeScript strict mode (0 warnings/errors) |
| Containers | Docker (multi-stage build) |
| Deployment | Render.com + GitHub Actions CI/CD |

---

## 9. Documentation

| Document | Description |
|---|---|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System design, component topology, data flows |
| [`docs/API_GUIDE.md`](./docs/API_GUIDE.md) | REST endpoints, request/response formats |
| [`docs/SECURITY_GUIDE.md`](./docs/SECURITY_GUIDE.md) | Security architecture, CORS, CSRF, rate limiting |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Render.com and Docker deployment guide |
| [`docs/FIREBASE_SETUP.md`](./docs/FIREBASE_SETUP.md) | Firebase project setup for local development |
| [`docs/GEMINI_MODEL_VERIFICATION.md`](./docs/GEMINI_MODEL_VERIFICATION.md) | Gemini model selection and verification |

---

## 10. Evaluation Criteria Map

| Criterion | How StadiumPulse AI satisfies it |
|---|---|
| **Code Quality** | Modular architecture: 6 fan panels, 7 ops components, 3 server service layers; strict TypeScript (`tsc --noEmit` passes); ESLint with `recommendedTypeChecked` rules (0 errors); `prefer-const` enforced; each module has a single responsibility under 200 lines; all API response types explicitly cast. |
| **Security** | Zero client-side secrets; XSS regex stripping; prompt-injection pattern guard; CSRF double-submit tokens; per-IP sliding-window rate limiting; `checkStaffRole` RBAC middleware on operational endpoints; input length validation on all routes. |
| **Efficiency** | Server-side TTL response cache avoids duplicate Gemini calls for identical queries; Firestore subscriptions debounced; smart offline fallback avoids network calls when Gemini is unavailable; lazy Gemini client initialization. |
| **Testing** | 55 automated Vitest tests across 8 files covering Gemini service, CSRF, cache, rate limiting, crowd density math, XSS sanitization, keyboard accessibility, and tournament logic. All tests are offline (no API key needed). 100% pass rate. |
| **Accessibility** | WCAG 2.1 AA: skip-to-content link, `aria-live="polite"` on chat transcript, `role="log"`, full keyboard navigation on SVG map, high-contrast mode toggle, Screen Reader ARIA labels, semantic landmarks (`nav`, `main`, `footer`), voice input (Speech-to-Text) and voice output (Text-to-Speech). |
| **Problem Statement Alignment** | Covers all 8 PS verticals (navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, real-time decision support) for all 4 PS personas (fans, organizers, venue staff, volunteers). Powered by Google Gemini 3.5 Flash with **context-aware, real-time decision support** on every interaction. Designed for all 16 FIFA World Cup 2026 host stadiums across USA, Canada, and Mexico. |

---

## 11. Problem Statement Alignment — Vertical-by-Vertical

The problem statement requires GenAI to improve one or more of the following. StadiumPulse AI implements **all eight**:

### Navigation
Interactive SVG stadium map (`MapSVG.tsx`) with 26 sections (A–Z), showing nearest gates, restrooms, and ADA-accessible entry points. Fans click any section to get context-specific wayfinding info. The AI Concierge (`/api/chat`) answers natural language navigation questions in the fan's detected language.

### Crowd Management
Live crowd heatmap (`CrowdStatusPanel.tsx`) reads from Firestore every 15 seconds. Gemini analyses current gate densities and generates a routing recommendation. Staff can update crowd densities via `RealTimeControls.tsx`, which reflects in real-time on fan screens.

### Accessibility
Full WCAG 2.1 AA implementation: one-touch Speech-to-Text input, Text-to-Speech output, high-contrast mode, keyboard-navigable SVG map, `aria-live` chat region, skip link, and semantic landmarks. The concierge answers accessibility questions ("Where is the nearest wheelchair-accessible gate?") in the fan's language.

### Transportation
`TransportPanel.tsx` shows real-time shuttle ETAs and parking capacity from Firestore. Fans input their current location and Gemini generates a context-aware transit routing recommendation using the live transport status data.

### Sustainability
`SustainabilityPanel.tsx` uses Gemini Vision (`/api/classify-item`) to classify photographed stadium waste items as recyclable, compostable, or landfill. Fans earn EcoCup points, stored in Firestore, rewarding eco-positive stadium behaviour.

### Multilingual Assistance
The AI Concierge auto-detects and replies in **6 languages: English, Spanish, French, Arabic, Hindi, Portuguese**. The Broadcast Terminal (`/api/broadcast`) translates operational announcements into all 6 languages instantly, with Firestore sync to all fan-facing displays.

### Operational Intelligence
The Incident Command Logger (`IncidentLogger.tsx` + `/api/chat`) allows staff to log incidents and receive Gemini-generated tactical advice with AI-assigned priority classification (`low/medium/high/critical`). The Analytics Dashboard (`AnalyticsDashboard.tsx`) shows real-time operational KPIs via SVG charts.

### Real-Time Decision Support
The AI Tactical Decision Support Console (`DecisionSupportPanel.tsx` + `/api/decision-support`) enables staff to describe any active stadium situation and receive **2–3 ranked tactical maneuvers** with actionable justifications — powered by Gemini's advanced reasoning, protected by role-based access control.

---

---

## 📄 License

[MIT](LICENSE) — © 2026 Sabarish R.
