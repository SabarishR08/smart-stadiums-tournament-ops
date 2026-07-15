# Security Architecture & Operations Guide 🛡️

StadiumPulse AI is designed with an enterprise-grade security posture. As critical public utility software, securing communications and ensuring safety from malicious actors is our highest priority.

---

## 🔒 Implemented Security Protections

### 1. Zero Client-Side Secret exposure
All Gemini AI generation services are processed strictly server-side on our Express server (`server.ts`). Secret keys are kept safe in server environment variables and are never sent to the fan browser.

### 2. Prompt Injection Defense (LLM Safety)
Every user prompt passes through `hasPromptInjection` scanner, matching jailbreak and system override patterns before sending content to the Gemini API.
- **Blocked Actions**: Overrides, secret key disclosures, guidance bypasses, and system role play instructions are flagged and blocked immediately.
- **Response**: Triggers an alert block with code `400` returning a clean, secure error message.

### 3. Cross-Site Scripting (XSS) Mitigation
Every text query goes through `sanitizeInput` to strip dangerous elements (e.g. `<script>`, inline event handlers `onload`, pseudo-protocols `javascript:`). This ensures that visual displays are fully safe from malicious code injection.

### 4. Direct Ingress Rate Limiting
Simple sliding-window state prevents server abuse and DoS attempts:
- **Rule**: Max 100 requests per 15 minutes per IP.
- **Scope**: Applied automatically to all active endpoints on server start.

### 5. Access Control (Firestore Rules)
Our `/firestore.rules` file restricts unauthorized read/write access. Public clients can write new feedback/logs but cannot read others' entries, preventing data leaks.
