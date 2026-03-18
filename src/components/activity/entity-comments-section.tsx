"use client";

import React from "react";
import {
    useDeleteMessage,
    useEditMessage,
    useEntityMessages,
    useSendMessage,
} from "@/lib/supabase/hooks-messaging";
import { useComments } from "@/lib/supabase/hooks-admin";
import { useCommentsRealtime } from "@/lib/supabase/realtime";
import { useAuth } from "@/lib/supabase/auth-context";
import { type CommentItem, CommentsSection } from "./comments-section";
import type { MessageWithSender } from "@/types/messaging";

interface EntityCommentsSectionProps {
    entityType: string;
    entityId: string;
    className?: string;
}

function mapMessageToComment(msg: MessageWithSender): CommentItem {
    return {
        id: msg.id,
        authorId: msg.sender_id ?? "",
        authorName: msg.sender?.name ?? "Unknown",
        content: msg.body,
        createdAt: msg.created_at,
        updatedAt: msg.edited_at ?? undefined,
    };
}

export function EntityCommentsSection({
    entityType,
    entityId,
    className,
}: EntityCommentsSectionProps) {
    const { user } = useAuth();
    const { data: messages = [] } = useEntityMessages(entityType, entityId);
    // Legacy comments hook — kept wired for backwards compat with non-messaging entities
    const { data: _legacyComments } = useComments(
        entityType as "project" | "task" | "approval" | "deal",
        entityId
    );
    useCommentsRealtime(entityType, entityId);
    const sendMessage = useSendMessage();
    const editMessage = useEditMessage();
    const deleteMessage = useDeleteMessage();

    const comments: CommentItem[] = messages.map(mapMessageToComment);

    const handleAddComment = async (content: string) => {
        await sendMessage.mutateAsync({
            body: content,
            entity_type: entityType,
            entity_id: entityId,
        });
    };

    const handleEditComment = async (id: string, content: string) => {
        await editMessage.mutateAsync({ messageId: id, body: content });
    };

    const handleDeleteComment = async (id: string) => {
        await deleteMessage.mutateAsync({ messageId: id });
    };

    return (
        <CommentsSection
            comments={comments}
            currentUserId={user?.id}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            className={className}
        />
    );
}
