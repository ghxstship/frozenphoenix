"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SearchInput } from "./search-input";
import { X } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

export interface FilterBarProps {
    search?: {
        value: string;
        onValueChange: (value: string) => void;
        placeholder?: string;
    };
    filters?: {
        id: string;
        label: string;
        value: string;
        options: FilterOption[];
        onValueChange: (value: string) => void;
    }[];
    actions?: React.ReactNode;
    activeCount?: number;
    onClearAll?: () => void;
    className?: string;
}

export function FilterBar({
    search,
    filters,
    actions,
    activeCount = 0,
    onClearAll,
    className,
}: FilterBarProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                className
            )}
        >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                {search && (
                    <SearchInput
                        value={search.value}
                        onValueChange={search.onValueChange}
                        placeholder={search.placeholder}
                        className="w-full sm:max-w-xs"
                    />
                )}
                {filters && filters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {filters.map((filter) => (
                            <select
                                key={filter.id}
                                value={filter.value}
                                onChange={(e) => filter.onValueChange(e.target.value)}
                                className={cn(
                                    "h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm",
                                    "focus:outline-none focus:ring-2 focus:ring-ring",
                                    "transition-colors",
                                    filter.value !== "all" && "border-primary text-primary"
                                )}
                                aria-label={filter.label}
                            >
                                <option value="all">{filter.label}</option>
                                {filter.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                        {opt.count !== undefined ? ` (${opt.count})` : ""}
                                    </option>
                                ))}
                            </select>
                        ))}
                        {activeCount > 0 && onClearAll && (
                            <Tooltip content="Clear all filters" side="bottom">
                                <button
                                    type="button"
                                    onClick={onClearAll}
                                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Clear all filters"
                                >
                                    <X className="h-3 w-3" />
                                    Clear ({activeCount})
                                </button>
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
}
