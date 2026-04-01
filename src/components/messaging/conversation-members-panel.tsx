"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Tooltip } from "@/components/ui/tooltip";
import { Crown, ShieldCheck, UserMinus, UserPlus, X } from "lucide-react";
import {
    useAddConversationMembers,
    useConversationMembers,
    useOrgMembers,
    useRemoveConversationMember,
    useUpdateSMSFallback,
} from "@/lib/supabase/hooks-messaging";
import { useMessagingEnabled } from "@/hooks/use-messaging-enabled";
import { SMSFallbackToggle } from "./sms-fallback-toggle";
import { useAuth } from "@/lib/supabase/auth-context";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";
import type { ConversationMemberRole } from "@/types/messaging";

interface ConversationMembersPanelProps {
    conversationId: string;
    conversationType: "dm" | "group" | "channel";
    onClose: () => void;
    className?: string | undefined;
}

export function ConversationMembersPanel({
    conversationId,
    conversationType,
    onClose,
    className,
}: ConversationMembersPanelProps) {
    const ms = useMessagingStrings();
    const { user } = useAuth();
    const currentUserId = user?.id ?? "";

    const { data: members = [], isLoading } = useConversationMembers(conversationId);
    const { data: orgMembers = [] } = useOrgMembers();
    const addMembers = useAddConversationMembers(conversationId);
    const removeMember = useRemoveConversationMember(conversationId);
    const updateSMSFallback = useUpdateSMSFallback(conversationId);
    const { messagingEnabled: _msgEnabled, ...featureFlags } = useMessagingEnabled();
    const smsFallbackVisible = featureFlags.voiceEnabled; // SMS fallback shown alongside voice features

    const [showAddForm, setShowAddForm] = React.useState(false);
    const [addQuery, setAddQuery] = React.useState("");
    const [smsFallbackEnabled, setSMSFallbackEnabled] = React.useState(false);

    const myRole = members.find((m) => m.user_id === currentUserId)?.role;
    const canManage = myRole === "owner" || myRole === "admin";

    const memberUserIds = React.useMemo(() => new Set(members.map((m) => m.user_id)), [members]);
    const addableMembers = React.useMemo(() => {
        const available = orgMembers.filter((m) => !memberUserIds.has(m.id));
        if (!addQuery.trim()) return available;
        const q = addQuery.toLowerCase();
        return available.filter((m) => m.name.toLowerCase().includes(q));
    }, [orgMembers, memberUserIds, addQuery]);

    const handleAdd = React.useCallback(
        (userId: string) => {
            addMembers.mutate([userId]);
        },
        [addMembers]
    );

    const handleRemove = React.useCallback(
        (userId: string) => {
            removeMember.mutate(userId);
        },
        [removeMember]
    );

    const roleIcon = (role: ConversationMemberRole) => {
        if (role === "owner") return <Crown className="h-3 w-3 text-amber-500" />;
        if (role === "admin") return <ShieldCheck className="h-3 w-3 text-blue-500" />;
        return null;
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <h3 className="text-sm font-semibold">
                    {ms("chat_members_count", { count: members.length })}
                </h3>
                <Tooltip content={ms("new_cancel")} side="bottom">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-7 w-7"
                        aria-label={ms("new_cancel")}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Tooltip>
            </div>

            {/* Member list */}
            <div
                className="flex-1 overflow-y-auto"
                role="list"
                aria-label={ms("chat_members_count", { count: members.length })}
            >
                {isLoading ? (
                    <div className="space-y-1 p-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 rounded-lg bg-secondary/30 motion-safe:animate-pulse"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-1">
                        {members.map((member) => (
                            <div
                                key={member.user_id}
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-secondary/30 transition-colors"
                                role="listitem"
                            >
                                <Avatar
                                    name={member.name}
                                    src={member.avatar_url ?? undefined}
                                    size="sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-medium truncate">
                                            {member.name}
                                            {member.user_id === currentUserId && (
                                                <span className="text-muted-foreground ml-1 font-normal">
                                                    (you)
                                                </span>
                                            )}
                                        </span>
                                        {roleIcon(member.role)}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="density-caption px-1 py-0 h-4 capitalize"
                                    >
                                        {member.role}
                                    </Badge>
                                </div>
                                {canManage &&
                                    member.user_id !== currentUserId &&
                                    conversationType !== "dm" && (
                                        <Tooltip content={ms("members_remove")} side="left">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemove(member.user_id)}
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                aria-label={`${ms("members_remove")} ${member.name}`}
                                            >
                                                <UserMinus className="h-3.5 w-3.5" />
                                            </Button>
                                        </Tooltip>
                                    )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SMS Fallback Toggle */}
            {smsFallbackVisible && canManage && (
                <div className="border-t border-border shrink-0 px-4 py-3">
                    <SMSFallbackToggle
                        enabled={smsFallbackEnabled}
                        onToggle={(enabled) => {
                            setSMSFallbackEnabled(enabled);
                            updateSMSFallback.mutate(enabled);
                        }}
                        isPending={updateSMSFallback.isPending}
                    />
                </div>
            )}

            {/* Add members section */}
            {canManage && conversationType !== "dm" && (
                <div className="border-t border-border shrink-0">
                    {!showAddForm ? (
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 px-4 py-3 h-auto text-primary"
                            onClick={() => setShowAddForm(true)}
                        >
                            <UserPlus className="h-4 w-4" />
                            {ms("members_add")}
                        </Button>
                    ) : (
                        <div className="p-3 space-y-2">
                            <SearchInput
                                value={addQuery}
                                onValueChange={setAddQuery}
                                placeholder={ms("new_search_people")}
                                className="h-8"
                            />
                            <div className="max-h-36 overflow-y-auto space-y-0.5">
                                {addableMembers.map((member) => (
                                    <Button
                                        key={member.id}
                                        variant="ghost"
                                        className="w-full justify-start gap-2 h-auto py-1.5"
                                        onClick={() => handleAdd(member.id)}
                                    >
                                        <Avatar name={member.name} size="sm" />
                                        <span className="truncate">{member.name}</span>
                                        <UserPlus className="h-3.5 w-3.5 text-primary ml-auto shrink-0" />
                                    </Button>
                                ))}
                                {addableMembers.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-3">
                                        {ms("new_no_members")}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setAddQuery("");
                                }}
                            >
                                {ms("new_cancel")}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
