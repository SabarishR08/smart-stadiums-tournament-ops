/**
 * AI Decision Support Route (Ops Staff Only)
 * Evaluates stadium incidents and outputs ranked tactical actions.
 * Optimized with complete error handling, request wrapping, and strict typing.
 */

import express from 'express';
import { sanitizeInput, hasPromptInjection } from '../services/security.js';
import { getAiClient, isGeminiConfigured, getMockDecisionSupportResponse, safeJsonParse, isQuotaExceededError } from '../services/gemini.js';
import { checkStaffRole } from '../middleware/rbac.js';

export const decisionSupportRouter = express.Router();

interface DecisionReqBody {
  situation?: string;
}

decisionSupportRouter.post('/decision-support', checkStaffRole, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const handleRequest = async () => {
    let situation = '';
    try {
      const body = (req.body || {}) as DecisionReqBody;
      situation = typeof body.situation === 'string' ? body.situation : '';

      if (!situation || situation.trim() === '') {
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
      const parsed: unknown = safeJsonParse(text);

      res.json(parsed);

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error');
      if (isQuotaExceededError(err)) {
        console.warn('Gemini API Quota Exceeded (429). Falling back to smart offline mock guidelines.');
      } else {
        console.warn('Error in decision support API, falling back to smart mock guidelines:', err);
      }
      try {
        const fallbackResponse = getMockDecisionSupportResponse(situation);
        res.json(fallbackResponse);
      } catch {
        res.status(500).json({ error: 'Failed to generate operational decision advice.' });
      }
    }
  };

  handleRequest().catch(next);
});

