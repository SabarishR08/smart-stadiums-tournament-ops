import { describe, it, expect } from 'vitest';

function sanitizeInputLocal(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

describe('Input Sanitization & XSS Mitigation', () => {
  it('should strip script tags successfully', () => {
    const raw = 'Hello <script>alert("hack")</script> World';
    expect(sanitizeInputLocal(raw)).toBe('Hello  World');
  });

  it('should strip inline event handlers', () => {
    const raw = 'Hello <div onload="alert(1)">World</div>';
    expect(sanitizeInputLocal(raw)).toBe('Hello <div >World</div>');
  });

  it('should strip javascript pseudo-protocols', () => {
    const raw = 'javascript:alert(1)';
    expect(sanitizeInputLocal(raw)).toBe('alert(1)');
  });
});
