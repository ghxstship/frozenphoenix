-- Migration: Extend login_event_type enum with org_security_updated
-- Fixes: FIND-018 — event_type values used in app code but missing from DB enum

ALTER TYPE login_event_type ADD VALUE IF NOT EXISTS 'org_security_updated';
