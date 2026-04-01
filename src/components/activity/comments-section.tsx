"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/form/textarea";
import { StaggerItem } from "@/components/ui/stagger-container";
import { MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

export interface CommentItem {
    id: string;
    authorId: string;
    authorName: string;
    authorInitials?: string | undefined;
    content: string;
    createdAt: string;
    updatedAt?: string | undefined;
}

export interface CommentsSectionProps {
    comments: CommentItem[];
    currentUserId?: string | undefined;
    onAddComment?: (content: string) => Promise<void> | undefined;
    onEditComment?: (id: string, content: string) => Promise<void> | undefined;
    onDeleteComment?: (id: string) => Promise<void> | undefined;
    className?: string | undefined;
}

export function CommentsSection({
    comments,
    currentUserId,
    onAddComment,
    onEditComment,
    onDeleteComment,
    className,
}: CommentsSectionProps) {
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Click-outside and Escape to close menu
    useEffect(() => {
        if (!menuOpenId) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpenId(null);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpenId(null);
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [menuOpenId]);

    // Escape to cancel editing
    useEffect(() => {
        if (!editingId) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setEditingId(null);
                setEditContent("");
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [editingId]);

    const handleSubmit = useCallback(async () => {
        if (!newComment.trim() || !onAddComment) return;
        setIsSubmitting(true);
        try {
            await onAddComment(newComment.trim());
            setNewComment("");
        } finally {
            setIsSubmitting(false);
        }
    }, [newComment, onAddComment]);

    const handleEdit = useCallback(
        async (id: string) => {
            if (!editContent.trim() || !onEditComment) return;
            setIsSubmitting(true);
            try {
                await onEditComment(id, editContent.trim());
                setEditingId(null);
                setEditContent("");
            } finally {
                setIsSubmitting(false);
            }
        },
        [editContent, onEditComment]
    );

    const handleDelete = async (id: string) => {
        if (!onDeleteComment) return;
        await onDeleteComment(id);
        setMenuOpenId(null);
    };

    const startEditing = (comment: CommentItem) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
        setMenuOpenId(null);
    };

    // Ctrl/Cmd+Enter to submit new comment
    const handleNewCommentKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
            }
        },
        [handleSubmit]
    );

    // Ctrl/Cmd+Enter to save edit
    const handleEditKeyDown = useCallback(
        (id: string) => (e: React.KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleEdit(id);
            }
        },
        [handleEdit]
    );

    return (
        <div className={cn("density-gap-section", className)}>
            {/* Comment Input */}
            {onAddComment && (
                <div className="flex gap-3">
                    <Avatar name="You" size="sm" />
                    <div className="flex-1 space-y-2">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleNewCommentKeyDown}
                            placeholder="Add a comment..."
                            className="min-h-[60px] resize-none"
                            aria-label="New comment"
                        />
                        <div className="flex items-center justify-between">
                            <span className="density-caption text-muted-foreground/50">
                                <kbd className="bg-muted px-1 py-0.5 rounded density-caption">
                                    ⌘↵
                                </kbd>{" "}
                                to send
                            </span>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || isSubmitting}
                            >
                                <Send className="h-4 w-4" />
                                Comment
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground" role="status">
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div className="space-y-1" role="feed" aria-label="Comments">
                    {comments.map((comment, index) => {
                        const isOwner = currentUserId === comment.authorId;
                        const isEditing = editingId === comment.id;

                        return (
                            <StaggerItem key={comment.id} index={index} stagger="tight">
                                <div
                                    className="group flex gap-3 rounded-lg py-2.5 px-2 hover:bg-muted/40 transition-colors"
                                    role="article"
                                    aria-label={`Comment by ${comment.authorName}`}
                                >
                                    <Avatar name={comment.authorName} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {comment.authorName}
                                                </span>
                                                <time
                                                    className="density-caption text-muted-foreground"
                                                    dateTime={comment.createdAt}
                                                >
                                                    {formatRelativeTime(comment.createdAt)}
                                                    {comment.updatedAt && " (edited)"}
                                                </time>
                                            </div>
                                            {isOwner && !isEditing && (
                                                <div
                                                    className="relative"
                                                    ref={
                                                        menuOpenId === comment.id
                                                            ? menuRef
                                                            : undefined
                                                    }
                                                >
                                                    <Tooltip content="Comment actions" side="top">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                                                            onClick={() =>
                                                                setMenuOpenId(
                                                                    menuOpenId === comment.id
                                                                        ? null
                                                                        : comment.id
                                                                )
                                                            }
                                                            aria-expanded={
                                                                menuOpenId === comment.id
                                                            }
                                                            aria-haspopup="true"
                                                            aria-label="Comment actions"
                                                        >
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Tooltip>
                                                    {menuOpenId === comment.id && (
                                                        <div
                                                            className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-lg border border-border bg-popover p-1 shadow-lg animate-scale-in origin-top-right"
                                                            role="menu"
                                                            aria-label="Comment actions"
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                role="menuitem"
                                                                onClick={() =>
                                                                    startEditing(comment)
                                                                }
                                                                className="w-full justify-start gap-2 text-xs h-auto py-1.5"
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                role="menuitem"
                                                                onClick={() =>
                                                                    handleDelete(comment.id)
                                                                }
                                                                className="w-full justify-start gap-2 text-xs h-auto py-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {isEditing ? (
                                            <div className="mt-2 space-y-2">
                                                <Textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    onKeyDown={handleEditKeyDown(comment.id)}
                                                    className="min-h-[60px] resize-none"
                                                    aria-label="Edit comment"
                                                    autoFocus
                                                />
                                                <div className="flex items-center justify-between">
                                                    <span className="density-caption text-muted-foreground/50">
                                                        <kbd className="bg-muted px-1 py-0.5 rounded density-caption">
                                                            esc
                                                        </kbd>{" "}
                                                        cancel ·{" "}
                                                        <kbd className="bg-muted px-1 py-0.5 rounded density-caption">
                                                            ⌘↵
                                                        </kbd>{" "}
                                                        save
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingId(null);
                                                                setEditContent("");
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleEdit(comment.id)}
                                                            disabled={
                                                                !editContent.trim() || isSubmitting
                                                            }
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </StaggerItem>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
