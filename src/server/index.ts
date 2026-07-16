/**
 * StadiumPulse AI Server
 * Modular Express server with organized routes, middleware, and services
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Middleware imports
import { corsMiddleware } from './middleware/cors.js';
import { csrfValidation } from './middleware/csrf.js';
import { securityHeaders } from './middleware/security.js';
import { requestLogger } from './middleware/logger.js';
import { rateLimiter } from './middleware/rateLimit.js';

// Route imports
import { csrfRouter } from './routes/csrf.js';
import { chatRouter } from './routes/chat.js';
import { classifyRouter } from './routes/classify.js';
import { decisionSupportRouter } from './routes/decisionSupport.js';
import { broadcastRouter } from './routes/broadcast.js';
import { healthRouter } from './routes/health.js';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Enable JSON parse with standard limit to prevent oversized payloads
app.use(express.json({ limit: '10mb' }));

// Apply global middleware
app.use(corsMiddleware);
app.use(securityHeaders);
app.use(requestLogger);

// CSRF Token Endpoint (must be BEFORE csrfValidation middleware)
app.use('/api', csrfRouter);

// Apply CSRF validation and rate limiting to all API routes
app.use('/api', csrfValidation);
app.use('/api', rateLimiter);

// Mount API routes
app.use('/api', chatRouter);
app.use('/api', classifyRouter);
app.use('/api', decisionSupportRouter);
app.use('/api', broadcastRouter);
app.use('/api', healthRouter);

// Integrate Vite setup for full-stack build/dev
const setupServerAndVite = async () => {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode');
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving static files from dist directory in production');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StadiumPulse AI Server running at http://0.0.0.0:${PORT}`);
  });
};

setupServerAndVite();
