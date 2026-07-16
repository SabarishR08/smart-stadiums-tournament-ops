/**
 * CSRF Token Route
 * Endpoint to fetch CSRF token
 */

import express from 'express';
import { CSRF_SECRET } from '../middleware/csrf.js';

export const csrfRouter = express.Router();

csrfRouter.get('/csrf-token', (req, res) => {
  res.json({ token: CSRF_SECRET });
});
