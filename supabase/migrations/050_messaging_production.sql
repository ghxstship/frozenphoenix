-- Migration 050: Messaging Production-Aware Features (Phase 2)
-- Adds channel templates, event-lifecycle provisioning columns,
-- credential-linked channels, and messaging feature flags.

-- ─── Channel Templates ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channel_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    event_type      TEXT NOT NULL CHECK (event_type IN ('festival', 'corporate', 'broadcast', 'activation', 'custom')),
    channels_config JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.channel_templates IS 'Predefined channel sets for event types. channels_config is an array of {name, slug, category, is_public, is_announcement_only, is_restricted, required_role, required_credential_type}.';

CREATE INDEX IF NOT EXISTS idx_channel_templates_org ON public.channel_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_channel_templates_event_type ON public.channel_templates(event_type);

-- ─── Extend conversations for production features ───────────
ALTER TABLE public.conversations
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.channel_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS required_credential_type TEXT,
    ADD COLUMN IF NOT EXISTS is_ephemeral BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS auto_archive_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS required_role TEXT;

COMMENT ON COLUMN public.conversations.template_id IS 'Channel template this conversation was provisioned from';
COMMENT ON COLUMN public.conversations.required_credential_type IS 'Credential type required for membership (e.g. rigger, pyro)';
COMMENT ON COLUMN public.conversations.is_ephemeral IS 'If true, channel is auto-archived when the linked event completes';
COMMENT ON COLUMN public.conversations.is_restricted IS 'If true, only users with required_role or credential can join';
COMMENT ON COLUMN public.conversations.required_role IS 'Minimum role required to join (e.g. pm, director)';

CREATE INDEX idx_conversations_template ON public.conversations(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_conversations_credential ON public.conversations(required_credential_type) WHERE required_credential_type IS NOT NULL;
CREATE INDEX idx_conversations_ephemeral ON public.conversations(is_ephemeral, auto_archive_at) WHERE is_ephemeral = true;

-- ─── Extend messages for production context ─────────────────
ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS shift_id UUID,
    ADD COLUMN IF NOT EXISTS zone_id UUID,
    ADD COLUMN IF NOT EXISTS department TEXT,
    ADD COLUMN IF NOT EXISTS incident_id UUID,
    ADD COLUMN IF NOT EXISTS cue_id UUID;

COMMENT ON COLUMN public.messages.shift_id IS 'Linked crew shift for shift-gated routing';
COMMENT ON COLUMN public.messages.zone_id IS 'Spatial zone context for the message';
COMMENT ON COLUMN public.messages.department IS 'Department context for department-scoped channels';
COMMENT ON COLUMN public.messages.incident_id IS 'Linked incident for incident-triggered threads';
COMMENT ON COLUMN public.messages.cue_id IS 'Linked ROS cue for cue-triggered messages';

-- ─── Escalation rules table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messaging_escalation_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    trigger_type    TEXT NOT NULL CHECK (trigger_type IN ('unread_critical', 'unread_mandatory', 'unacknowledged', 'custom')),
    delay_minutes   INTEGER NOT NULL DEFAULT 15,
    escalation_levels JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.messaging_escalation_rules IS 'Configurable escalation rules. escalation_levels is [{delay_minutes, action: "reminder"|"notify_manager"|"sms", target_role}].';

CREATE INDEX idx_escalation_rules_org ON public.messaging_escalation_rules(organization_id);

-- ─── Messaging feature flags seed ───────────────────────────
-- Insert feature flags for messaging features (if feature_flags table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feature_flags') THEN
        INSERT INTO public.feature_flags (key, label, description, is_active, default_value, created_at)
        VALUES
            ('messaging_enabled', 'Messaging', 'Core messaging functionality', true, 'true'::jsonb, now()),
            ('messaging_channels_enabled', 'Channels', 'Channel-based messaging', true, 'true'::jsonb, now()),
            ('messaging_ptt_enabled', 'Push-to-Talk', 'Walkie-talkie / PTT functionality', true, 'false'::jsonb, now()),
            ('messaging_voice_messages', 'Voice Messages', 'Voice message recording and playback', true, 'false'::jsonb, now()),
            ('messaging_ai_summary', 'AI Summaries', 'AI-powered conversation summaries', true, 'false'::jsonb, now()),
            ('messaging_mandatory_read', 'Mandatory Read', 'Mandatory read acknowledgments for safety', true, 'true'::jsonb, now()),
            ('messaging_sms_fallback', 'SMS Fallback', 'SMS fallback for critical messages', true, 'false'::jsonb, now()),
            ('messaging_translation', 'Translation', 'Message translation', true, 'false'::jsonb, now()),
            ('messaging_scheduled', 'Scheduled Messages', 'Schedule messages for future delivery', true, 'true'::jsonb, now()),
            ('messaging_export', 'Export', 'Conversation export (CSV/PDF)', true, 'true'::jsonb, now())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ─── Replace channel_templates RLS with optimized = ANY() policies ──
-- Drop old policies from migration 046 (which used subquery on org_memberships)
DROP POLICY IF EXISTS channel_templates_select ON public.channel_templates;
DROP POLICY IF EXISTS channel_templates_insert ON public.channel_templates;
DROP POLICY IF EXISTS channel_templates_update ON public.channel_templates;
DROP POLICY IF EXISTS channel_templates_delete ON public.channel_templates;

CREATE POLICY channel_templates_select ON public.channel_templates
    FOR SELECT USING (
        organization_id = ANY(get_user_org_ids())
    );

CREATE POLICY channel_templates_insert ON public.channel_templates
    FOR INSERT WITH CHECK (
        organization_id = ANY(get_user_org_ids())
    );

CREATE POLICY channel_templates_update ON public.channel_templates
    FOR UPDATE USING (
        organization_id = ANY(get_user_org_ids())
    );

CREATE POLICY channel_templates_delete ON public.channel_templates
    FOR DELETE USING (
        organization_id = ANY(get_user_exec_org_ids())
    );

-- ─── RLS for escalation_rules ───────────────────────────────
ALTER TABLE public.messaging_escalation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY escalation_rules_select ON public.messaging_escalation_rules
    FOR SELECT USING (
        organization_id = ANY(get_user_org_ids())
    );

CREATE POLICY escalation_rules_manage ON public.messaging_escalation_rules
    FOR ALL USING (
        organization_id = ANY(get_user_admin_org_ids())
    );

-- ─── Triggers: auto-update updated_at ───────────────────────
DO $$ BEGIN
    CREATE TRIGGER channel_templates_updated_at
        BEFORE UPDATE ON public.channel_templates
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER escalation_rules_updated_at
        BEFORE UPDATE ON public.messaging_escalation_rules
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
