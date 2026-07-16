/**
 * Sustainability Classifier Route (Gemini Vision)
 * Classifies an item image as recyclable, compostable, or landfill
 */

import express from 'express';
import { getAiClient, isGeminiConfigured, getMockClassifyItemResponse } from '../services/gemini.js';

export const classifyRouter = express.Router();

classifyRouter.post('/classify-item', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
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
    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json(parsed);

  } catch (error: any) {
    console.warn('Error in Vision classifier API, falling back to smart mock classification:', error);
    try {
      const fallbackResponse = getMockClassifyItemResponse();
      res.json(fallbackResponse);
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to classify item with Gemini Vision.' });
    }
  }
});
