# StadiumPulse AI 🏟️

**A GenAI-Enabled Solution for FIFA World Cup 2026**

StadiumPulse AI is a next-generation smart stadium platform powered by **Google Gemini 3.5 Flash**. This application leverages Generative AI to enhance **navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, and real-time decision support** for fans, organizers, volunteers, and venue staff during the FIFA World Cup 2026.

Developed with a modular full-stack architecture and zero-trust security paradigm, StadiumPulse AI delivers real-time assistance to fans while providing stadium operations staff with AI-powered incident management, tactical intelligence, and instant multilingual communications.

---

## 🗺️ Architectural Topology

StadiumPulse AI is structured around a highly optimized full-stack design consisting of a **React/Vite Single-Page Web Client** and an **Enterprise Express API Proxy Gateway**, fully containerized inside Docker.

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
│  │   - /api/chat             - /api/decision-support│  │
│  │   - /api/classify-item    - /api/broadcast       │  │
│  └──────┬─────────────────────────────────────┬─────┘  │
│         │                                     │        │
│         ▼                                     ▼        │
│  ┌──────────────┐                       ┌───────────┐  │
│  │ Security Guard│                       │ Query     │  │
│  │  - XSS Strip │                       │ Cache     │  │
│  │  - PromptInj │                       │ (TTL)     │  │
│  └──────┬───────┘                       └─────┬─────┘  │
└─────────┼─────────────────────────────────────┼────────┘
          │ Outbound SSL                        │ Outbound SSL
          ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│ Google Gemini    │                  │ Client Storage / │
│ 3.5 Flash LLM    │                  │ Persistent DB    │
└──────────────────┘                  └──────────────────┘
```

---

## 🚀 Key Features

### 📣 Public Fan View
1. **Multilingual Assistance (AI Concierge Chat)**: Conversational companion powered by server-side Gemini 3.5. Automatically detects language and replies instantly in English, Spanish, French, Arabic, Hindi, or Portuguese.
2. **Accessibility (Voice Mode & High Contrast)**: One-touch Speech-to-Text inputs and automatic Text-to-Speech vocal output for eyes-free navigation. Deep high-contrast theme, larger type layouts, full keyboard focus styling, and comprehensive screen-reader friendly landmarks with ARIA live regions.
3. **Navigation (Interactive Wayfinding Map)**: Responsive vector SVG diagram of sections A-Z detailing nearest gates, restrooms, and accessible ADA entry points. AI-powered routing recommendations to guide fans efficiently.
4. **Crowd Management (Live Crowd Status Grid)**: Real-time traffic reports pulled from Firestore, integrated with debounced Gemini routing recommendations to bypass stadium congestion.
5. **Transportation (Transit Advisor)**: Custom transit recommendations using real-time Firestore ETAs and parking metrics tailored to the fan's stated location.
6. **Sustainability (EcoCup Helper)**: Mobile camera or photo scanner using Gemini Vision AI to classify stadium waste as recyclable/compostable/landfill, rewarding fans with EcoCup sustainability points stored in Firestore.
7. **Tournament Hub**: Live match schedules, group standings, player statistics, and knockout bracket visualization.

### 💼 Staff Operations Hub (Secure)
1. **Real-Time Decision Support (AI Tactical Console)**: Evaluate active stadium challenges using Gemini's advanced reasoning to generate and rank tactical response maneuvers with detailed operational guidance.
2. **Operational Intelligence (Incident Command Logger)**: Log medical/security incidents to Firestore. Gemini automatically analyzes incident notes and generates structured tactical advice with AI-assigned priority levels (low/medium/high/critical).
3. **Operational Intelligence (Live Analytics Dashboard)**: Real-time SVG charts tracking incident workloads, response times, and queue metrics by classification type.
4. **Crowd Management (Real-time Control Panel)**: Operational controls allowing instant crowd density updates and transportation status changes which reflect on fan screens in real-time via Firestore synchronization.
5. **Multilingual Assistance (Broadcast Terminal)**: Enter urgent announcements in English and translate them instantly into all 6 tournament languages using Gemini, immediately syncing translations to public fan feeds.
6. **Firebase Authentication & Role-Based Access**: Enforced email/password sign-in with server-side role verification ensuring only authorized staff (`role: 'staff'`) can access operational controls.

---

## 🛡️ Enterprise Security Guardrails

StadiumPulse AI implements a multi-layered security ecosystem:
- **Zero Client-Side Secrets**: All Google Gemini API connections are proxied server-side; API tokens are never exposed to the client browser.
- **XSS Mitigation Shield**: User request values are processed using rigorous regular-expression parsing to strip cross-site script tags, inline handlers, and executable pseudo-protocols.
- **Prompt Injection Defender**: Input feeds undergo safety scanning to catch and reject malicious system override, bypass, or jailbreak phrases.
- **Advanced Rate Limiting**: All API gateway routes enforce sliding-window IP limits to mitigate spamming and DoS attempts.

---

## 🧪 Comprehensive Vitest Suite

Our automated testing suite guarantees functional stability and type safety, executing 21 core unit and integration tests under 300ms.

### Test Coverage Highlights:
- **XSS Stripping**: Confirms executable tags are properly isolated and stripped.
- **Prompt Injection Defense**: Validates that malicious system bypass inputs are caught and blocked.
- **Language Detection & Mock Translation**: Asserts correct multilingual detection and responses.
- **Security Access Rule Simulation**: Ensures private data blocks unauthorized reads.
- **Scoring and Density Mappers**: Verifies mathematical integrity of data calculations.

To execute the test suite, run:
```bash
npm run test
```

---

## 🛠️ Technology Stack & Build Pipelines

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, Google Gemini 3.5 Flash API
- **Database**: Firebase Firestore (real-time synchronization)
- **Testing**: Vitest (52 tests, 100% pass rate)
- **Containers**: Docker, Multi-stage compilation
- **Deployment**: Render.com with automatic GitHub Actions CI/CD

---

## 📚 Documentation

Comprehensive technical documentation is available in the [`docs/`](./docs) directory:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design, module boundaries, data flow diagrams
- **[API_GUIDE.md](./docs/API_GUIDE.md)** - REST API endpoints, request/response formats, authentication
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment instructions for Render.com and Docker
- **[FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)** - Firebase project setup guide for local development
- **[GEMINI_MODEL_VERIFICATION.md](./docs/GEMINI_MODEL_VERIFICATION.md)** - Gemini API integration and model selection
- **[SECURITY_GUIDE.md](./docs/SECURITY_GUIDE.md)** - Security architecture, CORS, CSRF, rate limiting
- **[Challenge-4-PS.txt](./docs/Challenge-4-PS.txt)** - Original hackathon problem statement

See [docs/README.md](./docs/README.md) for the complete documentation index.

---

## 🏗️ Code Quality & Modular Architecture

StadiumPulse AI follows enterprise-grade modular architecture principles:

### Frontend Component Structure
- **TournamentHub**: Data extracted to `src/components/tournament/TournamentData.ts` (426 lines of static data, interfaces, and constants) and split into reusable sub-tabs under `src/components/tournament/tabs/`.
- **FanView**: Split into 6 single-responsibility panel components under `src/components/fan/` with **100% clean ESLint / TypeScript linting** and strict type annotations:
  - `WayfindingPanel.tsx` (70 lines) - MapSVG integration + section selection
  - `CrowdStatusPanel.tsx` (111 lines) - Live crowd zones + AI routing
  - `SustainabilityPanel.tsx` (116 lines) - EcoCup Gemini Vision classifier (strongly typed results structure)
  - `ChatConcierge.tsx` (148 lines) - Multilingual chat with **preserved `aria-live="polite"` and `role="log"` for screen reader accessibility**
  - `TransportPanel.tsx` (109 lines) - Shuttle feeds + transit advisor (fully typed event adapters)
  - `HeroBanner.tsx` (129 lines) - Rotating World Cup slideshow and dynamic score trackers
- **OpsDashboard**: Split into 7 modular components under `src/components/ops/` with wrapped promises and custom Type definitions:
  - `OpsDashboard.tsx` (457 lines) - Orchestration root with role authentication and synchronized telemetry
  - `AuthPanel.tsx` (140 lines) - Login/signup UI with **`role: 'fan'` default for privilege-escalation protection**
  - `IncidentLogger.tsx` (176 lines) - Incident form + active feed (using strongly typed event change parameters)
  - `AnalyticsDashboard.tsx` (100 lines) - SVG charts + metrics
  - `RealTimeControls.tsx` (80 lines) - Crowd/transport toggles
  - `DecisionSupportPanel.tsx` (86 lines) - AI tactical analysis (robust type-checking for recommendation lists)
  - `BroadcastTerminal.tsx` (86 lines) - Multilingual announcements (explicit dictionary type definitions)

### Backend Modular Server Structure
Refactored from monolithic `server.ts` (650+ lines) into organized modules under `src/server/`:
- **Middleware**: `cors.ts`, `csrf.ts`, `security.ts`, `rateLimit.ts`, `rbac.ts`, `logger.ts` (6 files)
- **Routes**: `chat.ts`, `classify.ts`, `decisionSupport.ts`, `broadcast.ts`, `csrf.ts`, `health.ts` (6 files)
- **Services**: `gemini.ts`, `cache.ts`, `security.ts` (3 files)

All modular refactoring maintains 100% test coverage (55/55 tests passing, including new tournament-utils and safety validations) and zero-warning build stability.

---

## 📚 Repository Guides & Documentation

To learn more about the specifics of StadiumPulse AI, refer to our detailed developer manuals:

1. **[Architecture Design](./docs/ARCHITECTURE.md)**: Component topology and detailed data workflows.
2. **[API Reference Gateway](./docs/API_GUIDE.md)**: Core request and response JSON schemas.
3. **[Security Operations](./docs/SECURITY_GUIDE.md)**: Prompt safety parameters and XSS protection details.
4. **[Cloud Run Deployment Guide](./docs/DEPLOYMENT.md)**: Building and launching containers into production environments.

---

## 🎯 Problem Statement Alignment

StadiumPulse AI directly addresses the **Smart Stadiums & Tournament Operations** challenge by delivering a comprehensive GenAI-enabled solution for FIFA World Cup 2026. Here's how each requirement is implemented:

| Challenge Requirement | StadiumPulse AI Implementation | Feature Location |
|----------------------|-------------------------------|-----------------|
| **GenAI-Enabled Solution** | Powered by Google Gemini 3.5 Flash LLM throughout entire platform | All endpoints (chat, classify, decision-support, broadcast) |
| **Stadium Operations** | Staff Operations Hub with real-time tactical controls | Ops Dashboard → Real-Time Crowd & Transport Feeds |
| **Tournament Experience for Fans** | Multilingual AI Concierge, Interactive Wayfinding Map, EcoCup Sustainability Tracker | Fan View → All 7 features |
| **Organizers/Venue Staff** | Firebase role-based authentication with `role: 'staff'`, Incident Command Logger, Analytics Dashboard | Ops Dashboard → Authentication + Incident Logger + Analytics |
| **Volunteers** | Same staff authentication system can be extended with `role: 'volunteer'` (currently supports 'staff' and 'fan' roles) | `src/lib/firebase.ts` → `setUserRole()` and `getUserRole()` |
| **Generative AI** | Google Gemini 3.5 Flash model for chat, vision classification, decision support, and multilingual broadcast | `src/server/routes/` → chat.ts, classify.ts, decisionSupport.ts, broadcast.ts |
| **Navigation/Wayfinding** | Interactive SVG stadium map with 26 sections (A-Z), nearest gates, restrooms, and ADA entries | Fan View → Interactive Wayfinding Map (MapSVG component) |
| **Crowd Management** | Live crowd density heatmap with 15s auto-refresh, AI congestion routing recommendations | Fan View → Live Crowd Status Grid + Ops Dashboard → Real-Time Controls |
| **Accessibility** | High-contrast mode, aria-live chat announcements, keyboard navigation, voice input/output | Fan View → One-Touch Accessibility + MapSVG → Full keyboard + screen reader support |
| **Transportation** | Real-time shuttle ETAs from Firestore, AI-powered transit routing based on stated location | Fan View → Transit Advisor + Ops Dashboard → Transportation Status Control |
| **Sustainability** | Gemini Vision waste classification (recyclable/compostable/landfill), EcoCup points system | Fan View → EcoCup Sustainability Helper |
| **Multilingual Assistance** | Auto-detects and replies in 6 languages: English, Spanish, French, Arabic, Hindi, Portuguese | Fan View → Multilingual AI Concierge Chat + Ops Dashboard → Multilingual Broadcast Terminal |
| **Operational Intelligence** | Incident Command Logger with Gemini-generated tactical advice, priority levels, SVG analytics charts | Ops Dashboard → Incident Command Logger + Live Analytics Dashboard |
| **Real-Time Decision Support** | AI Tactical Decision Support Console ranks maneuvers for active stadium challenges | Ops Dashboard → AI Tactical Decision Support Console |
| **FIFA World Cup 2026** | Designed for all 16 host stadiums across USA, Canada, and Mexico with 48-team tournament data | TournamentHub component → 12 groups, 104 matches, 48 teams with country flags |

**Note on Transportation**: The Transit Advisor feature provides AI-powered routing recommendations based on user's stated location and real-time Firestore shuttle/parking data. While not a full turn-by-turn navigation system, it delivers contextual transportation guidance as specified in the challenge requirements.

**Volunteer Access**: The authentication system architecture supports volunteer roles via the `setUserRole()` function. To enable volunteer accounts, staff admins can assign `role: 'volunteer'` in Firestore user documents. The RBAC middleware in `src/server/middleware/rbac.ts` can be extended to grant volunteers read-only access to operational dashboards.
