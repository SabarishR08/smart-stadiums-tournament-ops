# Security Policy 🔐

We take the security and integrity of StadiumPulse AI very seriously. As a critical infrastructure companion built for the **FIFA World Cup 2026**, protecting user data, operational endpoints, and preventing malicious manipulations is our highest priority.

---

## 🛡️ Supported Versions

Only the active main release versions are supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

---

## 📢 Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** open a public GitHub issue. Instead, report it privately:

1. Send an email to: `stadium-security@fifa2026.example.com`.
2. Include a detailed description of the vulnerability, steps to reproduce, and any proof-of-concept (PoC) scripts or payloads.
3. Our team will acknowledge receipt of the report within **24 hours** and provide a timeline for resolution.
4. We coordinate a public disclosure once a patch has been developed and verified.

---

## 🔒 Enterprise Security Guidelines

StadiumPulse AI enforces robust architectural security:

### 1. Zero Trust Key Handling
- **NO Client-Side Secrets**: All calls to the Gemini API (`@google/genai`) and other analytical services are run exclusively in our secure server-side container (`server.ts`).
- **Input Filtering**: Every text field and uploaded item is strictly validated for length, structure, and characters.

### 2. Multi-Tier Security Protections
- **Prompt Injection Defense**: Inbound prompt inputs undergo thorough pattern scanning to block and filter jailbreak sequences (e.g., "ignore previous instructions", "system override").
- **Dynamic Rate Limiting**: Simple in-memory sliding window controls protect API routing paths against Denial of Service (DoS) and spamming.
- **Strict Firestore Security Rules**: Rules mapped inside `/firestore.rules` protect sensitive operations resources (such as incident logs) from anonymous public reading or editing.
