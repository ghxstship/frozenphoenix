-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 075: SAFETY & COMPLIANCE ENRICHMENT (P0)
-- ═══════════════════════════════════════════════════════════════════════════
-- Priority: CRITICAL — Safety, security, compliance blockers
-- Source: SCHEMA_OPTIMIZATION_AND_ENRICHMENT_PLAN.md §19 Migration 075
-- Tables modified: permission_grants, crew_members, contacts, tasks,
--   live_event_instances, vehicles, certifications, shipments,
--   environmental_readings
-- Deprecations: roles (002), permissions (002)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. permission_grants: temporal access + delegation audit (SOC2 CC6.1)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE permission_grants
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_permission_grants_expires
  ON permission_grants(expires_at)
  WHERE expires_at IS NOT NULL;

COMMENT ON COLUMN permission_grants.expires_at IS
  'Temporal permission grant expiry; contractor access windows. SOC2 CC6.1.';
COMMENT ON COLUMN permission_grants.granted_by IS
  'User who delegated this permission; audit trail. SOC2 CC6.1.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. crew_members: OSHA 1910.38 emergency contact (safety-critical)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

COMMENT ON COLUMN crew_members.emergency_contact_name IS
  'OSHA 1910.38 emergency action plan — safety-critical, never paywalled.';
COMMENT ON COLUMN crew_members.emergency_contact_phone IS
  'OSHA 1910.38 emergency contact — safety-critical, never paywalled.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. contacts: GDPR Art. 7 consent + CAN-SPAM opt-out
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS communication_opt_out BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN contacts.gdpr_consent_at IS
  'GDPR Art. 7 — timestamp of explicit consent to process personal data.';
COMMENT ON COLUMN contacts.communication_opt_out IS
  'CAN-SPAM / CCPA / GDPR — global communication opt-out flag.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. tasks: OSHA rigging/electrical/pyro safety flag
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS safety_critical BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN tasks.safety_critical IS
  'OSHA rigging, electrical, pyrotechnics flagging — safety-critical tasks require certified crew.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. live_event_instances: fire code + EMS life safety
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE live_event_instances
  ADD COLUMN IF NOT EXISTS fire_marshal_capacity INTEGER CHECK (fire_marshal_capacity > 0),
  ADD COLUMN IF NOT EXISTS emergency_services_notified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS weather_hold_threshold JSONB;

COMMENT ON COLUMN live_event_instances.fire_marshal_capacity IS
  'Legal occupancy limit per fire code — safety-critical.';
COMMENT ON COLUMN live_event_instances.emergency_services_notified IS
  'Pre-event notification to local EMS/fire/police — safety-critical.';
COMMENT ON COLUMN live_event_instances.weather_hold_threshold IS
  'Wind speed/lightning/heat index thresholds for weather holds. JSON: {wind_mph, lightning_miles, heat_index_f}.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. vehicles: DOT 49 CFR annual inspection compliance
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS last_inspection_date DATE,
  ADD COLUMN IF NOT EXISTS next_inspection_due DATE;

COMMENT ON COLUMN vehicles.last_inspection_date IS
  'DOT 49 CFR annual inspection — compliance-critical for CDL vehicles.';
COMMENT ON COLUMN vehicles.next_inspection_due IS
  'Proactive DOT inspection flagging — compliance-critical.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. certifications: regulatory source + proactive compliance
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE certifications
  ADD COLUMN IF NOT EXISTS issuing_authority TEXT,
  ADD COLUMN IF NOT EXISTS renewal_reminder_days INTEGER DEFAULT 30 CHECK (renewal_reminder_days > 0);

COMMENT ON COLUMN certifications.issuing_authority IS
  'OSHA, NFPA, state agency — regulatory source tracking.';
COMMENT ON COLUMN certifications.renewal_reminder_days IS
  'Days before expiry to trigger notification. Compliance gate.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. shipments: DOT HAZMAT classification
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS hazmat_class TEXT;

COMMENT ON COLUMN shipments.hazmat_class IS
  'DOT HAZMAT shipping classification (pyrotechnics, compressed gases) — safety-critical.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. environmental_readings: OSHA/NIOSH heat stress index
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE environmental_readings
  ADD COLUMN IF NOT EXISTS wet_bulb_globe_temp NUMERIC(5,2);

COMMENT ON COLUMN environmental_readings.wet_bulb_globe_temp IS
  'OSHA/NIOSH WBGT heat stress index — worker safety standard for outdoor events.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Deprecate legacy RBAC tables (002) — superseded by 028
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'roles') THEN
    COMMENT ON TABLE roles IS 'DEPRECATED: Use role_definitions (028). Do not add new references.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'permissions') THEN
    COMMENT ON TABLE permissions IS 'DEPRECATED: Use permission_grants (028). Do not add new references.';
  END IF;
END $$;

COMMIT;
