import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getAiClient,
  isGeminiConfigured,
  getMockChatResponse,
  getMockClassifyItemResponse,
  getMockDecisionSupportResponse,
  getMockBroadcastResponse
} from '../../server/services/gemini';

describe('Gemini Service', () => {
  const originalApiKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    // Restore original API key after each test
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  describe('getAiClient', () => {
    it('should create client with API key when configured', () => {
      process.env.GEMINI_API_KEY = 'test-api-key-12345';
      const client = getAiClient();
      expect(client).toBeDefined();
      expect(client.constructor.name).toBe('GoogleGenAI');
    });

    it('should create client with dummy key when API key is missing', () => {
      delete process.env.GEMINI_API_KEY;
      const client = getAiClient();
      expect(client).toBeDefined();
      expect(client.constructor.name).toBe('GoogleGenAI');
    });

    it('should return same client instance on subsequent calls (singleton)', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      const client1 = getAiClient();
      const client2 = getAiClient();
      expect(client1).toBe(client2);
    });
  });

  describe('isGeminiConfigured', () => {
    it('should return true when valid API key is set', () => {
      process.env.GEMINI_API_KEY = 'actual-api-key-xyz';
      expect(isGeminiConfigured()).toBe(true);
    });

    it('should return false when API key is missing', () => {
      delete process.env.GEMINI_API_KEY;
      expect(isGeminiConfigured()).toBe(false);
    });

    it('should return false when API key is placeholder value', () => {
      process.env.GEMINI_API_KEY = 'MY_GEMINI_API_KEY';
      expect(isGeminiConfigured()).toBe(false);
    });

    it('should return false when API key is empty string', () => {
      process.env.GEMINI_API_KEY = '';
      expect(isGeminiConfigured()).toBe(false);
    });
  });

  describe('getMockChatResponse', () => {
    it('should return generic response for generic message', () => {
      const result = getMockChatResponse('Hello there!');
      expect(result.reply).toContain('StadiumPulse AI Concierge');
      expect(result.detectedLanguage).toBe('en');
      expect(result.isFallback).toBe(true);
    });

    it('should detect Spanish language and provide Spanish restroom response', () => {
      const result = getMockChatResponse('¿Dónde está el baño?');
      expect(result.reply).toContain('Puerta');
      expect(result.detectedLanguage).toBe('es');
      expect(result.isFallback).toBe(true);
    });

    it('should detect French language and provide French response', () => {
      const result = getMockChatResponse('Bonjour, où sont les toilettes?');
      expect(result.reply).toContain('toilettes');
      expect(result.detectedLanguage).toBe('fr');
      expect(result.isFallback).toBe(true);
    });

    it('should detect Portuguese language and provide Portuguese response', () => {
      const result = getMockChatResponse('Olá, onde fica o banheiro?');
      expect(result.reply).toContain('banheiros');
      expect(result.detectedLanguage).toBe('pt');
      expect(result.isFallback).toBe(true);
    });

    it('should provide restroom information when asked about toilet/restroom', () => {
      const result = getMockChatResponse('Where is the restroom?');
      expect(result.reply).toContain('restrooms');
      expect(result.reply).toContain('Gate');
      expect(result.detectedLanguage).toBe('en');
    });

    it('should provide food information when asked about food', () => {
      const result = getMockChatResponse('Where can I get food?');
      expect(result.reply).toContain('Food courts');
      expect(result.reply).toContain('Level');
      expect(result.detectedLanguage).toBe('en');
    });

    it('should provide gate information when asked about gates', () => {
      const result = getMockChatResponse('Which gate should I use?');
      expect(result.reply).toContain('Gate A');
      expect(result.reply).toContain('Entrance');
      expect(result.detectedLanguage).toBe('en');
    });
  });

  describe('getMockClassifyItemResponse', () => {
    it('should return valid waste classification response', () => {
      const result = getMockClassifyItemResponse();
      expect(result.itemName).toContain('Stadium Food Container');
      expect(['recyclable', 'compostable', 'landfill']).toContain(result.category);
      expect(result.correctBin).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(result.scoreAwarded).toBeGreaterThan(0);
      expect(result.isFallback).toBe(true);
    });

    it('should map recyclable category to Blue Recycling Bin', () => {
      // Run multiple times to eventually hit recyclable due to randomness
      const results = Array.from({ length: 20 }, () => getMockClassifyItemResponse());
      const recyclableResult = results.find(r => r.category === 'recyclable');
      if (recyclableResult) {
        expect(recyclableResult.correctBin).toBe('Blue Recycling Bin');
        expect(recyclableResult.scoreAwarded).toBe(10);
      }
    });

    it('should map compostable category to Green Compost Bin', () => {
      const results = Array.from({ length: 20 }, () => getMockClassifyItemResponse());
      const compostableResult = results.find(r => r.category === 'compostable');
      if (compostableResult) {
        expect(compostableResult.correctBin).toBe('Green Compost Bin');
        expect(compostableResult.scoreAwarded).toBe(15);
      }
    });

    it('should map landfill category to Black Trash Bin', () => {
      const results = Array.from({ length: 20 }, () => getMockClassifyItemResponse());
      const landfillResult = results.find(r => r.category === 'landfill');
      if (landfillResult) {
        expect(landfillResult.correctBin).toBe('Black Trash Bin');
        expect(landfillResult.scoreAwarded).toBe(5);
      }
    });
  });

  describe('getMockDecisionSupportResponse', () => {
    it('should return structured decision recommendations', () => {
      const result = getMockDecisionSupportResponse('Heavy crowd at Gate B');
      expect(result.recommendations).toHaveLength(3);
      expect(result.isFallback).toBe(true);
    });

    it('should include situation context in reasoning', () => {
      const situation = 'Emergency evacuation needed';
      const result = getMockDecisionSupportResponse(situation);
      const hasContextInReasoning = result.recommendations.some(rec =>
        rec.reasoning.includes(situation)
      );
      expect(hasContextInReasoning).toBe(true);
    });

    it('should rank recommendations from 1 to 3', () => {
      const result = getMockDecisionSupportResponse('Test situation');
      const ranks = result.recommendations.map(rec => rec.rank);
      expect(ranks).toEqual([1, 2, 3]);
    });

    it('should provide actionable recommendations', () => {
      const result = getMockDecisionSupportResponse('Gate congestion');
      result.recommendations.forEach(rec => {
        expect(rec.action).toBeDefined();
        expect(rec.action.length).toBeGreaterThan(0);
        expect(rec.reasoning).toBeDefined();
        expect(rec.reasoning.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getMockBroadcastResponse', () => {
    it('should return translations in all 6 supported languages', () => {
      const result = getMockBroadcastResponse('Test announcement');
      expect(result.translations).toHaveProperty('en');
      expect(result.translations).toHaveProperty('es');
      expect(result.translations).toHaveProperty('fr');
      expect(result.translations).toHaveProperty('ar');
      expect(result.translations).toHaveProperty('hi');
      expect(result.translations).toHaveProperty('pt');
      expect(result.isFallback).toBe(true);
    });

    it('should preserve original English text', () => {
      const originalText = 'Emergency evacuation in progress';
      const result = getMockBroadcastResponse(originalText);
      expect(result.translations.en).toBe(originalText);
    });

    it('should provide gate-specific translations when text mentions gate', () => {
      const result = getMockBroadcastResponse('Please use Gate C instead');
      expect(result.translations.es).toContain('Puerta C');
      expect(result.translations.fr).toContain('porte C');
      expect(result.translations.pt).toContain('Portão C');
    });

    it('should provide generic security instructions for non-gate messages', () => {
      const result = getMockBroadcastResponse('Please remain seated');
      expect(result.translations.es).toContain('seguridad');
      expect(result.translations.fr).toContain('commissaires');
      expect(result.translations.ar).toContain('الأمن');
      expect(result.translations.hi).toContain('सुरक्षा');
      expect(result.translations.pt).toContain('segurança');
    });

    it('should handle crowd-related messages with gate routing', () => {
      const result = getMockBroadcastResponse('Crowd congestion alert');
      expect(result.translations.es).toContain('Puerta');
      expect(result.translations.fr).toContain('porte');
    });
  });
});
