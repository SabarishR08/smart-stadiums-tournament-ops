/**
 * RBAC Middleware
 * Role-Based Access Control for sensitive operations endpoints
 */

import express from 'express';

/**
 * Check Staff Role Middleware
 * Ensures only staff members can access protected endpoints
 */
export const checkStaffRole = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userRole = req.headers['x-user-role'];
  
  if (!userRole || userRole !== 'staff') {
    res.status(403).json({ 
      error: 'Access Denied: This operational route is restricted to authorized Stadium Operations Staff (RBAC).' 
    });
    return;
  }
  next();
};
