/**
 * Multilingual Broadcast Route (Ops Staff Only)
 * Translates a given English broadcast text into 5 other supported languages
 */

import express from 'express';
import { sanitizeInput, hasPromptInjection } from '../services/security.js';
import { getAiClient, isGeminiConfigured, getMockBroadcastResponse } from '../services/gemini.js';
import { checkStaffRole } from '../middleware/rbac.js';

export const broadcastRouter = express.Router();

broadcastRouter.post('/broadcast', checkStaffRole, async (req, res) => {
  try {
    const { originalText } = req.body;

    if (!originalText || typeof originalText !== 'string' || originalText.trim() === '') {
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
    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json(parsed);

  } catch (error: any) {
    console.warn('Error in translation broadcast API, falling back to smart mock translations:', error);
    try {
      const fallbackResponse = getMockBroadcastResponse(req.body.originalText || '');
      res.json(fallbackResponse);
    } catch {
      res.status(500).json({ error: 'Failed to translate announcement.' });
    }
  }
});
