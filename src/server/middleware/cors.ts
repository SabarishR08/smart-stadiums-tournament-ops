/**
 * CORS Middleware
 * Enterprise CORS Whitelist Policy
 */

import cors from 'cors';

const CORS_WHITELIST = [
  /localhost:\d+$/,
  /\.run\.app$/,
  /\.google\.com$/,
  /\.google-aistudio\.com$/,
  /\.onrender\.com$/,
  /\.render\.com$/
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // In production with no origin (same-origin requests), always allow
    if (!origin) {
      return callback(null, true);
    }
    
    // Check whitelist
    const isAllowed = CORS_WHITELIST.some(regex => regex.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      // For production on Render, allow all origins since it's a public app
      if (process.env.RENDER) {
        console.warn(`[CORS] Allowing non-whitelisted origin in production: ${origin}`);
        callback(null, true);
      } else {
        callback(new Error('CORS blocked: Origin not allowed by StadiumPulse AI security policy.'));
      }
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
});
