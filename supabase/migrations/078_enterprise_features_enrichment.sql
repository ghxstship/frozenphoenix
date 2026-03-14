-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 078: ENTERPRISE FEATURES ENRICHMENT (P2)
-- ═══════════════════════════════════════════════════════════════════════════
-- Priority: MEDIUM — Enterprise tier columns + enum hygiene
-- Source: SCHEMA_OPTIMIZATION_AND_ENRICHMENT_PLAN.md §19 Migration 078
-- Tables modified: organizations, user_profiles, vendors, crew_members,
--   payroll_batches, client_invoices, digital_assets, locations,
--   contracts, notification_preferences, worker_profiles
-- New enums: vendor_status, certification_type
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUM DEFINITIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- vendor_status: replaces TEXT CHECK on vendors.status
DO $$ BEGIN
  CREATE TYPE vendor_status AS ENUM (
    'active', 'inactive', 'pending', 'suspended', 'blacklisted'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- certification_type: replaces TEXT CHECK on certifications.type
DO $$ BEGIN
  CREATE TYPE certification_type AS ENUM (
    'osha_10', 'osha_30', 'rigging', 'electrical', 'forklift', 'first_aid', 'cpr',
    'pyrotechnics', 'fall_protection', 'confined_space', 'hazmat', 'cdl',
    'stage_combat', 'fire_safety', 'food_handler', 'alcohol_server'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. organizations: billing, currency, GAAP, soft-delete
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS billing_email TEXT,
  ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'USD' CHECK (length(default_currency) = 3),
  ADD COLUMN IF NOT EXISTS fiscal_year_start_month INTEGER DEFAULT 1 CHECK (fiscal_year_start_month >= 1 AND fiscal_year_start_month <= 12),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN organizations.tax_id IS
  'IRS EIN / GAAP invoicing — enterprise tier, encrypted at rest.';
COMMENT ON COLUMN organizations.billing_email IS
  'Billing contact email separated from org admin.';
COMMENT ON COLUMN organizations.default_currency IS
  'ISO 4217 default currency for the organization.';
COMMENT ON COLUMN organizations.fiscal_year_start_month IS
  'GAAP/IFRS fiscal year start month (1=Jan, 4=Apr, 7=Jul, 10=Oct).';
COMMENT ON COLUMN organizations.deleted_at IS
  'SOC2 CC8.1 soft-delete timestamp. NULL = active.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. user_profiles: i18n, timezone, emergency contact
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS preferred_locale TEXT NOT NULL DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS emergency_contact_json JSONB;

COMMENT ON COLUMN user_profiles.preferred_locale IS
  'GDPR Art. 12 — user language preference for i18n.';
COMMENT ON COLUMN user_profiles.timezone IS
  'IANA timezone for global crew scheduling.';
COMMENT ON COLUMN user_profiles.emergency_contact_json IS
  'OSHA 1910.38 — {name, phone, relationship}. Safety-critical.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. vendors: tax, payment, insurance, diversity, preferred
--    Note: w9_uploaded already exists in 001_initial_schema
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_terms_default TEXT,
  ADD COLUMN IF NOT EXISTS insurance_minimum_required NUMERIC(12,2) CHECK (insurance_minimum_required >= 0),
  ADD COLUMN IF NOT EXISTS diversity_classification TEXT,
  ADD COLUMN IF NOT EXISTS preferred_vendor BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN vendors.tax_id IS
  '1099 reporting — IRS requirement for vendors >$600/yr. Enterprise tier, encrypted.';
COMMENT ON COLUMN vendors.payment_terms_default IS
  'Default payment terms (Net-30, Net-60). Procurement optimization.';
COMMENT ON COLUMN vendors.insurance_minimum_required IS
  'Minimum COI coverage amount. Liability management.';
COMMENT ON COLUMN vendors.diversity_classification IS
  'MBE/WBE/SDVOB — government contract compliance.';
COMMENT ON COLUMN vendors.preferred_vendor IS
  'Preferred vendor program flag — procurement optimization.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. crew_members: I-9, W-9 enterprise compliance
--    Note: w9 fields are on crew_members (contractors), distinct from vendors.w9_uploaded
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS i9_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS i9_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS w9_uploaded BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN crew_members.i9_verified IS
  'USCIS I-9 employment eligibility verification. Enterprise tier, audit logged.';
COMMENT ON COLUMN crew_members.i9_verified_at IS
  'I-9 verification timestamp for audit trail.';
COMMENT ON COLUMN crew_members.w9_uploaded IS
  'IRS W-9 for 1099 contractor reporting. Enterprise tier.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. payroll_batches: tax, union, workers comp
--    Note: project_id already exists (003_production_lifecycle)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE payroll_batches
  ADD COLUMN IF NOT EXISTS tax_withholding_total NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS union_dues_total NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS workers_comp_total NUMERIC(12,2);

COMMENT ON COLUMN payroll_batches.tax_withholding_total IS
  'Federal/state tax withholding — IRS compliance.';
COMMENT ON COLUMN payroll_batches.union_dues_total IS
  'IATSE/Teamsters/SAG-AFTRA union dues deductions.';
COMMENT ON COLUMN payroll_batches.workers_comp_total IS
  'Workers compensation allocation.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. client_invoices: ASC 606 revenue recognition
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE client_invoices
  ADD COLUMN IF NOT EXISTS asc_606_recognized_at TIMESTAMPTZ;

COMMENT ON COLUMN client_invoices.asc_606_recognized_at IS
  'ASC 606 revenue recognition event timestamp — GAAP compliance.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. digital_assets: AI disclosure, model release
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE digital_assets
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS model_release_on_file BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN digital_assets.ai_generated IS
  'FTC / EU AI Act content disclosure requirement.';
COMMENT ON COLUMN digital_assets.model_release_on_file IS
  'Talent/model release for commercial use — IP protection.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. locations: ADA, noise
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS ada_compliant BOOLEAN,
  ADD COLUMN IF NOT EXISTS ada_notes TEXT,
  ADD COLUMN IF NOT EXISTS noise_ordinance_curfew TEXT;

COMMENT ON COLUMN locations.ada_compliant IS
  'ADA Title III compliance flag — venue accessibility.';
COMMENT ON COLUMN locations.ada_notes IS
  'Specific accessibility features and limitations.';
COMMENT ON COLUMN locations.noise_ordinance_curfew IS
  'Local noise ordinance cutoff time (e.g., "10:00 PM").';

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. contracts: indemnification, jurisdiction
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS indemnification_clause BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS jurisdiction TEXT;

COMMENT ON COLUMN contracts.indemnification_clause IS
  'Liability tracking — legal review flag.';
COMMENT ON COLUMN contracts.jurisdiction IS
  'Governing law jurisdiction — international operations.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. notification_preferences: quiet hours, digest
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS quiet_hours_start TEXT,
  ADD COLUMN IF NOT EXISTS quiet_hours_end TEXT,
  ADD COLUMN IF NOT EXISTS digest_frequency TEXT DEFAULT 'realtime'
    CHECK (digest_frequency IN ('realtime', 'daily', 'weekly'));

COMMENT ON COLUMN notification_preferences.quiet_hours_start IS
  'Do-not-disturb window start (HH:MM format).';
COMMENT ON COLUMN notification_preferences.quiet_hours_end IS
  'Do-not-disturb window end (HH:MM format).';
COMMENT ON COLUMN notification_preferences.digest_frequency IS
  'Email digest cadence: realtime, daily, or weekly.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. worker_profiles: background check, drug test (DOT)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE worker_profiles
  ADD COLUMN IF NOT EXISTS background_check_status TEXT
    CHECK (background_check_status IN ('pending', 'passed', 'failed', 'waived')),
  ADD COLUMN IF NOT EXISTS drug_test_date DATE;

COMMENT ON COLUMN worker_profiles.background_check_status IS
  'Background check status — sensitive venue access. Enterprise tier.';
COMMENT ON COLUMN worker_profiles.drug_test_date IS
  'DOT drug test compliance for fleet drivers.';

COMMIT;
