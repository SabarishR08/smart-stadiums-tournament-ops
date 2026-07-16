import { describe, it, expect } from 'vitest';

// Crowd Density Mapping Logic
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
