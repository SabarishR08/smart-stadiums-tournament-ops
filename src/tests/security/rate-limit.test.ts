import { describe, it, expect } from 'vitest';

interface IpLimitData {
  count: number;
  resetTime: number;
  blacklistedUntil?: number;
}

const ipLimits: { [ip: string]: IpLimitData } = {};
const WINDOW_MS = 60000;
const MAX_REQUESTS = 50;
const BLACKLIST_DURATION_MS = 300000;

function simulateRateLimit(ip: string, now: number): { allowed: boolean; status: number; message?: string } {
  const ipData = ipLimits[ip];

  if (ipData && ipData.blacklistedUntil && now < ipData.blacklistedUntil) {
    return {
      allowed: false,
      status: 403,
      message: `Blacklisted for ${Math.ceil((ipData.blacklistedUntil - now) / 1000)}s`
    };
  }

  if (!ipData) {
    ipLimits[ip] = { count: 1, resetTime: now + WINDOW_MS };
    return { allowed: true, status: 200 };
  }

  if (now > ipData.resetTime) {
    ipData.count = 1;
    ipData.resetTime = now + WINDOW_MS;
    return { allowed: true, status: 200 };
  }

  ipData.count++;

  if (ipData.count > MAX_REQUESTS * 1.5) {
    ipData.blacklistedUntil = now + BLACKLIST_DURATION_MS;
    return { allowed: false, status: 403, message: 'Blacklisted for abuse' };
  }

  if (ipData.count > MAX_REQUESTS) {
    return { allowed: false, status: 429, message: 'Too many requests' };
  }

  return { allowed: true, status: 200 };
}

describe('Security: Rate Limiting Sliding Window with IP Blacklisting', () => {
  it('should allow requests under the 50/min limit', () => {
    const now = Date.now();
    for (let i = 1; i <= 40; i++) {
      const result = simulateRateLimit('192.168.1.1', now + i);
      expect(result.allowed).toBe(true);
      expect(result.status).toBe(200);
    }
  });

  it('should block requests exceeding 50/min with HTTP 429', () => {
    const now = Date.now();
    const testIp = '192.168.1.2';
    
    for (let i = 1; i <= 50; i++) {
      simulateRateLimit(testIp, now + i);
    }

    const result = simulateRateLimit(testIp, now + 51);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(429);
  });

  it('should blacklist IPs exceeding 75/min with HTTP 403', () => {
    const now = Date.now();
    const testIp = '192.168.1.3';
    
    for (let i = 1; i <= 76; i++) {
      simulateRateLimit(testIp, now + i);
    }

    const result = simulateRateLimit(testIp, now + 77);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });

  it('should reset sliding window after 60 seconds', () => {
    const now = Date.now();
    const testIp = '192.168.1.5';
    
    for (let i = 1; i <= 50; i++) {
      simulateRateLimit(testIp, now + i);
    }

    const afterWindow = now + 61000;
    const result = simulateRateLimit(testIp, afterWindow);
    expect(result.allowed).toBe(true);
  });
});
