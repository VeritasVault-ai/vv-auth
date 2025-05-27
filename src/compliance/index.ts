/**
 * Compliance Module for vv-auth
 * 
 * This module exports all compliance-related functionality for the vv-auth package,
 * including audit logging, risk assessment, and compliance utilities for DeFi applications.
 * 
 * @module compliance
 */

import { AuditLogger, AuditEventType } from './audit-logger';

// Export all audit logging components
export {
  // Main classes
  AuditLogger,
  
  // Enums
  AuditEventType
};

// Export singleton instance
export const auditLogger = new AuditLogger();
