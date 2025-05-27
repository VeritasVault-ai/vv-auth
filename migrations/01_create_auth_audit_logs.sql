-- Migration: 01_create_auth_audit_logs.sql
-- Description: Creates the auth_audit_logs table and related indexes for compliance features

-- Create the auth_audit_logs table
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  risk_level TEXT NOT NULL DEFAULT 'low',
  was_successful BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  session_id TEXT,
  geo_location JSONB,
  device_info JSONB,
  network_info JSONB,
  previous_value JSONB,
  new_value JSONB,
  related_entities JSONB,
  hash_value TEXT,
  previous_entry_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_timestamp ON auth_audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event_type ON auth_audit_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_risk_level ON auth_audit_logs (risk_level);
