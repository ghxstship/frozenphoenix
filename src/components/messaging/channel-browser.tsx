"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Hash, Lock, Users } from "lucide-react";
import { useConversations } from "@/lib/supabase/hooks-messaging";
import { CHANNEL_CATEGORIES, CHANNEL_CATEGORY_LABELS } from "@/types/messaging";
import type { ChannelCategory, ConversationListItem } from "@/types/messaging";

interface ChannelBrowserProps {
    onJoinChannel?: (channelId: string) => void;
    onSelectChannel?: (channelId: string) => void;
    className?: string;
}

export function ChannelBrowser({
    onJoinChannel,
    onSelectChannel,
    className,
}: ChannelBrowserProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

    const { data: conversations = [] } = useConversations();

    const channels = React.useMemo(() => {
        return conversations.filter(
            (c: ConversationListItem) => c.type === "channel" && !c.is_archived
        );
    }, [conversations]);

    const filtered = React.useMemo(() => {
        let result = channels;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (c: ConversationListItem) =>
                    c.name?.toLowerCase().includes(q) ||
                    c.description?.toLowerCase().includes(q)
            );
        }
        if (categoryFilter) {
            result = result.filter(
                (c: ConversationListItem) => c.category === categoryFilter
            );
        }
        return result;
    }, [channels, searchQuery, categoryFilter]);

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header */}
            <div className="border-b border-border px-4 py-3 space-y-3">
                <h2 className="text-base font-semibold">Browse Channels</h2>
                <SearchInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Search channels..."
                    className="h-9"
                />
                {/* Category filters */}
                <div className="flex flex-wrap gap-1.5">
                    <Button
                        variant={categoryFilter === null ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setCategoryFilter(null)}
                    >
                        All
                    </Button>
                    {CHANNEL_CATEGORIES.map((cat) => (
                        <Button
                            key={cat}
                            variant={categoryFilter === cat ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setCategoryFilter(cat)}
                        >
                            {CHANNEL_CATEGORY_LABELS[cat]}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Hash className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">
                            {searchQuery || categoryFilter
                                ? "No channels match your filters"
                                : "No channels available"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filtered.map((channel: ConversationListItem) => (
                            <button
                                key={channel.id}
                                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                                onClick={() => onSelectChannel?.(channel.id)}
                            >
                                <div className="mt-0.5">
                                    {channel.is_public ? (
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">
                                            {channel.name || "Unnamed channel"}
                                        </span>
                                        {channel.category && (
                                            <Badge variant="outline" className="text-[10px] h-4">
                                                {CHANNEL_CATEGORY_LABELS[channel.category as ChannelCategory] || channel.category}
                                            </Badge>
                                        )}
                                    </div>
                                    {channel.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {channel.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                        <Users className="h-3 w-3" />
                                        <span>{channel.members.length} members</span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onJoinChannel?.(channel.id);
                                    }}
                                >
                                    Join
                                </Button>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
