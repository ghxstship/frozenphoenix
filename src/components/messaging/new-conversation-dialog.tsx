"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Hash, MessageSquare, Users, X } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useCreateConversation } from "@/lib/supabase/hooks-messaging";
import type { ConversationType } from "@/types/messaging";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

interface NewConversationDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated?: ((conversationId: string) => void) | undefined;
    members?: Array<{ id: string; name: string; avatar_url?: string | null }> | undefined;
    className?: string | undefined;
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

    const ms = useMessagingStrings();
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="New conversation"
        >
            <div className="fixed inset-0 bg-black/40" onClick={handleClose} aria-hidden="true" />
            <div
                className={cn(
                    "relative z-50 w-full max-w-md rounded-xl border border-border bg-background shadow-xl",
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h2 className="text-base font-semibold">{ms("conversations_new")}</h2>
                    <Tooltip content="Close" side="bottom">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border" role="tablist">
                    {[
                        { value: "dm" as const, label: ms("new_dm"), icon: MessageSquare },
                        { value: "group" as const, label: ms("new_group"), icon: Users },
                        { value: "channel" as const, label: ms("new_channel"), icon: Hash },
                    ].map(({ value, label, icon: Icon }) => (
                        <Button
                            key={value}
                            variant="ghost"
                            size="sm"
                            role="tab"
                            aria-selected={tab === value}
                            className={cn(
                                "flex-1 gap-1.5 rounded-none",
                                tab === value
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-muted-foreground"
                            )}
                            onClick={() => {
                                setTab(value);
                                setSelectedUsers([]);
                            }}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Name field for group/channel */}
                    {(tab === "group" || tab === "channel") && (
                        <Input
                            type="text"
                            placeholder={
                                tab === "group" ? ms("new_group_name") : ms("new_channel_name")
                            }
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            aria-label={
                                tab === "group" ? ms("new_group_name") : ms("new_channel_name")
                            }
                        />
                    )}

                    {/* Description for channel */}
                    {tab === "channel" && (
                        <>
                            <Input
                                type="text"
                                placeholder={ms("new_channel_description")}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                aria-label="Channel description"
                            />
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="public-channel"
                                    checked={isPublic}
                                    onCheckedChange={(checked) => setIsPublic(checked === true)}
                                />
                                <Label htmlFor="public-channel" className="text-sm cursor-pointer">
                                    {ms("new_channel_public")}
                                </Label>
                            </div>
                        </>
                    )}

                    {/* Selected chips */}
                    {selectedMemberDetails.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {selectedMemberDetails.map((m) => (
                                <Badge key={m.id} variant="secondary" className="gap-1 pr-1">
                                    {m.name}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleUser(m.id)}
                                        className="ml-0.5 h-4 w-4 rounded-full"
                                        aria-label={`Remove ${m.name}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
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
                                placeholder={ms("new_search_people")}
                                className="h-9"
                            />
                            <div className="max-h-48 overflow-y-auto space-y-0.5">
                                {filteredMembers.map((member) => {
                                    const isSelected = selectedUsers.includes(member.id);
                                    return (
                                        <Button
                                            key={member.id}
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start gap-2 h-auto py-1.5",
                                                isSelected && "bg-primary/10 text-primary"
                                            )}
                                            onClick={() => toggleUser(member.id)}
                                        >
                                            <Avatar name={member.name} size="sm" />
                                            <span className="truncate">{member.name}</span>
                                            {isSelected && (
                                                <span className="ml-auto text-xs text-primary">
                                                    ✓
                                                </span>
                                            )}
                                        </Button>
                                    );
                                })}
                                {filteredMembers.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                        No members found
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={handleClose}>
                        {ms("new_cancel")}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleCreate}
                        disabled={!canCreate || createConversation.isPending}
                    >
                        {createConversation.isPending ? ms("new_creating") : ms("new_create")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
