"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export interface MentionUser {
    id: string;
    name: string;
    avatar_url?: string | null | undefined;
}

interface MentionAutocompleteProps {
    query: string;
    users: MentionUser[];
    onSelect: (user: MentionUser) => void;
    onClose: () => void;
    className?: string | undefined;
}

export function MentionAutocomplete({
    query,
    users,
    onSelect,
    onClose,
    className,
}: MentionAutocompleteProps) {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const listRef = React.useRef<HTMLDivElement>(null);

    const filtered = React.useMemo(() => {
        if (!query) return users.slice(0, 8);
        const q = query.toLowerCase();
        return users.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 8);
    }, [query, users]);

    React.useEffect(() => {
        setSelectedIndex(0);
    }, [filtered.length]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                if (filtered[selectedIndex]) {
                    onSelect(filtered[selectedIndex]);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [filtered, selectedIndex, onSelect, onClose]);

    if (filtered.length === 0) return null;

    return (
        <div
            ref={listRef}
            className={cn(
                "absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg z-50",
                className
            )}
            role="listbox"
            aria-label="Mention suggestions"
        >
            {filtered.map((user, index) => (
                <button
                    key={user.id}
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-secondary transition-colors",
                        index === selectedIndex && "bg-secondary"
                    )}
                    onClick={() => onSelect(user)}
                    onMouseEnter={() => setSelectedIndex(index)}
                >
                    <Avatar name={user.name} size="sm" />
                    <span className="truncate font-medium">{user.name}</span>
                </button>
            ))}
        </div>
    );
}
