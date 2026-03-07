/* ═══════════════════════════════════════════════════════════════
   MESSAGING — Domain Type Definitions
   Covers: conversations, messages, reactions, read receipts,
   mandatory reads, channel templates.
   ═══════════════════════════════════════════════════════════════ */

// ─── Enums ───────────────────────────────────────────────────

export type ConversationType = "dm" | "group" | "channel";

export type ConversationMemberRole = "owner" | "admin" | "member" | "guest";

export type MessagePriority = "normal" | "high" | "urgent" | "critical";

export type NotificationPreferenceLevel = "all" | "mentions" | "none";

// ─── Core Entities ───────────────────────────────────────────

export interface Conversation {
    id: string;
    organization_id: string;
    type: ConversationType;
    name: string | null;
    description: string | null;
    slug: string | null;
    is_public: boolean;
    is_announcement_only: boolean;
    is_archived: boolean;
    category: string | null;
    event_id: string | null;
    project_id: string | null;
    required_credential_type: string | null;
    is_ephemeral: boolean;
    template_id: string | null;
    last_message_at: string | null;
    message_count: number;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface ConversationMember {
    id: string;
    conversation_id: string;
    user_id: string;
    role: ConversationMemberRole;
    last_read_at: string | null;
    last_read_message_id: string | null;
    notification_preference: NotificationPreferenceLevel;
    is_muted: boolean;
    is_pinned: boolean;
    joined_at: string;
}

export interface Message {
    id: string;
    conversation_id: string | null;
    sender_id: string | null;
    parent_message_id: string | null;
    thread_message_count: number;
    thread_last_reply_at: string | null;
    body: string;
    body_html: string | null;
    mentioned_user_ids: string[];
    attachments: MessageAttachment[];
    entity_type: string | null;
    entity_id: string | null;
    is_pinned: boolean;
    pinned_by: string | null;
    pinned_at: string | null;
    is_internal: boolean;
    priority: MessagePriority;
    is_mandatory_read: boolean;
    scheduled_at: string | null;
    is_system_message: boolean;
    edited_at: string | null;
    deleted_at: string | null;
    organization_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface MessageAttachment {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    url: string;
    thumbnail_url?: string;
}

export interface MessageReaction {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
}

export interface MessageReadReceipt {
    message_id: string;
    user_id: string;
    read_at: string;
}

export interface MandatoryReadAcknowledgment {
    id: string;
    message_id: string;
    user_id: string;
    acknowledged_at: string | null;
    escalated_at: string | null;
    escalation_level: number;
    created_at: string;
}

export interface ChannelTemplate {
    id: string;
    organization_id: string;
    name: string;
    event_type: string;
    channels_config: ChannelTemplateConfig[];
    is_active: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChannelTemplateConfig {
    name: string;
    slug: string;
    category: string;
    is_public: boolean;
    is_announcement_only: boolean;
    is_restricted: boolean;
    required_role?: ConversationMemberRole;
    required_credential_type?: string;
}

// ─── Derived / View Types ────────────────────────────────────

export interface ReactionAggregate {
    emoji: string;
    count: number;
    user_ids: string[];
    has_reacted: boolean;
}

export interface ConversationListItem extends Conversation {
    unread_count: number;
    last_message: MessagePreview | null;
    members: ConversationMemberPreview[];
    my_membership: ConversationMember | null;
}

export interface MessagePreview {
    id: string;
    body: string;
    sender_name: string;
    sender_id: string | null;
    created_at: string;
    is_system_message: boolean;
}

export interface ConversationMemberPreview {
    user_id: string;
    name: string;
    avatar_url: string | null;
    role: ConversationMemberRole;
}

export interface MessageWithSender extends Message {
    sender: {
        id: string;
        name: string;
        avatar_url: string | null;
    } | null;
    reactions: ReactionAggregate[];
}

// ─── Payloads ────────────────────────────────────────────────

export interface SendMessagePayload {
    conversation_id?: string;
    parent_message_id?: string;
    body: string;
    body_html?: string;
    mentioned_user_ids?: string[];
    attachments?: MessageAttachment[];
    entity_type?: string;
    entity_id?: string;
    is_internal?: boolean;
    priority?: MessagePriority;
    is_mandatory_read?: boolean;
    scheduled_at?: string;
}

export interface CreateConversationPayload {
    type: ConversationType;
    name?: string;
    description?: string;
    slug?: string;
    is_public?: boolean;
    is_announcement_only?: boolean;
    category?: string;
    event_id?: string;
    project_id?: string;
    member_ids: string[];
}

export interface UpdateConversationPayload {
    name?: string;
    description?: string;
    is_public?: boolean;
    is_announcement_only?: boolean;
    is_archived?: boolean;
    category?: string;
}

// ─── Channel Categories (SSOT) ──────────────────────────────

export const CHANNEL_CATEGORIES = [
    "production",
    "safety",
    "logistics",
    "client",
    "creative",
    "general",
] as const;

export type ChannelCategory = (typeof CHANNEL_CATEGORIES)[number];

export const CHANNEL_CATEGORY_LABELS: Record<ChannelCategory, string> = {
    production: "Production",
    safety: "Safety & Security",
    logistics: "Logistics",
    client: "Client Communications",
    creative: "Creative",
    general: "General",
};

// ─── Quick Reactions (SSOT) ─────────────────────────────────

export const QUICK_REACTIONS = ["✅", "👍", "🔧", "⚠️", "🎯", "🔴"] as const;

// ─── Feature Flags ──────────────────────────────────────────

export const MESSAGING_FEATURE_FLAGS = {
    MESSAGING_ENABLED: "messaging_enabled",
    MESSAGING_CHANNELS: "messaging_channels",
    MESSAGING_THREADS: "messaging_threads",
    MESSAGING_REACTIONS: "messaging_reactions",
    MESSAGING_MANDATORY_READ: "messaging_mandatory_read",
    MESSAGING_SCHEDULED: "messaging_scheduled",
    MESSAGING_AI_SUMMARY: "messaging_ai_summary",
    MESSAGING_VOICE: "messaging_voice",
} as const;
