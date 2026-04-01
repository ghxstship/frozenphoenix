"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/formatters/locale";
import { Hash, MessageSquare, Search, Users } from "lucide-react";

interface SearchResult {
    id: string;
    conversation_id: string;
    conversation_name: string | null;
    conversation_type: string | null;
    sender_id: string;
    sender_name: string;
    sender_avatar: string | null;
    body: string;
    message_type: string;
    created_at: string;
}

interface MessageSearchProps {
    onSelectResult?: ((result: SearchResult) => void) | undefined;
    className?: string | undefined;
}

export function MessageSearch({ onSelectResult, className }: MessageSearchProps) {
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [total, setTotal] = React.useState(0);
    const [isSearching, setIsSearching] = React.useState(false);
    const abortRef = React.useRef<AbortController | null>(null);

    const handleSearch = React.useCallback(async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults([]);
            setTotal(0);
            return;
        }

        // Cancel previous request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setIsSearching(true);
        try {
            const res = await fetch(
                `/api/messages/search?q=${encodeURIComponent(searchQuery)}&limit=20`,
                { signal: controller.signal }
            );
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            setResults(data.results ?? []);
            setTotal(data.total ?? 0);
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                setResults([]);
                setTotal(0);
            }
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounce search
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleQueryChange = React.useCallback(
        (value: string) => {
            setQuery(value);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => handleSearch(value), 300);
        },
        [handleSearch]
    );

    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            abortRef.current?.abort();
        };
    }, []);

    const getConversationIcon = (type: string | null) => {
        switch (type) {
            case "channel":
                return <Hash className="h-3 w-3" />;
            case "group":
                return <Users className="h-3 w-3" />;
            default:
                return <MessageSquare className="h-3 w-3" />;
        }
    };

    const highlightMatch = (text: string, q: string) => {
        if (!q) return text;
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return text;
        const before = text.slice(0, idx);
        const match = text.slice(idx, idx + q.length);
        const after = text.slice(idx + q.length);
        return (
            <>
                {before}
                <mark className="bg-primary/20 text-foreground rounded-sm px-0.5">{match}</mark>
                {after}
            </>
        );
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            <div className="border-b border-border px-4 py-3 space-y-2">
                <h2 className="text-base font-semibold">Search Messages</h2>
                <SearchInput
                    value={query}
                    onValueChange={handleQueryChange}
                    placeholder="Search messages..."
                    className="h-9"
                />
                {query.length >= 2 && (
                    <p className="text-xs text-muted-foreground">
                        {isSearching
                            ? "Searching..."
                            : `${total} result${total !== 1 ? "s" : ""} found`}
                    </p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {results.length === 0 && query.length >= 2 && !isSearching ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No messages found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {results.map((result) => (
                            <Button
                                key={result.id}
                                variant="ghost"
                                className="w-full flex items-start gap-3 px-4 py-3 h-auto text-left justify-start rounded-none"
                                onClick={() => onSelectResult?.(result)}
                            >
                                <Avatar
                                    name={result.sender_name}
                                    size="sm"
                                    className="mt-0.5 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                                        <span className="font-medium text-foreground">
                                            {result.sender_name}
                                        </span>
                                        <span>in</span>
                                        <span className="flex items-center gap-1">
                                            {getConversationIcon(result.conversation_type)}
                                            {result.conversation_name ?? "DM"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground line-clamp-2">
                                        {highlightMatch(result.body, query)}
                                    </p>
                                    <p className="density-caption text-muted-foreground mt-0.5">
                                        {formatRelativeTime(result.created_at)}
                                    </p>
                                </div>
                            </Button>
                        ))}
                    </div>
                )}

                {results.length === 0 && query.length < 2 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Type at least 2 characters to search
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
