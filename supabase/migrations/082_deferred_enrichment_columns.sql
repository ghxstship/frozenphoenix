-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 082: Deferred Enrichment Columns
-- ═══════════════════════════════════════════════════════════════════════════
--
-- These columns were identified in SCHEMA_OPTIMIZATION_AND_ENRICHMENT_PLAN.md
-- as P3 items for migration 079 but were deferred due to scope. Additionally
-- includes columns identified in SCHEMA_OPTIMIZATION_PASS_2.md §5 per-
-- workstream gap analysis.
--
-- References: SCHEMA_OPTIMIZATION_PASS_2.md §2.3, §5
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: Workstream A — Identity & Organization
-- ─────────────────────────────────────────────────────────────────────────────

-- invitations: bulk invite limits
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS max_uses INTEGER,
  ADD COLUMN IF NOT EXISTS use_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE invitations
  ADD CONSTRAINT invitations_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0);

COMMENT ON COLUMN invitations.max_uses IS
  'Maximum number of times this invitation link can be used. NULL = unlimited.';
COMMENT ON COLUMN invitations.use_count IS
  'Current usage count. Incremented on each acceptance.';

-- departments: GAAP cost allocation
ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS cost_center_code TEXT;

COMMENT ON COLUMN departments.cost_center_code IS
  'GAAP cost center code for financial allocation (e.g., "CC-4200").';

-- teams: resource planning ceiling
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER;

ALTER TABLE teams
  ADD CONSTRAINT teams_max_capacity_positive CHECK (max_capacity IS NULL OR max_capacity > 0);

COMMENT ON COLUMN teams.max_capacity IS
  'Maximum headcount for resource planning. NULL = no limit.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: Workstream B — Projects & Financial
-- ─────────────────────────────────────────────────────────────────────────────

-- projects: CSAT aggregate + weather contingency
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS csat_score NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS weather_contingency_plan TEXT,
  ADD COLUMN IF NOT EXISTS post_mortem_score NUMERIC(5,2);

ALTER TABLE projects
  ADD CONSTRAINT projects_csat_score_range CHECK (csat_score IS NULL OR csat_score BETWEEN 0 AND 10);
ALTER TABLE projects
  ADD CONSTRAINT projects_post_mortem_score_range CHECK (post_mortem_score IS NULL OR post_mortem_score BETWEEN 0 AND 100);

COMMENT ON COLUMN projects.csat_score IS
  'Aggregate client satisfaction score from survey_responses (0-10 NPS scale).';
COMMENT ON COLUMN projects.weather_contingency_plan IS
  'Weather contingency plan text for outdoor events.';
COMMENT ON COLUMN projects.post_mortem_score IS
  'Internal post-mortem score (0-100). Populated after project wrap.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: Workstream C — CRM & Pipeline
-- ─────────────────────────────────────────────────────────────────────────────

-- contacts: dietary restrictions for event hospitality
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT;

COMMENT ON COLUMN contacts.dietary_restrictions IS
  'Dietary restrictions/allergies for event catering and hospitality.';

-- case_studies: commercial parity columns
ALTER TABLE case_studies
  ADD COLUMN IF NOT EXISTS industry_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS client_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS testimonial_quote TEXT;

COMMENT ON COLUMN case_studies.industry_tags IS
  'Industry classification tags for filtering (e.g., ["festivals", "experiential"]).';
COMMENT ON COLUMN case_studies.client_approved IS
  'Whether the client has approved this case study for public use.';
COMMENT ON COLUMN case_studies.testimonial_quote IS
  'Pull quote from client for marketing use.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: Workstream D — Production & Live Events
-- ─────────────────────────────────────────────────────────────────────────────

-- post_event_reports: NPS + carbon footprint
ALTER TABLE post_event_reports
  ADD COLUMN IF NOT EXISTS nps_score NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS carbon_footprint_kg NUMERIC(10,2);

ALTER TABLE post_event_reports
  ADD CONSTRAINT per_nps_score_range CHECK (nps_score IS NULL OR nps_score BETWEEN -100 AND 100);
ALTER TABLE post_event_reports
  ADD CONSTRAINT per_carbon_footprint_positive CHECK (carbon_footprint_kg IS NULL OR carbon_footprint_kg >= 0);

COMMENT ON COLUMN post_event_reports.nps_score IS
  'Net Promoter Score from post-event survey (-100 to +100).';
COMMENT ON COLUMN post_event_reports.carbon_footprint_kg IS
  'Total event carbon footprint in kilograms for ESG reporting.';

-- technical_specs: engineering signoffs
ALTER TABLE technical_specs
  ADD COLUMN IF NOT EXISTS structural_engineer_signoff BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pe_stamp_document_url TEXT;

COMMENT ON COLUMN technical_specs.structural_engineer_signoff IS
  'Whether a licensed structural engineer has signed off on this spec.';
COMMENT ON COLUMN technical_specs.pe_stamp_document_url IS
  'URL to PE-stamped document in Supabase Storage.';

-- work_packages: safety planning
ALTER TABLE work_packages
  ADD COLUMN IF NOT EXISTS safety_plan_required BOOLEAN DEFAULT false;

COMMENT ON COLUMN work_packages.safety_plan_required IS
  'OSHA flag — whether this work package requires a site-specific safety plan.';

-- production_runs: ESG waste tracking
ALTER TABLE production_runs
  ADD COLUMN IF NOT EXISTS environmental_waste_kg NUMERIC(10,2);

ALTER TABLE production_runs
  ADD CONSTRAINT pr_environmental_waste_positive CHECK (environmental_waste_kg IS NULL OR environmental_waste_kg >= 0);

COMMENT ON COLUMN production_runs.environmental_waste_kg IS
  'Total waste generated during production run (kg) for ESG reporting.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: Workstream H — RBAC & Settings
-- ─────────────────────────────────────────────────────────────────────────────

-- brands: white-label vanity URLs
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS custom_domain TEXT;

ALTER TABLE brands
  ADD CONSTRAINT brands_custom_domain_unique UNIQUE (custom_domain);

COMMENT ON COLUMN brands.custom_domain IS
  'White-label vanity domain (e.g., "app.clientbrand.com"). Must be unique across all tenants.';

-- feature_flags: gradual rollout
ALTER TABLE feature_flags
  ADD COLUMN IF NOT EXISTS rollout_percentage_step INTEGER DEFAULT 10;

ALTER TABLE feature_flags
  ADD CONSTRAINT ff_rollout_step_range CHECK (rollout_percentage_step IS NULL OR rollout_percentage_step BETWEEN 1 AND 100);

COMMENT ON COLUMN feature_flags.rollout_percentage_step IS
  'Percentage increment for gradual rollout automation (1-100).';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: Workstream I — Assets, Inventory & Logistics
-- ─────────────────────────────────────────────────────────────────────────────

-- assets: QR/barcode + calibration
ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
  ADD COLUMN IF NOT EXISTS last_calibration_date DATE;

COMMENT ON COLUMN assets.qr_code_url IS
  'URL to generated QR/barcode image for scan-based asset tracking.';
COMMENT ON COLUMN assets.last_calibration_date IS
  'Last calibration date for precision equipment requiring periodic calibration.';

-- shipments: international logistics
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS customs_clearance_status TEXT,
  ADD COLUMN IF NOT EXISTS bill_of_lading_number TEXT;

COMMENT ON COLUMN shipments.customs_clearance_status IS
  'Customs status for international shipments (e.g., "pending", "cleared", "held").';
COMMENT ON COLUMN shipments.bill_of_lading_number IS
  'Bill of lading number for ocean/air freight tracking.';

-- vehicles: insurance linkage
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;

COMMENT ON COLUMN vehicles.insurance_policy_number IS
  'Vehicle insurance policy number for fleet insurance tracking.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: Workstream J — Documents & Digital Assets
-- ─────────────────────────────────────────────────────────────────────────────

-- brand_kits: voice guidelines
ALTER TABLE brand_kits
  ADD COLUMN IF NOT EXISTS brand_voice_guidelines TEXT,
  ADD COLUMN IF NOT EXISTS do_not_use_notes TEXT;

COMMENT ON COLUMN brand_kits.brand_voice_guidelines IS
  'Brand voice and tone guidelines for creative teams.';
COMMENT ON COLUMN brand_kits.do_not_use_notes IS
  'Explicit "do not use" list for brand compliance.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: Workstream K — Compliance
-- ─────────────────────────────────────────────────────────────────────────────

-- insurance_policies: coverage detail
ALTER TABLE insurance_policies
  ADD COLUMN IF NOT EXISTS waiver_of_subrogation BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS per_occurrence_limit NUMERIC(12,2);

ALTER TABLE insurance_policies
  ADD CONSTRAINT ip_per_occurrence_positive CHECK (per_occurrence_limit IS NULL OR per_occurrence_limit >= 0);

COMMENT ON COLUMN insurance_policies.waiver_of_subrogation IS
  'Whether the policy includes waiver of subrogation clause.';
COMMENT ON COLUMN insurance_policies.per_occurrence_limit IS
  'Per-occurrence coverage limit in policy currency.';

-- permits: jurisdiction detail
ALTER TABLE permits
  ADD COLUMN IF NOT EXISTS jurisdiction_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS conditions_of_approval TEXT;

COMMENT ON COLUMN permits.jurisdiction_contact_phone IS
  'Phone number of issuing jurisdiction contact for renewals/questions.';
COMMENT ON COLUMN permits.conditions_of_approval IS
  'Special conditions or restrictions attached to the permit.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: Workstream L — Vendor & Workforce
-- ─────────────────────────────────────────────────────────────────────────────

-- worker_compliance_docs: automated reminders
-- Note: vendor_compliance_docs was dropped in 069, canonical table is worker_compliance_docs (011)
ALTER TABLE worker_compliance_docs
  ADD COLUMN IF NOT EXISTS auto_reminder_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER DEFAULT 30;

ALTER TABLE worker_compliance_docs
  ADD CONSTRAINT wcd_reminder_days_positive CHECK (reminder_days_before IS NULL OR reminder_days_before > 0);

COMMENT ON COLUMN worker_compliance_docs.auto_reminder_enabled IS
  'Whether to send automated renewal reminders before expiry.';
COMMENT ON COLUMN worker_compliance_docs.reminder_days_before IS
  'Number of days before expiry to send the first reminder.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: Workstream M — Location & Spatial
-- ─────────────────────────────────────────────────────────────────────────────

-- location_contacts: availability + emergency flag
ALTER TABLE location_contacts
  ADD COLUMN IF NOT EXISTS available_hours TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact BOOLEAN DEFAULT false;

COMMENT ON COLUMN location_contacts.available_hours IS
  'Hours this contact is available (e.g., "Mon-Fri 9am-5pm EST").';
COMMENT ON COLUMN location_contacts.emergency_contact IS
  'Whether this is an emergency/after-hours contact for the location.';

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: Missing composite indexes from Pass 2 §7
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_record_comments_entity_created
  ON record_comments(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity_created
  ON activity_log(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_automation_executions_automation_started
  ON automation_executions(automation_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_domain_events_status_created
  ON domain_events(status, created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_events_connection_status
  ON webhook_events(connection_id, status, received_at);

COMMIT;
