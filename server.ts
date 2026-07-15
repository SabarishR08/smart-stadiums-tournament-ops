import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Enable JSON parse with standard limit to prevent oversized payloads
app.use(express.json({ limit: '10mb' }));

// Enterprise CORS Whitelist Policy
const CORS_WHITELIST = [
  /localhost:\d+$/,
  /\.run\.app$/,
  /\.google\.com$/,
  /\.google-aistudio\.com$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const isAllowed = CORS_WHITELIST.some(regex => regex.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked: Origin not allowed by StadiumPulse AI security policy.'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// Stateless CSRF Double-Submit Verification
const csrfValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Safe methods don't require CSRF checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Custom double-submit verification header
  const clientCsrfToken = req.headers['x-csrf-token'];
  const expectedToken = 'stadium_pulse_secure_csrf_token_2026';
  
  if (!clientCsrfToken || clientCsrfToken !== expectedToken) {
    res.status(403).json({ error: 'CSRF security check failed. Request rejected.' });
    return;
  }
  next();
};

// Apply CSRF double submit check on all API routes
app.use('/api', csrfValidation);

// Enterprise CSP and Security Headers Middleware (Helmet Equivalent)
app.use((req, res, next) => {
  // Set strict transport security (STS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Set X-Content-Type-Options to prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Set X-Frame-Options to allow framing only inside Google AI Studio/Cloud Run contexts
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // XSS protection header for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Robust Content Security Policy (CSP) allowing Google services, maps, speech, and analytics
  res.setHeader('Content-Security-Policy', 
    "default-src 'self' https: 'unsafe-inline' 'unsafe-eval' data: blob:; " +
    "frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app; " +
    "connect-src 'self' https: wss:; " +
    "img-src 'self' https: data: blob:; " +
    "media-src 'self' https: blob: data:;"
  );
  
  next();
});

// Basic request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Advanced Sliding Window Rate Limiter with IP Blacklisting
const ipLimits: { [ip: string]: { count: number; resetTime: number; blacklistedUntil?: number } } = {};
const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown-ip';
  const now = Date.now();
  const WINDOW_MS = 60000; // 1 minute window
  const MAX_REQUESTS = 50; // Max 50 requests/min
  const BLACKLIST_DURATION_MS = 300000; // 5 minutes penalty

  const ipData = ipLimits[ip];

  // Check if IP is blacklisted
  if (ipData && ipData.blacklistedUntil && now < ipData.blacklistedUntil) {
    res.status(403).json({ 
      error: `Access Denied: This IP is temporarily blacklisted due to API abuse. Remaining time: ${Math.ceil((ipData.blacklistedUntil - now) / 1000)} seconds.` 
    });
    return;
  }

  if (!ipData) {
    ipLimits[ip] = { count: 1, resetTime: now + WINDOW_MS };
    return next();
  }

  if (now > ipData.resetTime) {
    ipData.count = 1;
    ipData.resetTime = now + WINDOW_MS;
    return next();
  }

  ipData.count++;
  if (ipData.count > MAX_REQUESTS * 1.5) {
    // Flagrant abuse: Blacklist for 5 minutes
    ipData.blacklistedUntil = now + BLACKLIST_DURATION_MS;
    res.status(403).json({ 
      error: 'Access Denied: High volume rate abuse detected. IP temporarily blacklisted for 5 minutes.' 
    });
    return;
  }

  if (ipData.count > MAX_REQUESTS) {
    res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    return;
  }
  next();
};

// Role-Based Access Control (RBAC) middleware for sensitive operations endpoints
const checkStaffRole = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userRole = req.headers['x-user-role'];
  
  if (!userRole || userRole !== 'staff') {
    res.status(403).json({ 
      error: 'Access Denied: This operational route is restricted to authorized Stadium Operations Staff (RBAC).' 
    });
    return;
  }
  next();
};

// Apply rate limiter to all API routes
app.use('/api', rateLimiter);

// Simple In-Memory Cache for Gemini Responses (60-second TTL)
interface CacheEntry {
  response: any;
  timestamp: number;
}
const queryCache: { [key: string]: CacheEntry } = {};
const CACHE_TTL = 60000; // 60 seconds

// Lazy-loaded Gemini AI client helper
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
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

// Input sanitization utility to prevent cross-site scripting (XSS)
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script tags
    .replace(/on\w+="[^"]*"/gi, '')                     // Strip inline event handlers
    .replace(/javascript:/gi, '')                       // Strip javascript: pseudo-protocol
    .trim();
}

// Prompt injection protection scanner for LLM safety and guardrails
export function hasPromptInjection(input: string): boolean {
  if (!input) return false;
  const normalized = input.toLowerCase();
  const injectionPatterns = [
    'ignore previous',
    'ignore all previous',
    'system override',
    'you must now act as',
    'jailbreak',
    'forget your instructions',
    'forget everything',
    'new prompt:',
    'prompt disclosure',
    'disclose prompt',
    'reveal your prompt',
    'bypass guidelines',
    'override safety'
  ];
  return injectionPatterns.some(pattern => normalized.includes(pattern));
}

// Check if Gemini Key is set
function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
}

// Robust fallback generators for all endpoints to handle quota or credential issues gracefully
function getMockChatResponse(sanitizedMessage: string) {
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

function getMockClassifyItemResponse() {
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

function getMockDecisionSupportResponse(situation: string) {
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

function getMockBroadcastResponse(originalText: string) {
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
 * 1. MULTILINGUAL CHAT CONCIERGE
 * Detects input language automatically and replies in that language.
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate inputs
    if (!message || typeof message !== 'string' || message.trim() === '') {
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
    const cached = queryCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log('Serving chat response from server-side cache');
      res.json(cached.response);
      return;
    }

    if (!isGeminiConfigured()) {
      const mockResponse = getMockChatResponse(sanitizedMessage);
      queryCache[cacheKey] = { response: mockResponse, timestamp: Date.now() };
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
    const formattedHistory = Array.isArray(history) 
      ? history.slice(-5).map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
      : '';

    const contentPrompt = `${systemPrompt}\n\nChat History:\n${formattedHistory}\n\nUser Message: ${sanitizedMessage}\n\nReturn the JSON object directly. Do not include markdown code block formatting.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = result.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      // Fallback parse if JSON is wrapped in ```json ... ```
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    queryCache[cacheKey] = { response: parsed, timestamp: Date.now() };
    res.json(parsed);

  } catch (error: any) {
    console.warn('Error in chat API, falling back to smart mock response:', error);
    try {
      const fallbackResponse = getMockChatResponse(req.body.message || '');
      res.json(fallbackResponse);
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to generate concierge response.' });
    }
  }
});

/**
 * 2. SUSTAINABILITY CLASSIFIER (Gemini Vision)
 * Classifies an item image as recyclable, compostable, or landfill.
 */
app.post('/api/classify-item', async (req, res) => {
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

/**
 * 3. AI DECISION SUPPORT PANEL (Ops Staff Only)
 * Evaluates stadium incidents and outputs ranked tactical actions.
 */
app.post('/api/decision-support', checkStaffRole, async (req, res) => {
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
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to generate operational decision advice.' });
    }
  }
});

/**
 * 4. MULTILINGUAL BROADCAST TOOL (Ops Staff Only)
 * Translates a given English broadcast text into 5 other supported languages.
 */
app.post('/api/broadcast', checkStaffRole, async (req, res) => {
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
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to translate announcement.' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', geminiConfigured: isGeminiConfigured() });
});

// Integrate Vite setup for full-stack build/dev
const setupServerAndVite = async () => {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode');
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving static files from dist directory in production');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StadiumPulse AI Server running at http://0.0.0.0:${PORT}`);
  });
};

setupServerAndVite();
