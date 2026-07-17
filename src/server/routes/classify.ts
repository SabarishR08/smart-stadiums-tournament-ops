/**
 * Sustainability Classifier Route (Gemini Vision)
 * Classifies an item image as recyclable, compostable, or landfill.
 * Optimized with complete error handling, request wrapping, and strict typing.
 */

import express from 'express';
import { getAiClient, isGeminiConfigured, getMockClassifyItemResponse, safeJsonParse, isQuotaExceededError } from '../services/gemini.js';

export const classifyRouter = express.Router();

classifyRouter.post('/classify-item', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const handleRequest = async () => {
    try {
      const imageBase64 = req.body && typeof req.body.imageBase64 === 'string' ? req.body.imageBase64 : '';
      const mimeType = req.body && typeof req.body.mimeType === 'string' ? req.body.mimeType : 'image/jpeg';

      if (!imageBase64 || imageBase64.trim() === '') {
        res.status(400).json({ error: 'Invalid or missing image data.' });
        return;
      }

      if (imageBase64.length > 8000000) {
        res.status(400).json({ error: 'Image is too large (maximum 6MB).' });
        return;
      }

      if (!isGeminiConfigured()) {
        const mockResponse = getMockClassifyItemResponse();
        res.json(mockResponse);
        return;
      }

      const ai = getAiClient();

      // Clean base64 data to remove standard data URI scheme prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const visionPrompt = `Analyze this stadium trash/item photo. Determine:
1. What the item is.
2. Classify it strictly into one of three categories: "recyclable", "compostable", or "landfill".
3. State the correct bin ("Blue Recycling Bin", "Green Compost Bin", or "Black Trash Bin").
4. Provide a 1-sentence plain explanation of why it belongs there.
5. Award a sustainability score (10 for recyclable, 15 for compostable, 5 for landfill).

Return JSON format:
{
  "itemName": "Plastic Cup / Beer Can / Hotdog Wrapper etc",
  "category": "recyclable | compostable | landfill",
  "correctBin": "Blue Recycling Bin | Green Compost Bin | Black Trash Bin",
  "explanation": "Brief explanation why",
  "scoreAwarded": 10 | 15 | 5
}`;

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          visionPrompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType || 'image/jpeg'
            }
          }
        ],
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
        console.warn('Gemini API Quota Exceeded (429). Falling back to smart offline mock classification.');
      } else {
        console.warn('Error in Vision classifier API, falling back to smart mock classification:', err);
      }
      try {
        const fallbackResponse = getMockClassifyItemResponse();
        res.json(fallbackResponse);
      } catch {
        res.status(500).json({ error: 'Failed to classify item with Gemini Vision.' });
      }
    }
  };

  handleRequest().catch(next);
});

