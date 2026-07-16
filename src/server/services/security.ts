/**
 * Security Service
 * Input sanitization and prompt injection detection
 */

/**
 * Input sanitization utility to prevent cross-site scripting (XSS)
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script tags
    .replace(/on\w+="[^"]*"/gi, '')                     // Strip inline event handlers
    .replace(/javascript:/gi, '')                       // Strip javascript: pseudo-protocol
    .trim();
}

/**
 * Prompt injection protection scanner for LLM safety and guardrails
 */
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
