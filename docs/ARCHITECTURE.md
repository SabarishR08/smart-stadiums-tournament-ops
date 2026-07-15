# System Architecture Design 🏟️

This document describes the high-level system architecture, component topologies, and data flows for the **StadiumPulse AI** Smart Stadium Companion developed for the FIFA World Cup 2026.

---

## 🗺️ Architectural Topology

StadiumPulse AI utilizes a high-efficiency full-stack layout consisting of a **React/Vite single-page web client** and a **Node.js/Express application proxy server**, containerized in Docker and ready to deploy in cloud ingress environments like Google Cloud Run.

```
┌────────────────────────────────────────────────────────┐
│                   Fan / Ops Browser                    │
│                                                        │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │     Fan View UI       │   │  Ops Dashboard UI    │  │
│  └───────────┬───────────┘   └───────────┬──────────┘  │
└──────────────┼───────────────────────────┼─────────────┘
               │                           │
               │ HTTPS Requests / JSON      │
               ▼                           ▼
┌────────────────────────────────────────────────────────┐
│             Enterprise Express Proxy Server            │
│                                                        │
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
          │                                     │
          │ Secure Outbound SSL                 │
          ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│ Google Gemini    │                  │ Client Storage / │
│ 3.5 Flash LLM    │                  │ Persistent DB    │
└──────────────────┘                  └──────────────────┘
```

---

## 📦 Key Component Subsystems

### 1. Unified Client Interface
- **Fan View**: Provides a screen-optimized multilingual concierge, real-time crowd-aware transport feeds, wayfinding guidance, and smart vision trash classifiers.
- **Operations Dashboard**: Contains a live stadium heat map, active operations incident queue, security dispatching console, and multi-language broadcast translators.

### 2. Express Backend Gateways
- **Multilingual Concierge Service (`/api/chat`)**: Multi-turn dialog system with language autodetection. Safe cache matching avoids duplicate Gemini workloads.
- **Incident Support System (`/api/decision-support`)**: Takes operational scenarios and maps tactical recommendations on command logs.
- **Broadcast Translation Hub (`/api/broadcast`)**: Takes single announcements and broadcasts them instantly across 5 World Cup regional languages.

### 3. Safety and Security Shields
- **XSS Stripping**: Intercepts request payloads and strips scripts or malicious elements before storing or passing them to the model.
- **Jailbreak Filter**: Implements strict guardrail pattern recognition that catches and blocks prompt-injection sequences (e.g. override, bypass guidelines).
