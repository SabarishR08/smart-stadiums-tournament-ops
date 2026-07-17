# StadiumPulse AI Server Architecture

## Overview
This is the modular Express server architecture for StadiumPulse AI. The monolithic `server.ts` has been split into organized folders for better maintainability, testability, and scalability.

## Directory Structure

```
src/server/
├── index.ts                 # Main server entry point
├── middleware/              # Express middleware
│   ├── cors.ts             # CORS whitelist configuration
│   ├── csrf.ts             # Dynamic CSRF token validation
│   ├── logger.ts           # Request logging
│   ├── rateLimit.ts        # IP-based rate limiting & blacklisting
│   ├── rbac.ts             # Role-based access control
│   └── security.ts         # Security headers (CSP, HSTS, etc.)
├── routes/                  # API route handlers
│   ├── broadcast.ts        # Multilingual broadcast translation (Staff only)
│   ├── chat.ts             # Multilingual AI concierge chat
│   ├── classify.ts         # Sustainability item classifier (Gemini Vision)
│   ├── csrf.ts             # CSRF token endpoint
│   ├── decisionSupport.ts  # AI decision support for ops (Staff only)
│   └── health.ts           # Health check endpoint
└── services/                # Business logic & utilities
    ├── cache.ts            # In-memory caching (60s TTL)
    ├── gemini.ts           # Gemini AI client & fallback responses
    └── security.ts         # Input sanitization & prompt injection detection
```

## Middleware Stack

The middleware is applied in the following order:

1. **JSON Body Parser** - Parses incoming JSON requests (10MB limit)
2. **CORS** - Validates origin against whitelist
3. **Security Headers** - Sets CSP, HSTS, X-Frame-Options, etc.
4. **Request Logger** - Logs all incoming requests with timestamps
5. **CSRF Token Endpoint** - `/api/csrf-token` (before validation)
6. **CSRF Validation** - Validates CSRF tokens on POST/PUT/DELETE requests
7. **Rate Limiter** - Sliding window rate limiter with IP blacklisting
8. **Route Handlers** - Individual API routes

## API Routes

### Public Routes
- `GET /api/csrf-token` - Fetch dynamic CSRF token
- `GET /api/health` - System health check
- `POST /api/chat` - Multilingual AI concierge (requires CSRF token)
- `POST /api/classify-item` - Waste classification with Gemini Vision (requires CSRF token)

### Staff-Only Routes (Require `X-User-Role: staff` header)
- `POST /api/decision-support` - AI-powered operational decision support
- `POST /api/broadcast` - Multilingual broadcast translation

## Services

### Gemini Service (`services/gemini.ts`)
- Lazy-loaded Google Gemini AI client
- Configuration validation
- Fallback mock responses for offline/quota scenarios
- Model: `gemini-3.5-flash`

### Cache Service (`services/cache.ts`)
- Simple in-memory cache with 60-second TTL
- Used for chat responses to reduce API calls
- Automatic cache expiration

### Security Service (`services/security.ts`)
- **Input Sanitization**: Strips XSS vectors (script tags, inline handlers, javascript: URIs)
- **Prompt Injection Detection**: Pattern matching for LLM jailbreak attempts

## Security Features

### CSRF Protection
- Dynamic token generated at server startup using `crypto.randomBytes(32)`
- Double-submit cookie pattern
- Tokens validated on all non-GET/HEAD/OPTIONS requests

### Rate Limiting
- Sliding window algorithm (50 requests/minute per IP)
- Automatic IP blacklisting for abuse (5-minute penalty)
- Configurable thresholds

### RBAC (Role-Based Access Control)
- Staff-only endpoints require `X-User-Role: staff` header
- Unauthorized access returns 403 Forbidden

### CORS
- Regex-based origin whitelist
- Supports localhost, Google domains, Render.com
- Fallback to allow-all in production (Render environment)

### Security Headers
- **CSP**: Strict Content Security Policy
- **HSTS**: HTTP Strict Transport Security (1 year)
- **X-Frame-Options**: SAMEORIGIN
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: Enabled

## Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
PORT=3000
NODE_ENV=development|production
RENDER=true  # Set automatically on Render.com
```

## Development

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## Build Process

The build process:
1. Vite builds the React frontend → `dist/`
2. esbuild bundles the modular server → `dist/server.js`
3. Server serves static files from `dist/` in production

## Migration Notes

This modular architecture replaces the monolithic `server.ts` file. Key improvements:

- **Separation of Concerns**: Routes, middleware, and services are clearly separated
- **Testability**: Individual modules can be unit tested in isolation
- **Maintainability**: Easier to locate and update specific functionality
- **Scalability**: New routes/middleware can be added without cluttering a single file
- **Type Safety**: Full TypeScript support with proper imports/exports

## File Naming Conventions

- **camelCase** for file names (e.g., `rateLimit.ts`, `decisionSupport.ts`)
- **PascalCase** for React components (e.g., `FanView.tsx`)
- **kebab-case** for configuration files (e.g., `package.json`, `tsconfig.json`)

## Import/Export Pattern

All modules use ES6 imports/exports:

```typescript
// Named exports for services/middleware
export function myFunction() { ... }
export const myMiddleware = (req, res, next) => { ... }

// Router exports for routes
export const myRouter = express.Router();
myRouter.post('/endpoint', handler);
```

## Future Enhancements

Potential improvements for the architecture:

- [ ] Add database connection pooling service
- [ ] Implement distributed caching (Redis)
- [ ] Add OpenAPI/Swagger documentation generator
- [ ] Implement structured logging (Winston/Pino)
- [ ] Add monitoring/telemetry service (Prometheus/Datadog)
- [ ] Implement circuit breaker for Gemini API calls
- [ ] Add database migration system
- [ ] Implement WebSocket support for real-time updates
- [ ] Add GraphQL API layer
- [ ] Implement API versioning (v1, v2, etc.)
