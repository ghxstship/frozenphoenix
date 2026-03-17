"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "./client";
import type {
    Conversation,
    ConversationListItem,
    ConversationMember,
    ConversationMemberPreview,
    CreateConversationPayload,
    Message,
    MessageWithSender,
    SendMessagePayload,
    UpdateConversationPayload,
} from "@/types/messaging";

// ─── Constants ───────────────────────────────────────────────

const PAGE_SIZE = 50;

// ─── Query Keys ──────────────────────────────────────────────

export const messagingKeys = {
    all: ["messaging"] as const,
    conversations: () => [...messagingKeys.all, "conversations"] as const,
    conversation: (id: string) => [...messagingKeys.conversations(), id] as const,
    conversationMembers: (id: string) => [...messagingKeys.conversation(id), "members"] as const,
    messages: (conversationId: string) =>
        [...messagingKeys.all, "messages", conversationId] as const,
    entityMessages: (entityType: string, entityId: string) =>
        [...messagingKeys.all, "entity-messages", entityType, entityId] as const,
    threadMessages: (parentId: string) => [...messagingKeys.all, "thread", parentId] as const,
    unreadCounts: () => [...messagingKeys.all, "unread-counts"] as const,
    reactions: (messageId: string) => [...messagingKeys.all, "reactions", messageId] as const,
    pinnedMessages: (conversationId: string) =>
        [...messagingKeys.all, "pinned", conversationId] as const,
    search: (query: string) => [...messagingKeys.all, "search", query] as const,
};

// ─── Query Hooks ─────────────────────────────────────────────

export function useConversations() {
    return useQuery({
        queryKey: messagingKeys.conversations(),
        queryFn: async (): Promise<ConversationListItem[]> => {
            const supabase = getSupabase();

            // Get conversations the user is a member of
            const { data: memberships, error: memErr } = await supabase
                .from("conversation_members")
                .select(
                    "conversation_id, last_read_at, is_muted, is_pinned, notification_preference, role"
                )
                .order("joined_at", { ascending: false });

            if (memErr || !memberships) return [];

            const conversationIds = (memberships as Record<string, unknown>[]).map(
                (m) => m.conversation_id as string
            );
            if (conversationIds.length === 0) return [];

            const { data: conversations, error: convErr } = await supabase
                .from("conversations")
                .select("*")
                .in("id", conversationIds)
                .eq("is_archived", false)
                .order("last_message_at", { ascending: false, nullsFirst: false });

            if (convErr || !conversations) return [];

            // Build list items with unread counts
            return (conversations as Record<string, unknown>[]).map((conv) => {
                const membership = (memberships as Record<string, unknown>[]).find(
                    (m) => m.conversation_id === conv.id
                );
                const lastReadAt = membership?.last_read_at as string | null;
                const lastMessageAt = conv.last_message_at as string | null;
                const unreadCount =
                    lastReadAt && lastMessageAt && new Date(lastMessageAt) > new Date(lastReadAt)
                        ? 1 // Simplified — real count computed server-side
                        : 0;

                return {
                    ...(conv as unknown as Conversation),
                    unread_count: unreadCount,
                    last_message: null,
                    members: [],
                    my_membership: membership
                        ? {
                              ...(membership as unknown as ConversationMember),
                              conversation_id: conv.id as string,
                              user_id: "",
                              id: "",
                              joined_at: "",
                          }
                        : null,
                } as ConversationListItem;
            });
        },
        staleTime: 30_000,
    });
}

export function useConversation(conversationId: string | undefined) {
    return useQuery({
        queryKey: messagingKeys.conversation(conversationId ?? ""),
        queryFn: async (): Promise<Conversation | null> => {
            if (!conversationId) return null;
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("conversations")
                .select("*")
                .eq("id", conversationId)
                .single();
            if (error || !data) return null;
            return data as unknown as Conversation;
        },
        enabled: !!conversationId,
    });
}

export function useConversationMembers(conversationId: string | undefined) {
    return useQuery({
        queryKey: messagingKeys.conversationMembers(conversationId ?? ""),
        queryFn: async (): Promise<ConversationMemberPreview[]> => {
            if (!conversationId) return [];
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("conversation_members")
                .select("user_id, role, user_profiles(display_name, avatar_url)")
                .eq("conversation_id", conversationId);
            if (error || !data) return [];
            return (data as Record<string, unknown>[]).map((m) => {
                const profile = m.user_profiles as {
                    display_name: string;
                    avatar_url: string | null;
                } | null;
                return {
                    user_id: m.user_id as string,
                    name: profile?.display_name ?? "Unknown",
                    avatar_url: profile?.avatar_url ?? null,
                    role: m.role as ConversationMemberPreview["role"],
                };
            });
        },
        enabled: !!conversationId,
    });
}

export function useMessages(conversationId: string | undefined) {
    return useInfiniteQuery({
        queryKey: messagingKeys.messages(conversationId ?? ""),
        queryFn: async ({ pageParam }): Promise<MessageWithSender[]> => {
            if (!conversationId) return [];
            const supabase = getSupabase();

            let query = supabase
                .from("messages")
                .select("*, user_profiles:sender_id(id, display_name, avatar_url)")
                .eq("conversation_id", conversationId)
                .is("deleted_at", null)
                .is("parent_message_id", null)
                .order("created_at", { ascending: false })
                .limit(PAGE_SIZE);

            if (pageParam) {
                query = query.lt("created_at", pageParam as string);
            }

            const { data, error } = await query;
            if (error || !data) return [];

            return (data as Record<string, unknown>[]).map(mapMessageWithSender);
        },
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => {
            if (lastPage.length < PAGE_SIZE) return undefined;
            return lastPage[lastPage.length - 1]?.created_at ?? undefined;
        },
        enabled: !!conversationId,
    });
}

export function useEntityMessages(entityType: string | undefined, entityId: string | undefined) {
    return useQuery({
        queryKey: messagingKeys.entityMessages(entityType ?? "", entityId ?? ""),
        queryFn: async (): Promise<MessageWithSender[]> => {
            if (!entityType || !entityId) return [];
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("messages")
                .select("*, user_profiles:sender_id(id, display_name, avatar_url)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .is("deleted_at", null)
                .order("created_at", { ascending: true });
            if (error || !data) return [];
            return (data as Record<string, unknown>[]).map(mapMessageWithSender);
        },
        enabled: !!entityType && !!entityId,
    });
}

export function useThreadMessages(parentMessageId: string | undefined) {
    return useQuery({
        queryKey: messagingKeys.threadMessages(parentMessageId ?? ""),
        queryFn: async (): Promise<MessageWithSender[]> => {
            if (!parentMessageId) return [];
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("messages")
                .select("*, user_profiles:sender_id(id, display_name, avatar_url)")
                .eq("parent_message_id", parentMessageId)
                .is("deleted_at", null)
                .order("created_at", { ascending: true });
            if (error || !data) return [];
            return (data as Record<string, unknown>[]).map(mapMessageWithSender);
        },
        enabled: !!parentMessageId,
    });
}

export function useUnreadCounts() {
    return useQuery({
        queryKey: messagingKeys.unreadCounts(),
        queryFn: async (): Promise<number> => {
            const supabase = getSupabase();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return 0;

            const { data, error } = await supabase.rpc("get_messaging_unread_count", {
                p_user_id: user.id,
            });
            if (error) return 0;
            return (data as number) ?? 0;
        },
        staleTime: 60_000,
        refetchInterval: 60_000,
    });
}

export function usePinnedMessages(conversationId: string | undefined) {
    return useQuery({
        queryKey: messagingKeys.pinnedMessages(conversationId ?? ""),
        queryFn: async (): Promise<MessageWithSender[]> => {
            if (!conversationId) return [];
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("messages")
                .select("*, user_profiles:sender_id(id, display_name, avatar_url)")
                .eq("conversation_id", conversationId)
                .eq("is_pinned", true)
                .is("deleted_at", null)
                .order("pinned_at", { ascending: false });
            if (error || !data) return [];
            return (data as Record<string, unknown>[]).map(mapMessageWithSender);
        },
        enabled: !!conversationId,
    });
}

// ─── Mutation Hooks ──────────────────────────────────────────

export function useCreateConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateConversationPayload): Promise<Conversation | null> => {
            const res = await fetch("/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) return null;
            const json = await res.json();
            return json.data ?? json;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
        },
    });
}

export function useUpdateConversation(conversationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateConversationPayload): Promise<Conversation | null> => {
            const res = await fetch(`/api/conversations/${conversationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) return null;
            const json = await res.json();
            return json.data ?? json;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(conversationId) });
            queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
        },
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SendMessagePayload): Promise<Message | null> => {
            const conversationId = payload.conversation_id;
            const entityType = payload.entity_type;
            const entityId = payload.entity_id;

            // Route to the correct API endpoint
            let url: string;
            if (conversationId) {
                url = `/api/conversations/${conversationId}/messages`;
            } else if (entityType && entityId) {
                url = `/api/messages/entity`;
            } else {
                return null;
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) return null;
            const json = await res.json();
            return json.data ?? json;
        },
        onSuccess: (data, variables) => {
            if (variables.conversation_id) {
                queryClient.invalidateQueries({
                    queryKey: messagingKeys.messages(variables.conversation_id),
                });
                queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
            }
            if (variables.entity_type && variables.entity_id) {
                queryClient.invalidateQueries({
                    queryKey: messagingKeys.entityMessages(
                        variables.entity_type,
                        variables.entity_id
                    ),
                });
            }
            if (variables.parent_message_id) {
                queryClient.invalidateQueries({
                    queryKey: messagingKeys.threadMessages(variables.parent_message_id),
                });
            }
            queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCounts() });
        },
    });
}

export function useEditMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            body,
        }: {
            messageId: string;
            body: string;
            conversationId?: string;
        }): Promise<Message | null> => {
            const res = await fetch(`/api/messages/${messageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body }),
            });
            if (!res.ok) return null;
            const json = await res.json();
            return json.data ?? json;
        },
        onSuccess: (_data, variables) => {
            if (variables.conversationId) {
                queryClient.invalidateQueries({
                    queryKey: messagingKeys.messages(variables.conversationId),
                });
            }
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
        }: {
            messageId: string;
            conversationId?: string;
        }): Promise<boolean> => {
            const res = await fetch(`/api/messages/${messageId}`, {
                method: "DELETE",
            });
            return res.ok;
        },
        onSuccess: (_data, variables) => {
            if (variables.conversationId) {
                queryClient.invalidateQueries({
                    queryKey: messagingKeys.messages(variables.conversationId),
                });
            }
            queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
        },
    });
}

export function useToggleReaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            emoji,
            remove,
        }: {
            messageId: string;
            emoji: string;
            remove?: boolean;
            conversationId?: string;
        }): Promise<boolean> => {
            const res = await fetch(`/api/messages/${messageId}/reactions`, {
                method: remove ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emoji }),
            });
            return res.ok;
        },
        onSuccess: (_data, variables) => {
            if (variables.conversationId) {
                queryClient.invalidateQueries({
                    queryKey: messagingKeys.messages(variables.conversationId),
                });
            }
        },
    });
}

export function usePinMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            pin,
        }: {
            messageId: string;
            pin: boolean;
            conversationId?: string;
        }): Promise<boolean> => {
            const res = await fetch(`/api/messages/${messageId}/pin`, {
                method: pin ? "POST" : "DELETE",
            });
            return res.ok;
        },
        onSuccess: (_data, variables) => {
            if (variables.conversationId) {
                queryClient.invalidateQueries({
                    queryKey: messagingKeys.messages(variables.conversationId),
                });
                queryClient.invalidateQueries({
                    queryKey: messagingKeys.pinnedMessages(variables.conversationId),
                });
            }
        },
    });
}

export function useMarkRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            conversationId,
        }: {
            messageId: string;
            conversationId: string;
        }): Promise<boolean> => {
            const res = await fetch(`/api/messages/${messageId}/read`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversation_id: conversationId }),
            });
            return res.ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCounts() });
            queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
        },
    });
}

export function useAcknowledgeMandatoryRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageId }: { messageId: string }): Promise<boolean> => {
            const supabase = getSupabase();
            const { error } = await supabase
                .from("mandatory_read_acknowledgments")
                .update({ acknowledged_at: new Date().toISOString() })
                .eq("message_id", messageId);
            return !error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: messagingKeys.all });
        },
    });
}

export function useAddConversationMembers(conversationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (memberIds: string[]): Promise<boolean> => {
            const res = await fetch(`/api/conversations/${conversationId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ member_ids: memberIds }),
            });
            return res.ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.conversationMembers(conversationId),
            });
        },
    });
}

export function useRemoveConversationMember(conversationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string): Promise<boolean> => {
            const res = await fetch(`/api/conversations/${conversationId}/members`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId }),
            });
            return res.ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.conversationMembers(conversationId),
            });
        },
    });
}

// ─── Org Members (for people picker) ─────────────────────────

export function useOrgMembers() {
    return useQuery({
        queryKey: [...messagingKeys.all, "org-members"] as const,
        queryFn: async (): Promise<
            Array<{ id: string; name: string; avatar_url: string | null }>
        > => {
            const supabase = getSupabase();

            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return [];

            // Get user's default org via org_memberships
            const { data: myMembership } = await supabase
                .from("org_memberships")
                .select("organization_id")
                .eq("user_id", user.id)
                .eq("is_default_org", true)
                .eq("status", "active")
                .single();

            const orgId = (myMembership as Record<string, unknown> | null)?.organization_id as
                | string
                | null;
            if (!orgId) return [];

            // Get all org members except current user via org_memberships → user_profiles
            const { data: members, error } = await supabase
                .from("org_memberships")
                .select("user_id, user_profiles(id, display_name, avatar_url)")
                .eq("organization_id", orgId)
                .eq("status", "active")
                .neq("user_id", user.id);

            if (error || !members) return [];

            return (members as Record<string, unknown>[])
                .map((m) => {
                    const up = m.user_profiles as Record<string, unknown> | null;
                    if (!up) return null;
                    return {
                        id: up.id as string,
                        name: up.display_name as string,
                        avatar_url: (up.avatar_url as string | null) ?? null,
                    };
                })
                .filter((x): x is NonNullable<typeof x> => x !== null);
        },
        staleTime: 120_000,
    });
}

// ─── Phase 3: Voice Messages, AI Summaries, Translation, PTT, SMS ────

export type VoiceMessagePayload = {
    conversation_id: string;
    audio_blob: Blob;
    duration_seconds: number;
};

export type AISummaryResult = {
    summary: string;
    action_items: string[];
    key_decisions: string[];
    message_count: number;
    since: string;
};

export type TranslationResult = {
    translated_text: string;
    source_language: string;
    target_language: string;
};

export function useSendVoiceMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: VoiceMessagePayload): Promise<Message | null> => {
            const formData = new FormData();
            formData.append("audio", payload.audio_blob, "voice.webm");
            formData.append("conversation_id", payload.conversation_id);
            formData.append("duration_seconds", String(payload.duration_seconds));

            const res = await fetch(`/api/conversations/${payload.conversation_id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversation_id: payload.conversation_id,
                    body: `🎤 Voice message (${Math.round(payload.duration_seconds)}s)`,
                    attachments: [
                        {
                            type: "voice",
                            duration_seconds: payload.duration_seconds,
                            mime_type: "audio/webm",
                        },
                    ],
                }),
            });
            if (!res.ok) return null;
            const json = await res.json();
            return json.data ?? json;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.messages(variables.conversation_id),
            });
            queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
        },
    });
}

export function useAISummary(conversationId: string | undefined) {
    return useMutation({
        mutationFn: async (): Promise<AISummaryResult | null> => {
            if (!conversationId) return null;
            const res = await fetch(`/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "summarize_conversation",
                    conversation_id: conversationId,
                }),
            });
            if (!res.ok) return null;
            const json = await res.json();
            return (json.data as AISummaryResult) ?? null;
        },
    });
}

export function useTranslateMessage() {
    return useMutation({
        mutationFn: async ({
            messageId,
            targetLanguage,
        }: {
            messageId: string;
            body: string;
            targetLanguage: string;
        }): Promise<TranslationResult | null> => {
            const res = await fetch(`/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "translate_message",
                    message_id: messageId,
                    target_language: targetLanguage,
                }),
            });
            if (!res.ok) return null;
            const json = await res.json();
            return (json.data as TranslationResult) ?? null;
        },
    });
}

export function useUpdateSMSFallback(conversationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (enabled: boolean): Promise<boolean> => {
            const res = await fetch(`/api/conversations/${conversationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sms_fallback_enabled: enabled }),
            });
            return res.ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.conversation(conversationId),
            });
        },
    });
}

// ─── Helper: Map raw DB record → MessageWithSender ──────────

function mapMessageWithSender(raw: Record<string, unknown>): MessageWithSender {
    const up = raw.user_profiles as {
        id: string;
        display_name: string;
        avatar_url: string | null;
    } | null;
    const sender = up ? { id: up.id, name: up.display_name, avatar_url: up.avatar_url } : null;
    return {
        id: raw.id as string,
        conversation_id: raw.conversation_id as string | null,
        sender_id: raw.sender_id as string | null,
        parent_message_id: raw.parent_message_id as string | null,
        thread_message_count: (raw.thread_message_count as number) ?? 0,
        thread_last_reply_at: raw.thread_last_reply_at as string | null,
        body: raw.body as string,
        body_html: raw.body_html as string | null,
        mentioned_user_ids: (raw.mentioned_user_ids as string[]) ?? [],
        attachments: (raw.attachments as MessageWithSender["attachments"]) ?? [],
        entity_type: raw.entity_type as string | null,
        entity_id: raw.entity_id as string | null,
        is_pinned: (raw.is_pinned as boolean) ?? false,
        pinned_by: raw.pinned_by as string | null,
        pinned_at: raw.pinned_at as string | null,
        is_internal: (raw.is_internal as boolean) ?? false,
        priority: (raw.priority as MessageWithSender["priority"]) ?? "normal",
        is_mandatory_read: (raw.is_mandatory_read as boolean) ?? false,
        scheduled_at: raw.scheduled_at as string | null,
        is_system_message: (raw.is_system_message as boolean) ?? false,
        edited_at: raw.edited_at as string | null,
        deleted_at: raw.deleted_at as string | null,
        organization_id: raw.organization_id as string | null,
        created_at: raw.created_at as string,
        updated_at: raw.updated_at as string,
        sender,
        reactions: [],
    };
}
