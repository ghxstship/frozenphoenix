-- ═══════════════════════════════════════════════════════════════
-- 064: Extended User Profile
-- Adds legal name, pronouns, addresses, emergency contact,
-- dietary restrictions, travel profile, and user certifications
-- to BOTH user_profiles (canonical) and profiles (legacy).
-- ═══════════════════════════════════════════════════════════════

-- ─── user_profiles (canonical, migration 018) ────────────────

ALTER TABLE user_profiles
    -- Legal name (replaces single display_name for formal contexts)
    ADD COLUMN IF NOT EXISTS legal_first_name TEXT,
    ADD COLUMN IF NOT EXISTS legal_middle_name TEXT,
    ADD COLUMN IF NOT EXISTS legal_last_name TEXT,
    ADD COLUMN IF NOT EXISTS preferred_name TEXT,
    ADD COLUMN IF NOT EXISTS pronouns TEXT,

    -- Addresses (structured JSONB for mailing + billing)
    -- Schema: { street1, street2, city, state, postal_code, country }
    ADD COLUMN IF NOT EXISTS mailing_address JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}'::jsonb,

    -- Emergency contact
    ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT,

    -- Dietary
    ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,

    -- Travel
    -- travel_profile: structured data (passport_number, passport_expiry,
    --   known_traveler_number, redress_number, tsa_precheck, global_entry)
    ADD COLUMN IF NOT EXISTS travel_profile JSONB DEFAULT '{}'::jsonb,
    -- travel_preferences: structured data (seat_preference, meal_preference,
    --   airline_loyalty, hotel_loyalty, rental_car_loyalty, notes)
    ADD COLUMN IF NOT EXISTS travel_preferences JSONB DEFAULT '{}'::jsonb;


-- ─── profiles (legacy, migration 001) ────────────────────────
-- The app currently reads from this table; keep in sync until
-- the dual-table problem is fully resolved.

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS legal_first_name TEXT,
    ADD COLUMN IF NOT EXISTS legal_middle_name TEXT,
    ADD COLUMN IF NOT EXISTS legal_last_name TEXT,
    ADD COLUMN IF NOT EXISTS preferred_name TEXT,
    ADD COLUMN IF NOT EXISTS pronouns TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS mailing_address JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT,
    ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
    ADD COLUMN IF NOT EXISTS travel_profile JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS travel_preferences JSONB DEFAULT '{}'::jsonb;


-- ═══════════════════════════════════════════════════════════════
-- USER CERTIFICATIONS (linked to auth user, NOT crew_members)
-- Separate from the existing certifications table which is
-- crew_member-scoped. Users may hold personal certifications
-- before being assigned as crew on any project.
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE user_certification_type AS ENUM (
    'first_aid',
    'cpr',
    'aed',
    'cdl_a',
    'cdl_b',
    'cdl_c',
    'osha_10',
    'osha_30',
    'forklift',
    'rigging',
    'electrical',
    'fire_safety',
    'food_handler',
    'hazmat',
    'fall_protection',
    'confined_space',
    'union_card',
    'other'
);

CREATE TABLE user_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    cert_type user_certification_type NOT NULL,
    label TEXT NOT NULL,                       -- Display label (e.g. "OSHA 30-Hour")
    issuing_authority TEXT,                     -- e.g. "American Red Cross"
    certificate_number TEXT,
    issued_date DATE,
    expiry_date DATE,
    document_url TEXT,                          -- Link to uploaded scan/PDF
    notes TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups by user
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id
    ON user_certifications (user_id);

-- Index for expiry alerts
CREATE INDEX IF NOT EXISTS idx_user_certifications_expiry
    ON user_certifications (expiry_date)
    WHERE expiry_date IS NOT NULL;

-- RLS
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own certifications
CREATE POLICY user_certifications_select ON user_certifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own certifications
CREATE POLICY user_certifications_insert ON user_certifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own certifications
CREATE POLICY user_certifications_update ON user_certifications
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own certifications
CREATE POLICY user_certifications_delete ON user_certifications
    FOR DELETE USING (user_id = auth.uid());

-- Exec/admins can read all certifications in their org
CREATE POLICY user_certifications_org_read ON user_certifications
    FOR SELECT USING (
        organization_id = ANY(public.get_user_org_ids())
    );

-- updated_at trigger
CREATE TRIGGER set_user_certifications_updated_at
    BEFORE UPDATE ON user_certifications
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
