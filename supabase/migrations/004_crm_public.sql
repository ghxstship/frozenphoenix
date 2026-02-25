-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 004: CRM & Public Site Features
-- Lead intake, testimonials, reviews, enhanced deals
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE lead_status AS ENUM (
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'negotiating',
    'won',
    'lost',
    'nurturing'
);

CREATE TYPE lead_source AS ENUM (
    'website',
    'referral',
    'trade_show',
    'cold_outreach',
    'social_media',
    'advertising',
    'partner',
    'other'
);

CREATE TYPE project_type_interest AS ENUM (
    'brand_activation',
    'stage_set_design',
    'immersive_installation',
    'trade_show_expo',
    'pop_up_retail',
    'festival_production',
    'corporate_event',
    'product_launch',
    'other'
);

CREATE TYPE budget_range AS ENUM (
    'under_50k',
    '50k_150k',
    '150k_500k',
    '500k_1m',
    '1m_5m',
    'over_5m'
);

CREATE TYPE testimonial_status AS ENUM (
    'pending',
    'approved',
    'featured',
    'archived'
);

-- ─── LEADS TABLE ─────────────────────────────────────────────────────────────

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(100),
    
    -- Lead Details
    project_type project_type_interest,
    budget_range budget_range,
    timeline VARCHAR(100),
    description TEXT,
    
    -- Source & Attribution
    source lead_source DEFAULT 'website',
    source_detail VARCHAR(255),
    referrer_url TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Status & Assignment
    status lead_status DEFAULT 'new',
    assigned_to UUID REFERENCES profiles(id),
    score INTEGER DEFAULT 0,
    
    -- Conversion
    converted_to_deal_id UUID,
    converted_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_contacted_at TIMESTAMPTZ,
    
    -- Consent
    marketing_consent BOOLEAN DEFAULT FALSE,
    privacy_accepted BOOLEAN DEFAULT TRUE
);

-- ─── LEAD ACTIVITIES TABLE ───────────────────────────────────────────────────

CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by UUID REFERENCES profiles(id),
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── TESTIMONIALS TABLE ──────────────────────────────────────────────────────

CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source
    project_id UUID REFERENCES projects(id),
    case_study_id UUID REFERENCES case_studies(id),
    
    -- Author
    author_name VARCHAR(255) NOT NULL,
    author_title VARCHAR(255),
    author_company VARCHAR(255),
    author_avatar_url TEXT,
    
    -- Content
    quote TEXT NOT NULL,
    full_testimonial TEXT,
    
    -- Rating
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Categorization
    category VARCHAR(100),
    tags TEXT[],
    
    -- Status
    status testimonial_status DEFAULT 'pending',
    featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    
    -- Timestamps
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── REVIEWS TABLE (for external reviews aggregation) ────────────────────────

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source
    platform VARCHAR(100) NOT NULL,
    external_id VARCHAR(255),
    external_url TEXT,
    
    -- Author
    reviewer_name VARCHAR(255),
    reviewer_avatar_url TEXT,
    
    -- Content
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    title VARCHAR(500),
    content TEXT,
    
    -- Metadata
    review_date DATE,
    helpful_count INTEGER DEFAULT 0,
    response TEXT,
    response_date DATE,
    
    -- Status
    visible BOOLEAN DEFAULT TRUE,
    flagged BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(platform, external_id)
);

-- ─── ENHANCE DEALS TABLE ─────────────────────────────────────────────────────

ALTER TABLE deals ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS source lead_source;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lost_reason VARCHAR(255);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lost_to_competitor VARCHAR(255);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS next_step TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS next_step_date DATE;

-- ─── CASE STUDY ENHANCEMENTS ─────────────────────────────────────────────────

ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS public_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);

CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_featured ON testimonials(featured) WHERE featured = TRUE;
CREATE INDEX idx_testimonials_project_id ON testimonials(project_id);

CREATE INDEX idx_reviews_platform ON reviews(platform);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_visible ON reviews(visible) WHERE visible = TRUE;

CREATE INDEX idx_case_studies_public ON case_studies(public_visible) WHERE public_visible = TRUE;
CREATE INDEX idx_case_studies_slug ON case_studies(slug);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Leads: Only authenticated users can view, anyone can insert (for public form)
CREATE POLICY "Anyone can submit leads" ON leads
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can view leads" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update leads" ON leads
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Lead Activities: Authenticated only
CREATE POLICY "Authenticated users can manage lead activities" ON lead_activities
    FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials: Public can view approved, authenticated can manage
CREATE POLICY "Anyone can view approved testimonials" ON testimonials
    FOR SELECT USING (status IN ('approved', 'featured'));

CREATE POLICY "Authenticated users can manage testimonials" ON testimonials
    FOR ALL USING (auth.role() = 'authenticated');

-- Reviews: Public can view visible, authenticated can manage
CREATE POLICY "Anyone can view visible reviews" ON reviews
    FOR SELECT USING (visible = TRUE);

CREATE POLICY "Authenticated users can manage reviews" ON reviews
    FOR ALL USING (auth.role() = 'authenticated');

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─── FUNCTIONS ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_lead_score(lead_row leads)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Budget scoring
    IF lead_row.budget_range = 'over_5m' THEN score := score + 50;
    ELSIF lead_row.budget_range = '1m_5m' THEN score := score + 40;
    ELSIF lead_row.budget_range = '500k_1m' THEN score := score + 30;
    ELSIF lead_row.budget_range = '150k_500k' THEN score := score + 20;
    ELSIF lead_row.budget_range = '50k_150k' THEN score := score + 10;
    END IF;
    
    -- Company provided
    IF lead_row.company IS NOT NULL THEN score := score + 10; END IF;
    
    -- Phone provided
    IF lead_row.phone IS NOT NULL THEN score := score + 5; END IF;
    
    -- Description provided
    IF lead_row.description IS NOT NULL AND LENGTH(lead_row.description) > 50 THEN 
        score := score + 15; 
    END IF;
    
    -- Referral source bonus
    IF lead_row.source = 'referral' THEN score := score + 20; END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Auto-score leads on insert
CREATE OR REPLACE FUNCTION auto_score_lead()
RETURNS TRIGGER AS $$
BEGIN
    NEW.score := calculate_lead_score(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lead_auto_score
    BEFORE INSERT OR UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_score_lead();

-- ─── AGGREGATE VIEWS ─────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW review_stats AS
SELECT 
    COUNT(*) as total_reviews,
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*) FILTER (WHERE rating >= 4) as positive_reviews,
    COUNT(*) FILTER (WHERE rating < 3) as negative_reviews,
    COUNT(DISTINCT platform) as platforms
FROM reviews
WHERE visible = TRUE;

CREATE OR REPLACE VIEW lead_pipeline_stats AS
SELECT 
    status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_this_week,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_this_month
FROM leads
GROUP BY status;
