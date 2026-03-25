"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SearchInput } from "./search-input";

export interface ListToolbarProps {
    search?: {
        value: string;
        onValueChange: (value: string) => void;
        placeholder?: string | undefined;
    };
    actions?: React.ReactNode | undefined;
    className?: string | undefined;
}

/**
 * ListToolbar — Strict single-row toolbar for list pages.
 *
 * Left: Search input (compact).
 * Right: Action buttons (filter, columns, views, refresh, overflow, create).
 */
export function ListToolbar({ search, actions, className }: ListToolbarProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Left zone: search */}
            {search && (
                <SearchInput
                    value={search.value}
                    onValueChange={search.onValueChange}
                    placeholder={search.placeholder}
                    size="sm"
                    className="w-full max-w-[220px]"
                />
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right zone: actions */}
            {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
        </div>
    );
}

// Backwards-compatible alias
export { ListToolbar as FilterBar };
export type { ListToolbarProps as FilterBarProps };
