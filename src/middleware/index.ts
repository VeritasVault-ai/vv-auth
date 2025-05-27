/**
 * Authentication Middleware for Next.js
 * 
 * This module exports middleware functions and utilities for protecting routes
 * in Next.js applications, supporting both App Router and Pages Router.
 * 
 * @module middleware
 */

import { createAuthMiddleware } from './auth-middleware';

export {
  // Main middleware function
  createAuthMiddleware
};

// Default export for convenience
export default createAuthMiddleware;
