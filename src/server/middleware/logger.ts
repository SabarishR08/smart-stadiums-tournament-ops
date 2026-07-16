/**
 * Logger Middleware
 * Basic request logger
 */

import express from 'express';

export const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
