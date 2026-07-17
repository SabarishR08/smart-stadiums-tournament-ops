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
 * Detects if a thrown error is a 429 rate limit or quota exceeded error from Gemini.
 */
export function isQuotaExceededError(error: unknown): boolean {
  if (!error) return false;
  const err = error as Record<string, unknown>;
  const errMsg = typeof error === 'object' && error !== null && 'message' in error 
    ? String((error as Error).message) 
    : (typeof error === 'string' ? error : '');
  const errStr = JSON.stringify(error);
  return (
    err.status === 'RESOURCE_EXHAUSTED' ||
    err.code === 429 ||
    errMsg.includes('429') ||
    errMsg.toLowerCase().includes('quota') ||
    errStr.includes('RESOURCE_EXHAUSTED') ||
    errStr.includes('429') ||
    errStr.toLowerCase().includes('quota')
  );
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

/**
 * Repairs common JSON formatting mistakes returned by LLMs.
 */
export function repairJson(str: string): string {
  let repaired = str.trim();

  // 1. Convert raw newlines, tabs, and carriage returns inside string values to their escaped equivalents
  let insideDoubleQuote = false;
  let insideSingleQuote = false;
  let escaped = false;
  let result = '';

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      if (!insideSingleQuote) {
        insideDoubleQuote = !insideDoubleQuote;
      }
      result += char;
    } else if (char === "'") {
      if (!insideDoubleQuote) {
        insideSingleQuote = !insideSingleQuote;
      }
      result += char;
    } else if (insideDoubleQuote || insideSingleQuote) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  repaired = result;

  // 2. Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // 3. Convert single quoted or unquoted object keys to double quotes
  repaired = repaired.replace(/(['"])?([a-zA-Z0-9_.-]+)\1\s*:/g, '"$2":');

  return repaired;
}

/**
 * Robust JSON parser that can extract a JSON object or array from LLM text responses
 * even if they contain markdown backticks or leading/trailing conversational text.
 */
export function safeJsonParse(text: string): unknown {
  const trimmed = text.trim();
  
  // Try 1: Parse directly
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    // Try 2: Parse after basic repair
    try {
      return JSON.parse(repairJson(trimmed));
    } catch {
      // Continue
    }

    // Try 3: Find JSON wrapped in markdown backticks
    const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = trimmed.match(markdownRegex);
    if (match && match[1]) {
      const codeBlock = match[1].trim();
      try {
        return JSON.parse(codeBlock);
      } catch {
        try {
          return JSON.parse(repairJson(codeBlock));
        } catch {
          // Continue to brace/bracket matching fallback
        }
      }
    }
    
    // Balanced brace parser to extract exactly matched braces/brackets
    const extractBalanced = (str: string, startChar: string, endChar: string): string | null => {
      const startIndex = str.indexOf(startChar);
      if (startIndex === -1) return null;
      
      let depth = 0;
      let inDoubleQuote = false;
      let inSingleQuote = false;
      let escape = false;
      
      for (let i = startIndex; i < str.length; i++) {
        const char = str[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (inDoubleQuote) {
          if (char === '"') {
            inDoubleQuote = false;
          }
          continue;
        }
        if (inSingleQuote) {
          if (char === "'") {
            inSingleQuote = false;
          }
          continue;
        }
        if (char === '"') {
          inDoubleQuote = true;
          continue;
        }
        if (char === "'") {
          inSingleQuote = true;
          continue;
        }
        if (char === startChar) {
          depth++;
        } else if (char === endChar) {
          depth--;
          if (depth === 0) {
            return str.substring(startIndex, i + 1);
          }
        }
      }
      return null;
    };

    // Try 4: Extract balanced brace candidate
    const braceCandidate = extractBalanced(trimmed, '{', '}');
    if (braceCandidate) {
      try {
        return JSON.parse(braceCandidate);
      } catch {
        try {
          return JSON.parse(repairJson(braceCandidate));
        } catch {
          // Continue
        }
      }
    }

    // Try 5: Extract balanced bracket candidate
    const bracketCandidate = extractBalanced(trimmed, '[', ']');
    if (bracketCandidate) {
      try {
        return JSON.parse(bracketCandidate);
      } catch {
        try {
          return JSON.parse(repairJson(bracketCandidate));
        } catch {
          // Continue
        }
      }
    }

    // Try 6: Outer substring fallback
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = trimmed.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch {
        try {
          return JSON.parse(repairJson(jsonCandidate));
        } catch {
          // Continue
        }
      }
    }

    const firstBracket = trimmed.indexOf('[');
    const lastBracket = trimmed.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const jsonCandidate = trimmed.substring(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch {
        try {
          return JSON.parse(repairJson(jsonCandidate));
        } catch {
          // Continue
        }
      }
    }
    
    throw error;
  }
}

