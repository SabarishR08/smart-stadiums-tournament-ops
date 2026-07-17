# Security Architecture & Operations Guide 🛡️

StadiumPulse AI is designed with an enterprise-grade security posture. As critical public utility software, securing communications and ensuring safety from malicious actors is our highest priority.

---

## 🔒 Implemented Security Protections

### 1. Dynamic CSRF Token Protection (Double-Submit Pattern)
**Implementation**: `src/server/middleware/csrf.ts`

Every POST request requires a dynamically generated CSRF token to prevent cross-site request forgery attacks:
- **Token Generation**: Server generates a random 32-byte hex token at startup using `crypto.randomBytes(32)`
- **Token Distribution**: Clients fetch the token from `/api/csrf-token` endpoint on mount
- **Validation**: All POST requests must include the token in `X-CSRF-Token` header
- **Response**: Invalid or missing tokens return HTTP 403 with error message
- **Scope**: Applied to all routes via Express middleware stack

This replaces the previous static token implementation and provides cryptographically secure per-server-instance protection.

### 2. Zero Client-Side Secret Exposure
All Gemini AI generation services are processed strictly server-side via Express routes in `src/server/routes/`. Secret keys (GEMINI_API_KEY) are kept safe in server environment variables and are never sent to the client browser.

### 3. Prompt Injection Defense (LLM Safety)
**Implementation**: `src/server/services/security.ts`

Every user prompt passes through `hasPromptInjection` scanner before reaching the Gemini API:
- **Detection Patterns**: Matches jailbreak attempts, system overrides, secret key disclosures, guidance bypasses, and role-play instructions
- **Blocked Actions**: Flagged prompts are rejected with HTTP 400 and a clean error message
- **Sanitization**: `sanitizeInput` function strips dangerous HTML elements (`<script>`, inline event handlers, pseudo-protocols)

### 4. Advanced Rate Limiting with IP Blacklisting
**Implementation**: `src/server/middleware/rateLimit.ts`

Sliding-window rate limiter with automatic blacklisting prevents server abuse:
- **Standard Limit**: 50 requests per minute per IP
- **Blacklist Trigger**: IPs exceeding 75 requests/minute (1.5x limit) are blacklisted for 5 minutes
- **Scope**: Applied to all endpoints automatically on server start
- **Response**: Rate-limited requests return HTTP 429, blacklisted IPs get HTTP 403

### 5. CORS Whitelist Policy
**Implementation**: `src/server/middleware/cors.ts`

Strict origin whitelisting prevents unauthorized cross-origin requests:
- **Allowed Origins**: localhost, *.run.app, *.google.com, *.google-aistudio.com, *.onrender.com, *.render.com
- **Fallback**: Production on Render allows all origins (public API design)
- **Methods**: Only GET and POST are permitted
- **Credentials**: Enabled for authenticated requests

### 6. Security Headers (CSP, HSTS, X-Frame-Options)
**Implementation**: `src/server/middleware/security.ts`

Comprehensive security headers protect against common web vulnerabilities:
- **Content-Security-Policy**: Restricts script, style, and resource origins
- **HSTS**: Forces HTTPS connections (max-age: 1 year)
- **X-Frame-Options**: DENY prevents clickjacking
- **X-Content-Type-Options**: nosniff prevents MIME-type attacks
- **Referrer-Policy**: strict-origin-when-cross-origin limits information leakage

### 7. Role-Based Access Control (RBAC)
**Implementation**: `src/server/middleware/rbac.ts` + `firestore.rules`

Two-tier access control system:
- **Application Layer**: `requireStaffRole` middleware protects sensitive endpoints (broadcast translation, decision support, incident management)
- **Database Layer**: Firestore security rules enforce read/write permissions at the document level
- **Roles**: `fan` (default for public signups) vs `staff` (requires manual elevation)
- **Privilege Escalation Fix**: New signups default to `fan` role, preventing automatic staff access

### 8. Access Control (Firestore Security Rules)
**Location**: `firestore.rules`

Document-level permissions prevent unauthorized data access:
- **Users**: Can read/write only their own document
- **Crowd Status**: Public read, staff-only write
- **Transportation**: Public read, staff-only write  
- **Broadcasts**: Public read, staff-only write
- **Incidents**: Staff-only read/write (completely private)
- **Sustainability Scores**: Public read, anyone can create/update their own

---

## 🔍 Security Testing & Validation

### Automated Testing
- CSRF validation tests in `src/tests/security/csrf.test.ts`
- RBAC authorization tests in `src/tests/security/rbac.test.ts`
- Prompt injection tests in `src/tests/security/prompt-injection.test.ts`
- Rate limiting tests in `src/tests/security/rate-limit.test.ts`

### Manual Security Audits
1. Review `npm audit` output regularly for dependency vulnerabilities
2. Test CSRF token validation with missing/incorrect tokens
3. Verify rate limiting triggers blacklist after 75 requests/minute
4. Confirm staff-only endpoints reject fan-role users
5. Test prompt injection patterns are blocked

---

## 🚨 Incident Response

### Security Vulnerability Reporting
Report security issues to: [security contact - to be configured]

### Emergency Response Protocol
1. Identify and isolate affected systems
2. Review server logs for attack patterns
3. Update security rules in Firestore if needed
4. Rotate compromised credentials immediately
5. Document incident in security audit log

---

## 📋 Security Checklist for Deployment

- [ ] All environment variables set in production (GEMINI_API_KEY, Firebase config)
- [ ] Firestore security rules deployed and tested
- [ ] HTTPS enforced on all endpoints
- [ ] CORS whitelist configured for production domain
- [ ] Rate limiting thresholds appropriate for production traffic
- [ ] Security headers verified in production
- [ ] Error messages don't leak sensitive information
- [ ] Logging configured without exposing secrets
- [ ] npm audit run with no high/critical vulnerabilities
- [ ] CSRF tokens validated on all POST routes

---

**Last Updated**: Part B Security Audit - Dynamic CSRF Implementation
**Version**: 1.1.0
