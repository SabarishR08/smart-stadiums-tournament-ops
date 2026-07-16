/**
 * Health Check Route
 * System health and status endpoint
 */

import express from 'express';
import { isGeminiConfigured } from '../services/gemini.js';

export const healthRouter = express.Router();

healthRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', geminiConfigured: isGeminiConfigured() });
});
