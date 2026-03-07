"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Hash, MessageSquare, Users, X } from "lucide-react";
import { useCreateConversation } from "@/lib/supabase/hooks-messaging";
import type { ConversationType } from "@/types/messaging";

interface NewConversationDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (conversationId: string) => void;
    members?: Array<{ id: string; name: string; avatar_url?: string | null }>;
    className?: string;
}

type TabValue = "dm" | "group" | "channel";

export function NewConversationDialog({
    open,
    onClose,
    onCreated,
    members = [],
    className,
}: NewConversationDialogProps) {
    const [tab, setTab] = React.useState<TabValue>("dm");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [isPublic, setIsPublic] = React.useState(false);

    const createConversation = useCreateConversation();

    const filteredMembers = React.useMemo(() => {
        if (!searchQuery) return members;
        const q = searchQuery.toLowerCase();
        return members.filter((m) => m.name.toLowerCase().includes(q));
    }, [members, searchQuery]);

    const selectedMemberDetails = React.useMemo(
        () => members.filter((m) => selectedUsers.includes(m.id)),
        [members, selectedUsers]
    );

    const toggleUser = (userId: string) => {
        setSelectedUsers((prev) => {
            if (tab === "dm") return [userId];
            return prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId];
        });
    };

    const handleCreate = async () => {
        let type: ConversationType = "dm";
        if (tab === "group") type = "group";
        if (tab === "channel") type = "channel";

        createConversation.mutate(
            {
                type,
                name: tab === "dm" ? undefined : name || undefined,
                description: tab === "channel" ? description || undefined : undefined,
                is_public: tab === "channel" ? isPublic : undefined,
                member_ids: selectedUsers,
            },
            {
                onSuccess: (data) => {
                    if (data?.id) onCreated?.(data.id);
                    resetForm();
                    onClose();
                },
            }
        );
    };

    const resetForm = () => {
        setSearchQuery("");
        setSelectedUsers([]);
        setName("");
        setDescription("");
        setIsPublic(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const canCreate =
        (tab === "dm" && selectedUsers.length === 1) ||
        (tab === "group" && selectedUsers.length >= 2) ||
        (tab === "channel" && name.trim().length > 0);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="New conversation">
            <div className="fixed inset-0 bg-black/40" onClick={handleClose} aria-hidden="true" />
            <div className={cn("relative z-50 w-full max-w-md rounded-xl border border-border bg-background shadow-xl", className)}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h2 className="text-base font-semibold">New Conversation</h2>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose} aria-label="Close">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border" role="tablist">
                    {([
                        { value: "dm" as const, label: "Direct Message", icon: MessageSquare },
                        { value: "group" as const, label: "Group", icon: Users },
                        { value: "channel" as const, label: "Channel", icon: Hash },
                    ]).map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            role="tab"
                            aria-selected={tab === value}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
                                tab === value
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => {
                                setTab(value);
                                setSelectedUsers([]);
                            }}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Name field for group/channel */}
                    {(tab === "group" || tab === "channel") && (
                        <input
                            type="text"
                            placeholder={tab === "group" ? "Group name" : "Channel name"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label={tab === "group" ? "Group name" : "Channel name"}
                        />
                    )}

                    {/* Description for channel */}
                    {tab === "channel" && (
                        <>
                            <input
                                type="text"
                                placeholder="Description (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label="Channel description"
                            />
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="rounded border-border"
                                />
                                Public channel (anyone in the org can join)
                            </label>
                        </>
                    )}

                    {/* Selected chips */}
                    {selectedMemberDetails.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {selectedMemberDetails.map((m) => (
                                <Badge key={m.id} variant="secondary" className="gap-1 pr-1">
                                    {m.name}
                                    <button
                                        onClick={() => toggleUser(m.id)}
                                        className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                                        aria-label={`Remove ${m.name}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Member search */}
                    {(tab === "dm" || tab === "group") && (
                        <>
                            <SearchInput
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                placeholder="Search people..."
                                className="h-9"
                            />
                            <div className="max-h-48 overflow-y-auto space-y-0.5">
                                {filteredMembers.map((member) => {
                                    const isSelected = selectedUsers.includes(member.id);
                                    return (
                                        <button
                                            key={member.id}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                                                isSelected ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                                            )}
                                            onClick={() => toggleUser(member.id)}
                                        >
                                            <Avatar name={member.name} size="sm" />
                                            <span className="truncate">{member.name}</span>
                                            {isSelected && (
                                                <span className="ml-auto text-xs text-primary">✓</span>
                                            )}
                                        </button>
                                    );
                                })}
                                {filteredMembers.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">No members found</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleCreate}
                        disabled={!canCreate || createConversation.isPending}
                    >
                        {createConversation.isPending ? "Creating..." : "Create"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
