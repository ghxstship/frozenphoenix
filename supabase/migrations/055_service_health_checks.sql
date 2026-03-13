-- Migration: service_health_checks
-- Infrastructure service health monitoring table
-- Replaces hardcoded SERVICES array in system-health/page.tsx

CREATE TABLE IF NOT EXISTS public.service_health_checks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    service_name    text NOT NULL,
    status          text NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down')),
    latency_ms      integer NOT NULL DEFAULT 0,
    uptime_pct      numeric(5,2) NOT NULL DEFAULT 100.00,
    last_checked_at timestamptz NOT NULL DEFAULT now(),
    endpoint_url    text,
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.service_health_checks IS 'Infrastructure service health monitoring entries';

-- RLS
ALTER TABLE public.service_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view service health checks"
    ON public.service_health_checks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage service health checks"
    ON public.service_health_checks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_memberships om
            WHERE om.user_id = auth.uid()
              AND om.organization_id = service_health_checks.organization_id
              AND om.role IN ('exec', 'director')
        )
    );

-- Seed default service entries (no org scope — global defaults)
INSERT INTO public.service_health_checks (service_name, status, latency_ms, uptime_pct)
VALUES
    ('Database (Supabase)', 'healthy', 12, 99.97),
    ('Authentication', 'healthy', 45, 99.99),
    ('Storage (CDN)', 'healthy', 8, 99.95),
    ('Realtime (WebSocket)', 'healthy', 23, 99.90),
    ('Edge Functions', 'healthy', 67, 99.85),
    ('Email (SMTP)', 'healthy', 120, 99.80);
