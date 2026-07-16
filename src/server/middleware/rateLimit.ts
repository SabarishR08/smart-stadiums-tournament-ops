/**
 * Rate Limiting Middleware
 * Advanced Sliding Window Rate Limiter with IP Blacklisting
 */

import express from 'express';

interface IpLimitData {
  count: number;
  resetTime: number;
  blacklistedUntil?: number;
}

const ipLimits: { [ip: string]: IpLimitData } = {};

const WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS = 50; // Max 50 requests/min
const BLACKLIST_DURATION_MS = 300000; // 5 minutes penalty

export const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown-ip';
  const now = Date.now();

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
