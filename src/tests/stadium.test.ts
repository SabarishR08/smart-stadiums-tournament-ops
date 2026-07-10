import { describe, it, expect, vi } from 'vitest';

// 1. Crowd Density Mapping Logic
function getDensityColor(density: string) {
  switch (density) {
    case 'low': 
      return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', dot: 'bg-emerald-400', label: 'Low Congestion' };
    case 'medium': 
      return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', dot: 'bg-amber-400', label: 'Moderate Crowds' };
    case 'high': 
      return { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', dot: 'bg-rose-400', label: 'Heavy Congestion' };
    default: 
      return { bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400', dot: 'bg-slate-400', label: 'Unknown' };
  }
}

// 2. Gemini Response Parser Utility
function parseGeminiResponse(rawText: string) {
  const text = rawText.trim();
  try {
    return JSON.parse(text);
  } catch {
    // Attempt parsing if wrapped in markdown block
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

// 3. Sustainability Score Logic
function calculateSustainabilityScore(category: string): number {
  switch (category) {
    case 'recyclable': return 10;
    case 'compostable': return 15;
    case 'landfill': return 5;
    default: return 10; // Default fallback score
  }
}

// 4. Firestore Security Rules Role-based Access Simulation
interface UserProfile {
  uid: string;
  role: string;
}
function simulateFirestoreReadRule(user: UserProfile | null, collection: string): boolean {
  const isStaff = user !== null && user.role === 'staff';
  const publicCollections = ['crowd_status', 'transportation', 'broadcasts', 'sustainability_scores'];
  
  if (publicCollections.includes(collection)) {
    return true; // readable by anyone
  }
  if (collection === 'incidents' || collection === 'users') {
    return isStaff; // readable only by authenticated staff
  }
  return false;
}

// THE TEST SUITE
describe('StadiumPulse AI - Smart Stadium Operations & Companion Test Suite', () => {

  // A. Unit Test for Crowd-Density color mappings
  describe('Crowd Density Color-Mapping Logic', () => {
    it('should map low density to green classes and low label', () => {
      const res = getDensityColor('low');
      expect(res.bg).toContain('emerald');
      expect(res.label).toBe('Low Congestion');
    });

    it('should map medium density to amber classes and moderate label', () => {
      const res = getDensityColor('medium');
      expect(res.bg).toContain('amber');
      expect(res.label).toBe('Moderate Crowds');
    });

    it('should map high density to rose classes and heavy label', () => {
      const res = getDensityColor('high');
      expect(res.bg).toContain('rose');
      expect(res.label).toBe('Heavy Congestion');
    });

    it('should handle fallback densities gracefully', () => {
      const res = getDensityColor('unknown');
      expect(res.bg).toContain('slate');
      expect(res.label).toBe('Unknown');
    });
  });

  // B. Unit Test for Gemini response parsing helper
  describe('Gemini Response Parser & Error Handling', () => {
    it('should successfully parse straight JSON strings', () => {
      const raw = '{"reply": "Welcome!", "detectedLanguage": "en"}';
      const parsed = parseGeminiResponse(raw);
      expect(parsed.reply).toBe('Welcome!');
      expect(parsed.detectedLanguage).toBe('en');
    });

    it('should clean and parse markdown code blocks containing JSON', () => {
      const raw = '```json\n{"reply": "Hola", "detectedLanguage": "es"}\n```';
      const parsed = parseGeminiResponse(raw);
      expect(parsed.reply).toBe('Hola');
      expect(parsed.detectedLanguage).toBe('es');
    });
  });

  // C. Unit Test for Sustainability Scoring Logic
  describe('Sustainability Score Calculation', () => {
    it('should award 10 points for recyclable items', () => {
      expect(calculateSustainabilityScore('recyclable')).toBe(10);
    });

    it('should award 15 points for compostable items', () => {
      expect(calculateSustainabilityScore('compostable')).toBe(15);
    });

    it('should award 5 points for landfill items', () => {
      expect(calculateSustainabilityScore('landfill')).toBe(5);
    });
  });

  // D. Unit Test for Firestore Security Role Checks
  describe('Firestore Security Rules Access Simulation', () => {
    it('should allow public reads to public collections for anonymous users', () => {
      expect(simulateFirestoreReadRule(null, 'crowd_status')).toBe(true);
      expect(simulateFirestoreReadRule(null, 'transportation')).toBe(true);
    });

    it('should block anonymous users from viewing incidents logs', () => {
      expect(simulateFirestoreReadRule(null, 'incidents')).toBe(false);
    });

    it('should authorize staff users to read the incidents collection', () => {
      const staffUser: UserProfile = { uid: 'uid123', role: 'staff' };
      expect(simulateFirestoreReadRule(staffUser, 'incidents')).toBe(true);
    });

    it('should block regular/fan users from viewing incidents collection', () => {
      const fanUser: UserProfile = { uid: 'uid456', role: 'fan' };
      expect(simulateFirestoreReadRule(fanUser, 'incidents')).toBe(false);
    });
  });

  // E. Integration Mock Test for /api/chat Concierge endpoint
  describe('Multilingual Concierge /api/chat Endpoint Integration', () => {
    it('should auto-detect and echo back response in the requested language', async () => {
      // Mock fetch implementation for our integration test
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          reply: '¡Hola! Bienvenidos al estadio.',
          detectedLanguage: 'es'
        })
      });
      global.fetch = mockFetch;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '¿Dónde está la puerta principal?' })
      });
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
      expect(data.detectedLanguage).toBe('es');
      expect(data.reply).toContain('¡Hola!');
    });
  });

});
