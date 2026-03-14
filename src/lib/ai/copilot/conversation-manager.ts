/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Conversation Manager
   
   Handles conversation lifecycle:
   1. Create / list / archive conversations
   2. Persist messages (append-only)
   3. Auto-generate conversation titles from first exchange
   4. Context carryover between sessions
   
   All operations go through the admin client to ensure
   RLS-bypassed writes while respecting org scoping.
   ═══════════════════════════════════════════════════════════════ */

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/server";
import type { AIConversation, AIMessage, ChatRole } from "../types";

// ─── Types ───────────────────────────────────────────────────

export interface CreateConversationParams {
    userId: string;
    orgId: string;
    workspaceContext?: string;
    modelId?: string;
    title?: string;
}

export interface AppendMessageParams {
    conversationId: string;
    role: ChatRole;
    content: string;
    tokenCountInput?: number;
    tokenCountOutput?: number;
    modelId?: string;
    latencyMs?: number;
    toolCalls?: unknown[];
    attachments?: unknown[];
}

export interface ListConversationsParams {
    userId: string;
    orgId: string;
    archived?: boolean;
    limit?: number;
    offset?: number;
}

// ─── Conversation CRUD ───────────────────────────────────────

export async function createConversation(
    params: CreateConversationParams
): Promise<AIConversation | null> {
    const supabase = createAdminClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
            user_id: params.userId,
            org_id: params.orgId,
            workspace_context: params.workspaceContext ?? "global",
            model_id: params.modelId,
            title: params.title ?? "New Conversation",
        })
        .select()
        .single();

    if (error) {
        logger.error("ConversationManager create failed", { error: error.message });
        return null;
    }

    return data as AIConversation;
}

export async function getConversation(conversationId: string): Promise<AIConversation | null> {
    const supabase = createAdminClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

    if (error) return null;
    return data as AIConversation;
}

export async function listConversations(
    params: ListConversationsParams
): Promise<AIConversation[]> {
    const supabase = createAdminClient();
    if (!supabase) return [];

    const limit = Math.min(params.limit ?? 50, 100);
    const offset = params.offset ?? 0;

    const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", params.userId)
        .eq("org_id", params.orgId)
        .eq("archived", params.archived ?? false)
        .order("updated_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        logger.error("ConversationManager list failed", { error: error.message });
        return [];
    }

    return (data ?? []) as AIConversation[];
}

export async function archiveConversation(conversationId: string): Promise<boolean> {
    const supabase = createAdminClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from("ai_conversations")
        .update({ archived: true })
        .eq("id", conversationId);

    return !error;
}

export async function pinConversation(conversationId: string, pinned: boolean): Promise<boolean> {
    const supabase = createAdminClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from("ai_conversations")
        .update({ pinned })
        .eq("id", conversationId);

    return !error;
}

export async function updateConversationTitle(
    conversationId: string,
    title: string
): Promise<boolean> {
    const supabase = createAdminClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from("ai_conversations")
        .update({ title })
        .eq("id", conversationId);

    return !error;
}

// ─── Message Persistence ─────────────────────────────────────

export async function appendMessage(params: AppendMessageParams): Promise<AIMessage | null> {
    const supabase = createAdminClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("ai_messages")
        .insert({
            conversation_id: params.conversationId,
            role: params.role,
            content: params.content,
            token_count_input: params.tokenCountInput ?? 0,
            token_count_output: params.tokenCountOutput ?? 0,
            model_id: params.modelId,
            latency_ms: params.latencyMs ?? 0,
            tool_calls: params.toolCalls ?? [],
            attachments: params.attachments ?? [],
        })
        .select()
        .single();

    if (error) {
        logger.error("ConversationManager append message failed", { error: error.message });
        return null;
    }

    return data as AIMessage;
}

export async function getConversationMessages(
    conversationId: string,
    limit = 100,
    offset = 0
): Promise<AIMessage[]> {
    const supabase = createAdminClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) {
        logger.error("ConversationManager get messages failed", { error: error.message });
        return [];
    }

    return (data ?? []) as AIMessage[];
}

/**
 * Convert stored AIMessages back to ChatMessage format for provider input.
 */
export function messagesToChatHistory(
    messages: AIMessage[]
): Array<{ role: ChatRole; content: string; tool_calls?: unknown[] }> {
    return messages.map((m) => ({
        role: m.role as ChatRole,
        content: m.content,
        ...(Array.isArray(m.tool_calls) && m.tool_calls.length > 0
            ? { tool_calls: m.tool_calls as unknown[] }
            : {}),
    }));
}

// ─── Auto Title Generation ───────────────────────────────────

/**
 * Generate a conversation title from the first user message.
 * Returns a short summary (max ~50 chars).
 */
export function generateTitleFromMessage(content: string): string {
    const cleaned = content.replace(/\n/g, " ").trim();
    if (cleaned.length <= 50) return cleaned;

    // Try to cut at a word boundary
    const truncated = cleaned.slice(0, 50);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 30 ? `${truncated.slice(0, lastSpace)}…` : `${truncated}…`;
}
