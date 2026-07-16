/**
 * CSRF Middleware
 * Dynamic CSRF Double-Submit Verification
 */

import express from 'express';
import crypto from 'crypto';

// Generate CSRF secret at server startup
export const CSRF_SECRET = crypto.randomBytes(32).toString('hex');

/**
 * CSRF Token Validation Middleware
 * Validates CSRF tokens on all POST requests
 */
export const csrfValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Safe methods don't require CSRF checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Custom double-submit verification header
  const clientCsrfToken = req.headers['x-csrf-token'];
  
  if (!clientCsrfToken || clientCsrfToken !== CSRF_SECRET) {
    res.status(403).json({ error: 'CSRF security check failed. Request rejected.' });
    return;
  }
  next();
};
