-- ═══════════════════════════════════════════════════════════════
-- 091: Automation Trigger Dispatch Infrastructure
-- ═══════════════════════════════════════════════════════════════
-- Closes gaps G1 (automatic trigger dispatch), G7 (scheduled execution),
-- G3 (outbound webhook delivery), G9 (API key management),
-- G20 (automation versioning), G22 (dead-letter queue).
--
-- Creates:
--   1. pg_notify trigger function for automation dispatch
--   2. Trigger attachment to key entity tables
--   3. Scheduled automation scanner support columns
--   4. Outbound webhook subscriptions table
--   5. Webhook delivery log table
--   6. API keys table
--   7. Automation versioning column
--   8. Dead-letter queue table
--   9. Integration marketplace metadata columns
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Automation trigger dispatch function ─────────────────
-- Fires on INSERT/UPDATE/DELETE of watched entity tables.
-- Publishes a pg_notify event that the automation-trigger-listener
-- edge function (or Supabase Realtime) will consume.

CREATE OR REPLACE FUNCTION notify_automation_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_trigger_type TEXT;
    v_old_status   TEXT;
    v_new_status   TEXT;
    v_payload      JSONB;
BEGIN
    -- Determine trigger type
    IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'created';
    ELSIF TG_OP = 'DELETE' THEN
        v_trigger_type := 'deleted';
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check for status change
        v_old_status := OLD.status;
        v_new_status := NEW.status;
        IF v_old_status IS DISTINCT FROM v_new_status THEN
            v_trigger_type := 'status_changed';
        ELSE
            v_trigger_type := 'updated';
        END IF;
    END IF;

    -- Build payload
    v_payload := jsonb_build_object(
        'trigger_type', v_trigger_type,
        'entity_type', TG_TABLE_NAME,
        'record_id', CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        'organization_id', CASE
            WHEN TG_OP = 'DELETE' THEN OLD.organization_id
            ELSE NEW.organization_id
        END,
        'old_status', v_old_status,
        'new_status', v_new_status,
        'timestamp', now()
    );

    -- Fire pg_notify on the 'automation_trigger' channel
    PERFORM pg_notify('automation_trigger', v_payload::text);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION notify_automation_trigger() IS
    'Publishes automation trigger events via pg_notify for the automation dispatch listener.';

-- ─── 2. Attach triggers to key entity tables ─────────────────
-- Only tables that have both `id`, `organization_id`, and commonly
-- have automations configured against them.

DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'tasks', 'projects', 'deals', 'leads', 'opportunities',
        'contracts', 'invoices', 'client_invoices', 'expenses',
        'incidents', 'service_requests', 'purchase_orders',
        'budgets', 'events', 'activations', 'shipments',
        'assets', 'crew_members', 'vendors', 'campaigns',
        'briefs', 'change_orders', 'time_entries'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        -- Only create if table exists and trigger doesn't already exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP TRIGGER IF EXISTS trg_automation_dispatch ON %I;
                 CREATE TRIGGER trg_automation_dispatch
                 AFTER INSERT OR UPDATE OR DELETE ON %I
                 FOR EACH ROW EXECUTE FUNCTION notify_automation_trigger();',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- ─── 3. Scheduled automation support ─────────────────────────
-- Add schedule columns to automations for cron-based triggers.

ALTER TABLE automations ADD COLUMN IF NOT EXISTS schedule_cron TEXT;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS schedule_timezone TEXT DEFAULT 'UTC';
ALTER TABLE automations ADD COLUMN IF NOT EXISTS next_scheduled_at TIMESTAMPTZ;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

COMMENT ON COLUMN automations.schedule_cron IS
    'Cron expression for scheduled triggers (e.g., "0 9 * * 1" for Monday 9am)';
COMMENT ON COLUMN automations.next_scheduled_at IS
    'Pre-computed next execution time for efficient cron scanning';

-- ─── 4. Outbound webhook subscriptions ───────────────────────

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    target_url        TEXT NOT NULL,
    secret            TEXT NOT NULL,
    event_types       TEXT[] NOT NULL DEFAULT '{}',
    is_active         BOOLEAN NOT NULL DEFAULT true,
    failure_count     INTEGER NOT NULL DEFAULT 0,
    max_failures      INTEGER NOT NULL DEFAULT 10,
    retry_policy      JSONB DEFAULT '{"max_retries": 5, "backoff_seconds": [5, 30, 120, 600, 3600]}'::jsonb,
    headers           JSONB DEFAULT '{}'::jsonb,
    created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_org
    ON webhook_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active
    ON webhook_subscriptions(organization_id) WHERE is_active = true;

ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhook_subscriptions_org_read ON webhook_subscriptions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
        )
    );
CREATE POLICY webhook_subscriptions_org_write ON webhook_subscriptions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
        )
    );

CREATE TRIGGER set_webhook_subscriptions_updated_at
    BEFORE UPDATE ON webhook_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── 5. Webhook delivery log ─────────────────────────────────

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id   UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
    event_type        TEXT NOT NULL,
    payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
    status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
    response_status   INTEGER,
    response_body     TEXT,
    attempt_count     INTEGER NOT NULL DEFAULT 0,
    max_attempts      INTEGER NOT NULL DEFAULT 5,
    next_retry_at     TIMESTAMPTZ,
    delivered_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_sub
    ON webhook_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_pending
    ON webhook_deliveries(status, next_retry_at) WHERE status IN ('pending', 'retrying');

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhook_deliveries_org_read ON webhook_deliveries
    FOR SELECT USING (
        subscription_id IN (
            SELECT id FROM webhook_subscriptions WHERE organization_id IN (
                SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
            )
        )
    );

-- ─── 6. API keys table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    key_hash          TEXT NOT NULL,
    key_prefix        TEXT NOT NULL,
    scopes            TEXT[] NOT NULL DEFAULT '{read}',
    rate_limit_rpm    INTEGER NOT NULL DEFAULT 60,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    last_used_at      TIMESTAMPTZ,
    expires_at        TIMESTAMPTZ,
    created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_prefix
    ON api_keys(key_prefix) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_org
    ON api_keys(organization_id);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY api_keys_org_read ON api_keys
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
        )
    );
CREATE POLICY api_keys_org_write ON api_keys
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
        )
    );

-- ─── 7. Dead-letter queue for failed automations ─────────────

CREATE TABLE IF NOT EXISTS automation_dead_letters (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id     UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    execution_id      UUID REFERENCES automation_executions(id) ON DELETE SET NULL,
    trigger_type      TEXT NOT NULL,
    entity_type       TEXT NOT NULL,
    entity_id         UUID NOT NULL,
    payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
    error             TEXT,
    retry_count       INTEGER NOT NULL DEFAULT 0,
    max_retries       INTEGER NOT NULL DEFAULT 3,
    next_retry_at     TIMESTAMPTZ,
    resolved_at       TIMESTAMPTZ,
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_dead_letters_pending
    ON automation_dead_letters(next_retry_at) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_automation_dead_letters_org
    ON automation_dead_letters(organization_id);

ALTER TABLE automation_dead_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY automation_dead_letters_org_read ON automation_dead_letters
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
        )
    );
CREATE POLICY automation_dead_letters_org_write ON automation_dead_letters
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships WHERE user_id = auth.uid()
        )
    );

-- ─── 8. Expand provider_connections types ────────────────────
-- Add business/finance/comms provider types (G8).

ALTER TABLE provider_connections DROP CONSTRAINT IF EXISTS provider_connections_provider_type_check;
ALTER TABLE provider_connections ADD CONSTRAINT provider_connections_provider_type_check
    CHECK (provider_type IN (
        'eventbrite', 'square', 'front_gate', 'intellitix', 'custom',
        'quickbooks', 'xero', 'stripe', 'slack', 'google_calendar',
        'google_drive', 'dropbox', 'zapier', 'hubspot', 'docusign',
        'twilio', 'sendgrid', 'deputy', 'gusto', 'asana',
        'monday', 'jira', 'salesforce', 'microsoft_teams'
    ));

-- Add OAuth columns to provider_connections
ALTER TABLE provider_connections ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE provider_connections ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE provider_connections ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;
ALTER TABLE provider_connections ADD COLUMN IF NOT EXISTS oauth_state TEXT;
ALTER TABLE provider_connections ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT '{}';
ALTER TABLE provider_connections ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ─── 9. Integration marketplace metadata ─────────────────────

CREATE TABLE IF NOT EXISTS integration_catalog (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_type     TEXT NOT NULL UNIQUE,
    display_name      TEXT NOT NULL,
    description       TEXT,
    category          TEXT NOT NULL CHECK (category IN (
        'finance', 'project_management', 'communications', 'erp',
        'ticketing', 'crm', 'hr', 'storage', 'ipaas', 'pos'
    )),
    icon_url          TEXT,
    auth_type         TEXT NOT NULL DEFAULT 'api_key' CHECK (auth_type IN ('api_key', 'oauth2', 'webhook_only')),
    documentation_url TEXT,
    is_available      BOOLEAN NOT NULL DEFAULT true,
    is_beta           BOOLEAN NOT NULL DEFAULT false,
    sort_order        INTEGER NOT NULL DEFAULT 100,
    features          TEXT[] DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the catalog with recommended integrations
INSERT INTO integration_catalog (provider_type, display_name, description, category, auth_type, features, sort_order, is_available) VALUES
    ('quickbooks',       'QuickBooks Online', 'Accounting, invoicing, and expense tracking', 'finance', 'oauth2', ARRAY['invoices', 'expenses', 'accounts'], 10, true),
    ('xero',             'Xero',              'Cloud accounting for small businesses',        'finance', 'oauth2', ARRAY['invoices', 'expenses', 'accounts'], 11, true),
    ('stripe',           'Stripe',            'Payment processing and billing',               'finance', 'api_key', ARRAY['payments', 'subscriptions', 'invoices'], 12, true),
    ('square',           'Square',            'POS transactions and payment processing',      'pos',     'api_key', ARRAY['transactions', 'inventory', 'customers'], 13, true),
    ('slack',            'Slack',             'Team messaging and notifications',             'communications', 'oauth2', ARRAY['notifications', 'channels', 'messages'], 20, true),
    ('microsoft_teams',  'Microsoft Teams',   'Enterprise collaboration and messaging',       'communications', 'oauth2', ARRAY['notifications', 'channels', 'messages'], 21, true),
    ('google_calendar',  'Google Calendar',   'Calendar sync and event scheduling',           'communications', 'oauth2', ARRAY['events', 'scheduling'], 22, true),
    ('google_drive',     'Google Drive',      'Cloud document storage and sharing',           'storage', 'oauth2', ARRAY['files', 'folders', 'sharing'], 30, true),
    ('dropbox',          'Dropbox',           'File sync and cloud storage',                  'storage', 'oauth2', ARRAY['files', 'folders', 'sharing'], 31, true),
    ('eventbrite',       'Eventbrite',        'Event management and ticketing',               'ticketing', 'api_key', ARRAY['tickets', 'attendees', 'events'], 40, true),
    ('front_gate',       'Front Gate Tickets','Event ticketing platform',                     'ticketing', 'api_key', ARRAY['tickets', 'attendees'], 41, true),
    ('intellitix',       'Intellitix',        'RFID/NFC credentialing',                      'ticketing', 'api_key', ARRAY['credentials', 'access_control'], 42, true),
    ('hubspot',          'HubSpot',           'CRM, marketing, and sales automation',         'crm', 'oauth2', ARRAY['contacts', 'deals', 'companies'], 50, true),
    ('salesforce',       'Salesforce',        'Enterprise CRM platform',                      'crm', 'oauth2', ARRAY['contacts', 'deals', 'companies'], 51, true),
    ('docusign',         'DocuSign',          'Electronic signatures and agreements',          'crm', 'oauth2', ARRAY['signatures', 'documents'], 52, true),
    ('asana',            'Asana',             'Project and task management',                   'project_management', 'oauth2', ARRAY['tasks', 'projects'], 60, true),
    ('monday',           'Monday.com',        'Work management platform',                     'project_management', 'api_key', ARRAY['tasks', 'projects'], 61, true),
    ('jira',             'Jira',              'Issue and project tracking',                    'project_management', 'oauth2', ARRAY['issues', 'projects'], 62, true),
    ('deputy',           'Deputy',            'Workforce scheduling and time tracking',        'hr', 'oauth2', ARRAY['shifts', 'timesheets', 'leave'], 70, true),
    ('gusto',            'Gusto',             'Payroll, benefits, and HR',                     'hr', 'oauth2', ARRAY['payroll', 'benefits', 'employees'], 71, true),
    ('twilio',           'Twilio',            'SMS and voice communications',                  'communications', 'api_key', ARRAY['sms', 'voice', 'notifications'], 23, true),
    ('sendgrid',         'SendGrid',          'Transactional and marketing email',             'communications', 'api_key', ARRAY['email', 'templates', 'analytics'], 24, true),
    ('zapier',           'Zapier',            'Connect 6000+ apps with automated workflows',   'ipaas', 'api_key', ARRAY['automations', 'integrations'], 80, true)
ON CONFLICT (provider_type) DO NOTHING;

-- No RLS on catalog — it's public reference data
