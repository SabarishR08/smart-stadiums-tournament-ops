/**
 * Multilingual Chat Concierge Route
 * Detects input language automatically and replies in that language.
 * Optimized with complete error handling, request wrapping, and strict typing.
 */

import express from 'express';
import { sanitizeInput, hasPromptInjection } from '../services/security.js';
import { getCached, setCache } from '../services/cache.js';
import { getAiClient, isGeminiConfigured, getMockChatResponse, safeJsonParse, isQuotaExceededError } from '../services/gemini.js';
import { ChatMessage } from '../../types.js';

export const chatRouter = express.Router();

interface ChatReqBody {
  message?: string;
  history?: ChatMessage[];
}

chatRouter.post('/chat', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const handleRequest = async () => {
    let message = '';
    try {
      const body = (req.body || {}) as ChatReqBody;
      message = typeof body.message === 'string' ? body.message : '';
      const history = Array.isArray(body.history) ? body.history : [];

      // Validate inputs
      if (!message || message.trim() === '') {
        res.status(400).json({ error: 'Message cannot be empty.' });
        return;
      }
      if (message.length > 800) {
        res.status(400).json({ error: 'Message is too long (maximum 800 characters).' });
        return;
      }

      // Input sanitization and prompt injection protection
      const sanitizedMessage = sanitizeInput(message);
      if (hasPromptInjection(sanitizedMessage)) {
        res.status(400).json({ 
          error: 'Security alert: Your input matches patterns associated with prompt injection or unsafe commands. Request blocked.',
          securityAlert: true
        });
        return;
      }

      // Check Cache first for exactly identical message
      const cacheKey = `chat_${sanitizedMessage.toLowerCase().trim()}`;
      const cached = getCached(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      if (!isGeminiConfigured()) {
        const mockResponse = getMockChatResponse(sanitizedMessage);
        setCache(cacheKey, mockResponse);
        res.json(mockResponse);
        return;
      }

      const ai = getAiClient();
      
      // Construct rich context prompt for Concierge agent
      const systemPrompt = `You are the ultimate multilingual Smart Stadium AI Concierge ("StadiumPulse AI") for the FIFA World Cup 2026.
Your goal is to assist fans with seat finding, gate directions, food/restroom wayfinding, transport advice, accessibility questions, and match schedule details.

CRITICAL INSTRUCTIONS:
1. Detect the user's input language automatically. You MUST reply in the EXACT SAME LANGUAGE as the user's message (e.g. reply in Spanish if they speak Spanish, French for French, Arabic for Arabic, Hindi for Hindi, Portuguese for Portuguese, English for English).
2. Keep responses brief (under 3-4 sentences), highly polite, helpful, and clear.
3. Be fully aware of stadium features:
   - Gate A: North gate (connecting to Metro Shuttle)
   - Gate B: East gate (currently experiencing high density)
   - Gate C: South gate (fast lines, low density)
   - Gate D: West gate (Fully ADA-Accessible & parking)
   - Sections A-D: Main Lower concourse
   - Sections E-H: Upper concourse
   - Restrooms: Located near every Gate. Main accessible restrooms at Gate D.
   - Food: Mexican, Burgers, and World Cup snacks are on Level 1 (Section C) and Level 3 (Section G).
4. Do not make up matches. Mention mock matches for World Cup 2026 (e.g. USA vs Mexico at 18:00, or Brazil vs Argentina tomorrow).

Return a JSON string matching this structure:
{
  "reply": "Your concierge response here",
  "detectedLanguage": "en | es | fr | ar | hi | pt (detected language code)"
}`;

      // Convert previous chat history into a string format
      const formattedHistory = history.slice(-5).map((m: ChatMessage) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');

      const contentPrompt = `${systemPrompt}\n\nChat History:\n${formattedHistory}\n\nUser Message: ${sanitizedMessage}\n\nReturn the JSON object directly. Do not include markdown code block formatting.`;

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contentPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = result.text || '{}';
      const parsed: unknown = safeJsonParse(text);

      setCache(cacheKey, parsed);
      res.json(parsed);

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error');
      if (isQuotaExceededError(err)) {
        console.warn('Gemini API Quota Exceeded (429). Falling back to smart offline mock response.');
      } else {
        console.warn('Error in chat API, falling back to smart mock response:', err);
      }
      try {
        const fallbackResponse = getMockChatResponse(message);
        res.json(fallbackResponse);
      } catch {
        res.status(500).json({ error: 'Failed to generate concierge response.' });
      }
    }
  };

  handleRequest().catch(next);
});

