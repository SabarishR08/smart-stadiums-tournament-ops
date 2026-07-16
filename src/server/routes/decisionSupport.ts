/**
 * AI Decision Support Route (Ops Staff Only)
 * Evaluates stadium incidents and outputs ranked tactical actions
 */

import express from 'express';
import { sanitizeInput, hasPromptInjection } from '../services/security.js';
import { getAiClient, isGeminiConfigured, getMockDecisionSupportResponse } from '../services/gemini.js';
import { checkStaffRole } from '../middleware/rbac.js';

export const decisionSupportRouter = express.Router();

decisionSupportRouter.post('/decision-support', checkStaffRole, async (req, res) => {
  try {
    const { situation } = req.body;

    if (!situation || typeof situation !== 'string' || situation.trim() === '') {
      res.status(400).json({ error: 'Situation scenario cannot be empty.' });
      return;
    }

    if (situation.length > 1000) {
      res.status(400).json({ error: 'Situation details too long (max 1000 characters).' });
      return;
    }

    // Input sanitization and prompt injection protection
    const sanitizedSituation = sanitizeInput(situation);
    if (hasPromptInjection(sanitizedSituation)) {
      res.status(400).json({ 
        error: 'Security alert: Your input matches patterns associated with prompt injection or unsafe commands. Request blocked.',
        securityAlert: true
      });
      return;
    }

    if (!isGeminiConfigured()) {
      const mockResponse = getMockDecisionSupportResponse(sanitizedSituation);
      res.json(mockResponse);
      return;
    }

    const ai = getAiClient();

    const decisionPrompt = `You are the Chief of Stadium Operations for the FIFA World Cup 2026.
Analyze the following active operational situation and provide 2-3 ranked actionable tactical recommendations to resolve the situation safely and efficiently.

Situation: "${sanitizedSituation}"

For each recommendation, give a concrete action title and direct, practical reasoning behind it.
Return JSON format:
{
  "recommendations": [
    {
      "rank": 1,
      "action": "Immediate tactical action",
      "reasoning": "Reason why this action is ranked first and how it helps"
    },
    ...
  ]
}`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: decisionPrompt,
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
    console.warn('Error in decision support API, falling back to smart mock guidelines:', error);
    try {
      const fallbackResponse = getMockDecisionSupportResponse(req.body.situation || '');
      res.json(fallbackResponse);
    } catch {
      res.status(500).json({ error: 'Failed to generate operational decision advice.' });
    }
  }
});
