/**
 * Multilingual Broadcast Route (Ops Staff Only)
 * Translates a given English broadcast text into 5 other supported languages.
 * Optimized with complete error handling, request wrapping, and strict typing.
 */

import express from 'express';
import { sanitizeInput, hasPromptInjection } from '../services/security.js';
import { getAiClient, isGeminiConfigured, getMockBroadcastResponse, safeJsonParse, isQuotaExceededError } from '../services/gemini.js';
import { checkStaffRole } from '../middleware/rbac.js';

export const broadcastRouter = express.Router();

broadcastRouter.post('/broadcast', checkStaffRole, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const handleRequest = async () => {
    try {
      const originalText = req.body && typeof req.body.originalText === 'string' ? req.body.originalText : '';

      if (!originalText || originalText.trim() === '') {
        res.status(400).json({ error: 'Broadcast text cannot be empty.' });
        return;
      }

      if (originalText.length > 500) {
        res.status(400).json({ error: 'Broadcast text is too long (max 500 characters).' });
        return;
      }

      // Input sanitization and prompt injection protection
      const sanitizedBroadcast = sanitizeInput(originalText);
      if (hasPromptInjection(sanitizedBroadcast)) {
        res.status(400).json({ 
          error: 'Security alert: Your input matches patterns associated with prompt injection or unsafe commands. Request blocked.',
          securityAlert: true
        });
        return;
      }

      if (!isGeminiConfigured()) {
        const mockResponse = getMockBroadcastResponse(sanitizedBroadcast);
        res.json(mockResponse);
        return;
      }

      const ai = getAiClient();

      const translationPrompt = `Translate the following English stadium announcement into Spanish, French, Arabic, Hindi, and Portuguese.
Ensure the translations are clear, professional, natural, and highly accurate for a sports stadium environment.

English: "${sanitizedBroadcast}"

Return JSON format:
{
  "translations": {
    "en": "${sanitizedBroadcast}",
    "es": "Spanish translation",
    "fr": "French translation",
    "ar": "Arabic translation",
    "hi": "Hindi translation",
    "pt": "Portuguese translation"
  }
}`;

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: translationPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = result.text || '{}';
      const parsed: unknown = safeJsonParse(text);

      res.json(parsed);

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error');
      if (isQuotaExceededError(err)) {
        console.warn('Gemini API Quota Exceeded (429). Falling back to smart offline mock translations.');
      } else {
        console.warn('Error in translation broadcast API, falling back to smart mock translations:', err);
      }
      try {
        const fallbackResponse = getMockBroadcastResponse((req.body && typeof req.body.originalText === 'string' ? req.body.originalText : '') || '');
        res.json(fallbackResponse);
      } catch {
        res.status(500).json({ error: 'Failed to translate announcement.' });
      }
    }
  };

  handleRequest().catch(next);
});

