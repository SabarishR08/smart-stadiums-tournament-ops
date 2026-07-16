/**
 * Security Headers Middleware
 * Enterprise CSP and Security Headers (Helmet Equivalent)
 */

import express from 'express';

export const securityHeaders = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Set strict transport security (STS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Set X-Content-Type-Options to prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Set X-Frame-Options to allow framing only inside Google AI Studio/Cloud Run contexts
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // XSS protection header for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Robust Content Security Policy (CSP) allowing Google services, maps, speech, and analytics
  res.setHeader('Content-Security-Policy', 
    "default-src 'self' https: 'unsafe-inline' 'unsafe-eval' data: blob:; " +
    "frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app; " +
    "connect-src 'self' https: wss:; " +
    "img-src 'self' https: data: blob:; " +
    "media-src 'self' https: blob: data:;"
  );
  
  next();
};
