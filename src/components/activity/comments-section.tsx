"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/form/textarea";
import { Send, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export interface CommentItem {
    id: string;
    authorId: string;
    authorName: string;
    authorInitials?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CommentsSectionProps {
    comments: CommentItem[];
    currentUserId?: string;
    onAddComment?: (content: string) => Promise<void>;
    onEditComment?: (id: string, content: string) => Promise<void>;
    onDeleteComment?: (id: string) => Promise<void>;
    className?: string;
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

    const handleSubmit = async () => {
        if (!newComment.trim() || !onAddComment) return;
        setIsSubmitting(true);
        try {
            await onAddComment(newComment.trim());
            setNewComment("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (id: string) => {
        if (!editContent.trim() || !onEditComment) return;
        setIsSubmitting(true);
        try {
            await onEditComment(id, editContent.trim());
            setEditingId(null);
            setEditContent("");
        } finally {
            setIsSubmitting(false);
        }
    };

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

    return (
        <div className={cn("space-y-4", className)}>
            {/* Comment Input */}
            {onAddComment && (
                <div className="flex gap-3">
                    <Avatar name="You" size="sm" />
                    <div className="flex-1 space-y-2">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="min-h-[60px] resize-none"
                        />
                        <div className="flex justify-end">
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
                <div className="text-center py-8 text-sm text-muted-foreground">
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment, index) => {
                        const isOwner = currentUserId === comment.authorId;
                        const isEditing = editingId === comment.id;

                        return (
                            <div
                                key={comment.id}
                                className="flex gap-3 animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Avatar name={comment.authorName} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{comment.authorName}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatRelativeTime(comment.createdAt)}
                                                {comment.updatedAt && " (edited)"}
                                            </span>
                                        </div>
                                        {isOwner && !isEditing && (
                                            <div className="relative">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}
                                                >
                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                </Button>
                                                {menuOpenId === comment.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() => setMenuOpenId(null)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-lg border border-border bg-popover p-1 shadow-lg">
                                                            <button
                                                                onClick={() => startEditing(comment)}
                                                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-secondary"
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(comment.id)}
                                                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {isEditing ? (
                                        <div className="mt-2 space-y-2">
                                            <Textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="min-h-[60px] resize-none"
                                            />
                                            <div className="flex gap-2 justify-end">
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
                                                    disabled={!editContent.trim() || isSubmitting}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
