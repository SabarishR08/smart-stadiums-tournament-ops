/**
 * Gemini AI Service
 * Lazy-loaded Gemini AI client and utility functions
 */

import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

/**
 * Lazy-loaded Gemini AI client helper
 */
export function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY environment variable is not defined. Using mock fallback mode.');
      // Create with a dummy key so it doesn't crash on load, but we will handle missing keys on actual use
      aiClient = new GoogleGenAI({ apiKey: 'DUMMY_KEY' });
    } else {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

/**
 * Check if Gemini Key is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
}

/**
 * Robust fallback generators for all endpoints to handle quota or credential issues gracefully
 */
export function getMockChatResponse(sanitizedMessage: string) {
  const msgLower = sanitizedMessage.toLowerCase();
  let reply = "Hello! I am your StadiumPulse AI Concierge. I can guide you with seat finding, gate directions, restroom/food locations, and match schedules. (Running in Smart Offline Fallback Mode)";
  
  if (msgLower.includes('baño') || msgLower.includes('sanitario') || msgLower.includes('restroom') || msgLower.includes('toilet')) {
    reply = "Nearest restrooms are located near Gate A, B, C, and D. Accessible restrooms are fully operational at Gate D. Restroom lines are currently low in Section K.";
  } else if (msgLower.includes('comida') || msgLower.includes('food') || msgLower.includes('comer') || msgLower.includes('hamburguesa')) {
    reply = "Food courts are located on Level 1 Concourse and Level 3 Concourse. There are Tacos, Burgers, and vegetarian options near Section F.";
  } else if (msgLower.includes('gate') || msgLower.includes('puerta') || msgLower.includes('entrada')) {
    reply = "Gate A is North Entrance. Gate B is East Entrance (currently congested, try Gate C!). Gate D is accessible West entrance.";
  }

  // Echo language detection
  let detectedLang = 'en';
  if (/[\u0600-\u06FF]/.test(sanitizedMessage)) detectedLang = 'ar';
  else if (/[\u0900-\u097F]/.test(sanitizedMessage)) detectedLang = 'hi';
  else if (msgLower.includes('hola') || msgLower.includes('gracias') || msgLower.includes('dónde')) {
    detectedLang = 'es';
    reply = "¡Hola! Los baños más cercanos están cerca de la Puerta A, B, C y D. Los sanitarios accesibles están en la Puerta D. (Modo fuera de línea)";
  } else if (msgLower.includes('bonjour') || msgLower.includes('merci') || msgLower.includes('où')) {
    detectedLang = 'fr';
    reply = "Bonjour! Les toilettes les plus proches sont situées près des portes A, B, C et D. Des toilettes accessibles sont disponibles à la porte D. (Mode hors ligne)";
  } else if (msgLower.includes('olá') || msgLower.includes('obrigado') || msgLower.includes('onde')) {
    detectedLang = 'pt';
    reply = "Olá! Os banheiros mais próximos estão localizados perto do Portão A, B, C e D. Banheiros acessíveis estão no Portão D. (Modo offline)";
  }

  return { reply, detectedLanguage: detectedLang, isFallback: true };
}

export function getMockClassifyItemResponse() {
  const categories = ['recyclable', 'compostable', 'landfill'];
  const mockCategory = categories[Math.floor(Math.random() * categories.length)];
  let bin = 'Blue Recycling Bin';
  let explanation = 'This is plastic/aluminum which belongs in recycling.';
  let scoreAwarded = 10;

  if (mockCategory === 'compostable') {
    bin = 'Green Compost Bin';
    explanation = 'Organic packaging or food waste is fully compostable.';
    scoreAwarded = 15;
  } else if (mockCategory === 'landfill') {
    bin = 'Black Trash Bin';
    explanation = 'Waxed cups or multi-layer wrappers belong in general waste.';
    scoreAwarded = 5;
  }

  return {
    itemName: 'Stadium Food Container (Smart Offline Fallback Mode)',
    category: mockCategory,
    correctBin: bin,
    explanation,
    scoreAwarded,
    isFallback: true
  };
}

export function getMockDecisionSupportResponse(situation: string) {
  const mockDecisions = [
    {
      rank: 1,
      action: 'Reroute incoming fans via South Gate (Gate C) [Fallback Mode]',
      reasoning: `Heavy volume or issue detected. Rerouting scenario: "${situation}". South Gate (Gate C) is currently clear with under 5-minute wait times.`
    },
    {
      rank: 2,
      action: 'Deploy secondary steward team to Gate B [Fallback Mode]',
      reasoning: 'Providing physical support to check tickets and guide crowds will ease barrier pressure.'
    },
    {
      rank: 3,
      action: 'Issue mobile-app push notifications for Gate C entry [Fallback Mode]',
      reasoning: 'Gently shifts inbound fans away from overcrowded entries proactively.'
    }
  ];
  return { recommendations: mockDecisions, isFallback: true };
}

export function getMockBroadcastResponse(originalText: string) {
  const tText = originalText.toLowerCase();
  let es = "Atención por favor: Siga las instrucciones del personal de seguridad. (Traducción de respaldo)";
  let fr = "Attention s'il vous plaît: Veuillez suivre les instructions des commissaires. (Traduction de secours)";
  let ar = "تنبيه من فضلك: يرجى اتباع تعليمات مشرفي الأمن. (ترجمة احتياطية)";
  let hi = "कृपया ध्यान दें: कृपया सुरक्षा कर्मचारियों के निर्देशों का पालन करें। (बैकअप अनुवाद)";
  let pt = "Atenção por favor: Siga as instruções da equipe de segurança. (Tradução de backup)";

  if (tText.includes('gate') || tText.includes('puerta') || tText.includes('crowd')) {
    es = "Por favor, diríjase a la Puerta C para ingresar más rápido. La Puerta B está actualmente congestionada. (Traducción de respaldo)";
    fr = "Veuillez vous diriger vers la porte C pour une entrée plus rapide. La porte B est actuellement encombrée. (Traduction de secours)";
    ar = "يرجى التوجه إلى البوابة C لتسهيل الدخول. البوابة B مزدحمة حالياً. (ترجمة احتياطية)";
    hi = "कृपया तेजी से प्रवेश के लिए गेट सी की ओर जाएं। गेट बी वर्तमान में व्यस्त है। (बैकअप अनुवाद)";
    pt = "Por favor, dirija-se ao Portão C para entrada mais rápida. O Portão B está congestionado. (Tradução de backup)";
  }

  return {
    translations: {
      en: originalText,
      es,
      fr,
      ar,
      hi,
      pt
    },
    isFallback: true
  };
}
