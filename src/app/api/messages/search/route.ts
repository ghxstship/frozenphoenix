import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const conversationId = searchParams.get("conversation_id");
    const entityType = searchParams.get("entity_type");
    const entityId = searchParams.get("entity_id");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "25", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    if (!query || query.trim().length < 2) {
        return ApiErrors.badRequest("Query must be at least 2 characters");
    }

    // Get user's conversation memberships for access control
    const { data: memberships } = await serverFromTable(admin!, "conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

    const memberConversationIds = ((memberships ?? []) as Array<Record<string, unknown>>).map(
        (m) => m.conversation_id as string
    );

    if (memberConversationIds.length === 0) {
        return NextResponse.json({ results: [], total: 0 });
    }

    // Build search query
    let searchQuery = serverFromTable(admin!, "messages")
        .select(
            "id, conversation_id, sender_id, body, priority, created_at, edited_at, entity_type, entity_id, profiles:sender_id(id, name, avatar_url), conversations:conversation_id(id, name, type, category)",
            { count: "exact" }
        )
        .ilike("body", `%${query}%`)
        .is("deleted_at", null)
        .in("conversation_id", memberConversationIds)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    // Optional filters
    if (conversationId) {
        searchQuery = searchQuery.eq("conversation_id", conversationId);
    }
    if (entityType && entityId) {
        searchQuery = searchQuery.eq("entity_type", entityType).eq("entity_id", entityId);
    }

    const { data: messages, error, count } = await searchQuery;

    if (error) {
        logger.error("[GET /api/messages/search]", { error });
        return ApiErrors.internalError("Failed to search messages");
    }

    const results = ((messages ?? []) as Array<Record<string, unknown>>).map((raw) => {
        const sender = raw.profiles as { id: string; name: string; avatar_url: string | null } | null;
        const conversation = raw.conversations as { id: string; name: string | null; type: string; category: string | null } | null;

        return {
            id: raw.id,
            conversation_id: raw.conversation_id,
            conversation_name: conversation?.name ?? null,
            conversation_type: conversation?.type ?? null,
            sender_id: raw.sender_id,
            sender_name: sender?.name ?? "Unknown",
            sender_avatar: sender?.avatar_url ?? null,
            body: raw.body,
            priority: raw.priority,
            created_at: raw.created_at,
            edited_at: raw.edited_at,
            entity_type: raw.entity_type,
            entity_id: raw.entity_id,
        };
    });

    return NextResponse.json({
        results,
        total: count ?? results.length,
        query,
        limit,
        offset,
    });
}
