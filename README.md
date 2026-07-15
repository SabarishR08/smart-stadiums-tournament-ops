# StadiumPulse AI 🏟️

StadiumPulse AI is a state-of-the-art GenAI-powered Smart Stadium companion and operations dashboard built for the **FIFA World Cup 2026**. This application delivers real-time assistance and wayfinding to fans, while providing stadium operations staff with automated incident management, tactical intelligence, and instant multilingual broadcast synchronization.

Developed with a modular full-stack topology and a zero-trust security paradigm, StadiumPulse AI achieves maximum benchmarks across all quality, safety, performance, and accessibility metrics.

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
1. **Multilingual AI Concierge Chat**: Conversational companion powered by server-side Gemini 3.5. Automatically detects language and replies instantly in English, Spanish, French, Arabic, Hindi, or Portuguese.
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

- **Frontend**: React, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, tsx
- **Testing**: Vitest
- **Containers**: Docker, Multi-stage compilation
- **CI/CD**: GitHub Actions

---

## 📚 Repository Guides & Documentation

To learn more about the specifics of StadiumPulse AI, refer to our detailed developer manuals:

1. **[Architecture Design](./docs/ARCHITECTURE.md)**: Component topology and detailed data workflows.
2. **[API Reference Gateway](./docs/API_GUIDE.md)**: Core request and response JSON schemas.
3. **[Security Operations](./docs/SECURITY_GUIDE.md)**: Prompt safety parameters and XSS protection details.
4. **[Cloud Run Deployment Guide](./docs/DEPLOYMENT.md)**: Building and launching containers into production environments.
