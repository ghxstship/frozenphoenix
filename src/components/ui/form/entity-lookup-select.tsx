"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { apiList, type ApiListResponse } from "@/lib/api/client";

// ─── Types ──────────────────────────────────────────────────

export interface EntityLookupConfig {
    /** API route base path, e.g. "/api/projects" */
    apiPath: string;
    /** Field on the returned record to use as display label (default: "name") */
    labelField?: string;
    /** Secondary field for disambiguation (e.g. "email", "status") */
    secondaryField?: string;
}

interface EntityLookupSelectProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    lookupConfig: EntityLookupConfig;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

// ─── Component ──────────────────────────────────────────────

export function EntityLookupSelect({
    id,
    value,
    onChange,
    lookupConfig,
    placeholder = "Select...",
    disabled = false,
    className,
}: EntityLookupSelectProps) {
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [fetchKey, setFetchKey] = useState(lookupConfig.apiPath);

    const labelField = lookupConfig.labelField ?? "name";
    const secondaryField = lookupConfig.secondaryField;

    // Reset loading when apiPath changes
    if (fetchKey !== lookupConfig.apiPath) {
        setFetchKey(lookupConfig.apiPath);
        setLoading(true);
        setError(null);
    }

    // Fetch entity list on mount / when API path changes
    useEffect(() => {
        let cancelled = false;

        apiList<Record<string, unknown>>(lookupConfig.apiPath, { per_page: 500 })
            .then((res: ApiListResponse<Record<string, unknown>>) => {
                if (cancelled) return;
                const mapped = res.data.map((item) => {
                    const primary = String(item[labelField] ?? item.name ?? item.id ?? "");
                    const secondary = secondaryField ? String(item[secondaryField] ?? "") : "";
                    return {
                        value: String(item.id),
                        label: secondary ? `${primary} (${secondary})` : primary,
                    };
                });
                setOptions(mapped);
            })
            .catch((err: Error) => {
                if (cancelled) return;
                setError(err.message || "Failed to load options");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [lookupConfig.apiPath, labelField, secondaryField]);

    // Filter options by search term
    const filtered = useMemo(() => {
        if (!search.trim()) return options;
        const q = search.toLowerCase();
        return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, search]);

    // Resolve display label for currently selected value
    const selectedLabel = useMemo(() => {
        if (!value) return "";
        return options.find((o) => o.value === value)?.label ?? value;
    }, [value, options]);

    if (loading) {
        return (
            <div
                className={cn(
                    "flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground",
                    className
                )}
            >
                <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                <span>Loading…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className={cn(
                    "flex h-9 items-center rounded-lg border border-destructive/50 bg-destructive/5 px-3 text-sm text-destructive",
                    className
                )}
            >
                {error}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Trigger button */}
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    !value && "text-muted-foreground",
                    className
                )}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="truncate">{value ? selectedLabel : placeholder}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            setIsOpen(false);
                            setSearch("");
                        }}
                        aria-hidden="true"
                    />
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-md">
                        {/* Search input */}
                        <div className="flex items-center border-b border-border px-3 py-2">
                            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                placeholder="Search…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {/* Options list */}
                        <ul
                            className="max-h-48 overflow-y-auto p-1"
                            role="listbox"
                            aria-label="Entity options"
                        >
                            {/* Clear option */}
                            {value && (
                                <li
                                    role="option"
                                    aria-selected={false}
                                    className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
                                    onClick={() => {
                                        onChange("");
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    Clear selection
                                </li>
                            )}
                            {filtered.length === 0 ? (
                                <li className="px-3 py-2 text-sm text-muted-foreground">
                                    No results found
                                </li>
                            ) : (
                                filtered.map((opt) => (
                                    <li
                                        key={opt.value}
                                        role="option"
                                        aria-selected={opt.value === value}
                                        className={cn(
                                            "cursor-pointer rounded-md px-3 py-1.5 text-sm hover:bg-accent",
                                            opt.value === value && "bg-accent font-medium"
                                        )}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                    >
                                        {opt.label}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
