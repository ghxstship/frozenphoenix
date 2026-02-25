-- ============================================================================
-- Migration 009: Scenario Builder
-- Adds scenario modeling for budget/revenue/resource simulations
-- Productive.io parity: Scenario Builder feature
-- ============================================================================

-- Enum for scenario status
DO $$ BEGIN
    CREATE TYPE public.scenario_status AS ENUM (
        'draft',
        'active',
        'archived',
        'selected'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum for scenario type
DO $$ BEGIN
    CREATE TYPE public.scenario_type AS ENUM (
        'budget',
        'revenue',
        'resource',
        'pricing',
        'hiring',
        'combined'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- Table: scenarios
-- Top-level scenario container
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scenarios (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name            text NOT NULL,
    description     text,
    scenario_type   public.scenario_type NOT NULL DEFAULT 'combined',
    status          public.scenario_status NOT NULL DEFAULT 'draft',
    project_id      uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    budget_id       uuid REFERENCES public.budgets(id) ON DELETE SET NULL,
    base_scenario_id uuid REFERENCES public.scenarios(id) ON DELETE SET NULL,
    created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    tags            text[] DEFAULT '{}',
    metadata        jsonb DEFAULT '{}',
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

-- ============================================================================
-- Table: scenario_variables
-- Individual adjustable parameters within a scenario
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scenario_variables (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    scenario_id     uuid NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
    variable_name   text NOT NULL,
    variable_type   text NOT NULL DEFAULT 'currency',
    base_value      numeric NOT NULL DEFAULT 0,
    adjusted_value  numeric NOT NULL DEFAULT 0,
    unit            text DEFAULT 'USD',
    category        text NOT NULL DEFAULT 'general',
    notes           text,
    sort_order      integer DEFAULT 0,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),
    UNIQUE(scenario_id, variable_name)
);

-- ============================================================================
-- Table: scenario_outcomes
-- Computed/projected outcomes for each scenario
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scenario_outcomes (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    scenario_id     uuid NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
    metric_name     text NOT NULL,
    metric_type     text NOT NULL DEFAULT 'currency',
    base_value      numeric NOT NULL DEFAULT 0,
    projected_value numeric NOT NULL DEFAULT 0,
    variance        numeric GENERATED ALWAYS AS (projected_value - base_value) STORED,
    variance_pct    numeric GENERATED ALWAYS AS (
        CASE WHEN base_value != 0 THEN ((projected_value - base_value) / base_value) * 100 ELSE 0 END
    ) STORED,
    period          text,
    notes           text,
    created_at      timestamptz DEFAULT now()
);

-- ============================================================================
-- Table: scenario_resource_plans
-- Resource allocation adjustments within a scenario
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scenario_resource_plans (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    scenario_id     uuid NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
    role            text NOT NULL,
    department      text,
    current_headcount integer NOT NULL DEFAULT 0,
    planned_headcount integer NOT NULL DEFAULT 0,
    hourly_rate     numeric DEFAULT 0,
    utilization_target numeric DEFAULT 80,
    annual_cost     numeric DEFAULT 0,
    start_date      date,
    notes           text,
    created_at      timestamptz DEFAULT now()
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_scenarios_org ON public.scenarios(organization_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_project ON public.scenarios(project_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_status ON public.scenarios(status);
CREATE INDEX IF NOT EXISTS idx_scenario_variables_scenario ON public.scenario_variables(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_outcomes_scenario ON public.scenario_outcomes(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_resource_plans_scenario ON public.scenario_resource_plans(scenario_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_resource_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scenarios_org_read" ON public.scenarios
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "scenarios_org_write" ON public.scenarios
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "scenario_variables_via_scenario" ON public.scenario_variables
    FOR ALL USING (
        scenario_id IN (
            SELECT id FROM public.scenarios WHERE organization_id IN (
                SELECT organization_id FROM public.profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "scenario_outcomes_via_scenario" ON public.scenario_outcomes
    FOR ALL USING (
        scenario_id IN (
            SELECT id FROM public.scenarios WHERE organization_id IN (
                SELECT organization_id FROM public.profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "scenario_resource_plans_via_scenario" ON public.scenario_resource_plans
    FOR ALL USING (
        scenario_id IN (
            SELECT id FROM public.scenarios WHERE organization_id IN (
                SELECT organization_id FROM public.profiles WHERE id = auth.uid()
            )
        )
    );

-- ============================================================================
-- Trigger: auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_scenario_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_scenarios_updated
    BEFORE UPDATE ON public.scenarios
    FOR EACH ROW EXECUTE FUNCTION public.update_scenario_timestamp();

CREATE TRIGGER trg_scenario_variables_updated
    BEFORE UPDATE ON public.scenario_variables
    FOR EACH ROW EXECUTE FUNCTION public.update_scenario_timestamp();
