-- ═══════════════════════════════════════════════════════════════
-- 046: MESSAGING FOUNDATION
-- Unified messaging system: conversations, messages, reactions,
-- read receipts, mandatory read acknowledgments.
-- Migrates record_comments into unified messages table.
-- ═══════════════════════════════════════════════════════════════

-- ─── Enums ───────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE conversation_type AS ENUM ('dm', 'group', 'channel');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE conversation_member_role AS ENUM ('owner', 'admin', 'member', 'guest');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE message_priority AS ENUM ('normal', 'high', 'urgent', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_preference_level AS ENUM ('all', 'mentions', 'none');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Conversations ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type conversation_type NOT NULL DEFAULT 'dm',
    name TEXT,
    description TEXT,
    slug TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_announcement_only BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    category TEXT,
    event_id UUID REFERENCES live_event_instances(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    required_credential_type TEXT,
    is_ephemeral BOOLEAN NOT NULL DEFAULT false,
    template_id UUID,
    last_message_at TIMESTAMPTZ,
    message_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_conversations_event ON conversations(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_conversations_slug ON conversations(organization_id, slug) WHERE slug IS NOT NULL;

-- ─── Conversation Members ────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role conversation_member_role NOT NULL DEFAULT 'member',
    last_read_at TIMESTAMPTZ,
    last_read_message_id UUID,
    notification_preference notification_preference_level NOT NULL DEFAULT 'all',
    is_muted BOOLEAN NOT NULL DEFAULT false,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_conversation ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_unread ON conversation_members(user_id, last_read_at);

-- ─── Messages (unified — replaces record_comments for new data) ──

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    thread_message_count INTEGER NOT NULL DEFAULT 0,
    thread_last_reply_at TIMESTAMPTZ,
    body TEXT NOT NULL,
    body_html TEXT,
    mentioned_user_ids UUID[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    entity_type TEXT,
    entity_id UUID,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    pinned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    pinned_at TIMESTAMPTZ,
    is_internal BOOLEAN NOT NULL DEFAULT false,
    priority message_priority NOT NULL DEFAULT 'normal',
    is_mandatory_read BOOLEAN NOT NULL DEFAULT false,
    scheduled_at TIMESTAMPTZ,
    is_system_message BOOLEAN NOT NULL DEFAULT false,
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(body, ''))
    ) STORED
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(parent_message_id) WHERE parent_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_entity ON messages(entity_type, entity_id) WHERE entity_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_scheduled ON messages(scheduled_at) WHERE scheduled_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_pinned ON messages(conversation_id) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_messages_search ON messages USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_messages_org ON messages(organization_id);

-- ─── Message Reactions ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);

-- ─── Message Read Receipts ───────────────────────────────────

CREATE TABLE IF NOT EXISTS message_read_receipts (
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON message_read_receipts(user_id);

-- ─── Mandatory Read Acknowledgments ─────────────────────────

CREATE TABLE IF NOT EXISTS mandatory_read_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    escalation_level INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_mandatory_read_message ON mandatory_read_acknowledgments(message_id);
CREATE INDEX IF NOT EXISTS idx_mandatory_read_pending ON mandatory_read_acknowledgments(user_id) WHERE acknowledged_at IS NULL;

-- ─── Channel Templates (Phase 2 prep, created now for FK) ───

CREATE TABLE IF NOT EXISTS channel_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    channels_config JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channel_templates_org ON channel_templates(organization_id);

-- ─── Triggers ────────────────────────────────────────────────

-- Update conversation stats on message insert
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update conversation last_message_at and message_count
    IF NEW.conversation_id IS NOT NULL AND NEW.deleted_at IS NULL THEN
        UPDATE conversations
        SET last_message_at = NEW.created_at,
            message_count = message_count + 1,
            updated_at = NOW()
        WHERE id = NEW.conversation_id;
    END IF;

    -- Update parent thread stats
    IF NEW.parent_message_id IS NOT NULL THEN
        UPDATE messages
        SET thread_message_count = thread_message_count + 1,
            thread_last_reply_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.parent_message_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_conversation_on_message ON messages;
CREATE TRIGGER trg_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messages_updated_at ON messages;
CREATE TRIGGER trg_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- ─── RLS Policies ────────────────────────────────────────────

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandatory_read_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_templates ENABLE ROW LEVEL SECURITY;

-- Conversations: read if member OR (public + same org)
CREATE POLICY conversations_select ON conversations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_members cm
        WHERE cm.conversation_id = id AND cm.user_id = auth.uid()
    )
    OR (
        is_public = true AND organization_id IN (
            SELECT om.organization_id FROM org_memberships om WHERE om.user_id = auth.uid()
        )
    )
);

CREATE POLICY conversations_insert ON conversations FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT om.organization_id FROM org_memberships om WHERE om.user_id = auth.uid()
    )
);

CREATE POLICY conversations_update ON conversations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM conversation_members cm
        WHERE cm.conversation_id = id
          AND cm.user_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

-- Conversation members: read if in same conversation
CREATE POLICY conv_members_select ON conversation_members FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_members cm2
        WHERE cm2.conversation_id = conversation_id AND cm2.user_id = auth.uid()
    )
);

CREATE POLICY conv_members_insert ON conversation_members FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM conversation_members cm
        WHERE cm.conversation_id = conversation_id
          AND cm.user_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

CREATE POLICY conv_members_update ON conversation_members FOR UPDATE USING (
    user_id = auth.uid()
);

CREATE POLICY conv_members_delete ON conversation_members FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM conversation_members cm
        WHERE cm.conversation_id = conversation_id
          AND cm.user_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

-- Messages: read if conversation member OR entity-scoped same org
CREATE POLICY messages_select ON messages FOR SELECT USING (
    (conversation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM conversation_members cm
        WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid()
    ))
    OR (entity_type IS NOT NULL AND organization_id IN (
        SELECT om.organization_id FROM org_memberships om WHERE om.user_id = auth.uid()
    ))
);

CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (
    sender_id = auth.uid()
);

CREATE POLICY messages_update ON messages FOR UPDATE USING (
    sender_id = auth.uid()
);

-- Reactions: own-row
CREATE POLICY reactions_select ON message_reactions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
        WHERE m.id = message_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY reactions_insert ON message_reactions FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY reactions_delete ON message_reactions FOR DELETE USING (
    user_id = auth.uid()
);

-- Read receipts: own-row
CREATE POLICY read_receipts_select ON message_read_receipts FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM messages m
        JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
        WHERE m.id = message_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY read_receipts_insert ON message_read_receipts FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

-- Mandatory read acks: own-row
CREATE POLICY mandatory_read_select ON mandatory_read_acknowledgments FOR SELECT USING (
    user_id = auth.uid()
);

CREATE POLICY mandatory_read_update ON mandatory_read_acknowledgments FOR UPDATE USING (
    user_id = auth.uid()
);

-- Channel templates: org member read, pm+ write
CREATE POLICY channel_templates_select ON channel_templates FOR SELECT USING (
    organization_id IN (
        SELECT om.organization_id FROM org_memberships om WHERE om.user_id = auth.uid()
    )
);

CREATE POLICY channel_templates_insert ON channel_templates FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT om.organization_id FROM org_memberships om WHERE om.user_id = auth.uid()
    )
);

-- ─── Realtime Publication ────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ─── Data Migration: record_comments → messages ─────────────

INSERT INTO messages (
    id, sender_id, parent_message_id, body,
    mentioned_user_ids, attachments, entity_type, entity_id,
    is_internal, organization_id, created_at, updated_at
)
SELECT
    rc.id, rc.author_id, rc.parent_comment_id, rc.body,
    rc.mentioned_user_ids, rc.attachments, rc.entity_type, rc.entity_id,
    rc.is_internal, rc.organization_id, rc.created_at, rc.updated_at
FROM record_comments rc
WHERE NOT EXISTS (SELECT 1 FROM messages m WHERE m.id = rc.id)
ON CONFLICT (id) DO NOTHING;
