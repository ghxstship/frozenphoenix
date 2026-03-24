"use client";

import React, { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ENTITY_RELATIONSHIP_MAP } from "@/config/production-config";
import { SEARCHABLE_ENTITY_TYPES, useSearchEntities } from "@/lib/supabase";
import { CreateEntityDialog } from "@/components/app/create-entity-dialog";
import type { CreateEntityConfig } from "@/components/app/create-entity-dialog";
import type { EntityType } from "@/types/production";
import type { EntitySearchResult } from "@/lib/data-hooks/hooks-record-links";
import { Check, ChevronDown, Loader2, Plus, Search, X } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// ENTITY TYPE SELECTOR
// ═══════════════════════════════════════════════════════════════

function EntityTypeSelector({
    value,
    onChange,
    excludeTypes = [],
}: {
    value: EntityType | null;
    onChange: (type: EntityType) => void;
    excludeTypes?: EntityType[] | undefined;
}) {
    const [open, setOpen] = useState(false);

    const availableTypes = useMemo(
        () =>
            SEARCHABLE_ENTITY_TYPES.filter(
                (t) => !excludeTypes.includes(t) && ENTITY_RELATIONSHIP_MAP[t]
            ),
        [excludeTypes]
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm",
                    "border border-border rounded-md bg-background",
                    "hover:bg-secondary/50 transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
            >
                {value ? (
                    <span className="flex items-center gap-2">
                        {ENTITY_RELATIONSHIP_MAP[value] && (
                            <>
                                {React.createElement(ENTITY_RELATIONSHIP_MAP[value].icon, {
                                    className: "h-4 w-4 text-muted-foreground",
                                })}
                                {ENTITY_RELATIONSHIP_MAP[value].pluralLabel}
                            </>
                        )}
                    </span>
                ) : (
                    <span className="text-muted-foreground">Select entity type…</span>
                )}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-md border border-border bg-popover shadow-lg">
                    {availableTypes.map((type) => {
                        const config = ENTITY_RELATIONSHIP_MAP[type];
                        if (!config) return null;
                        const Icon = config.icon;
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => {
                                    onChange(type);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-2 w-full px-3 py-2 text-sm",
                                    "hover:bg-secondary/50 transition-colors text-left",
                                    value === type && "bg-secondary/30"
                                )}
                            >
                                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">{config.pluralLabel}</span>
                                {value === type && (
                                    <Check className="h-3.5 w-3.5 text-primary ml-auto shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MINIMAL CREATE CONFIG GENERATOR
// ═══════════════════════════════════════════════════════════════

function buildMinimalCreateConfig(entityType: EntityType): CreateEntityConfig | null {
    const config = ENTITY_RELATIONSHIP_MAP[entityType];
    if (!config) return null;
    const label = config.pluralLabel?.replace(/s$/, "") ?? entityType;
    return {
        entityName: label,
        fields: [
            {
                key: "name",
                label: "Name",
                type: "text" as const,
                required: true,
                placeholder: `Enter ${label.toLowerCase()} name…`,
            },
        ],
    };
}

// ═══════════════════════════════════════════════════════════════
// LINKED RECORD PICKER
// ═══════════════════════════════════════════════════════════════

interface LinkedRecordPickerProps {
    /** The entity type of the current record (excluded from type picker). */
    currentEntityType?: EntityType | undefined;
    /** The ID of the current record (excluded from search results). */
    currentEntityId?: string | undefined;
    /** IDs of already-linked records to exclude from results. */
    excludeIds?: string[] | undefined;
    /** Callback when user selects a record to link. */
    onSelect: (result: EntitySearchResult) => void;
    /** Callback to close the picker. */
    onClose: () => void;
    className?: string | undefined;
}

export function LinkedRecordPicker({
    currentEntityType,
    currentEntityId,
    excludeIds = [],
    onSelect,
    onClose,
    className,
}: LinkedRecordPickerProps) {
    const [selectedType, setSelectedType] = useState<EntityType | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const { data: results, isLoading } = useSearchEntities(selectedType ?? "", searchQuery);

    // Filter out the current record and already-linked records
    const filteredResults = useMemo(() => {
        if (!results) return [];
        const excludeSet = new Set([...(excludeIds ?? []), currentEntityId ?? ""]);
        return results.filter((r) => !excludeSet.has(r.id));
    }, [results, excludeIds, currentEntityId]);

    const handleSelect = useCallback(
        (result: EntitySearchResult) => {
            onSelect(result);
            setSearchQuery("");
        },
        [onSelect]
    );

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        Link a Record
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onClose}
                        aria-label="Close picker"
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Entity type selector */}
                <EntityTypeSelector
                    value={selectedType}
                    onChange={setSelectedType}
                    excludeTypes={currentEntityType ? [currentEntityType] : []}
                />

                {/* Search input - shown once entity type is selected */}
                {selectedType && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Search ${ENTITY_RELATIONSHIP_MAP[selectedType]?.pluralLabel ?? "records"}…`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                            autoFocus
                        />
                    </div>
                )}

                {/* Results */}
                {selectedType && searchQuery.length >= 2 && (
                    <div className="max-h-48 overflow-auto rounded-md border border-border">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 motion-safe:animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredResults.length === 0 ? (
                            <p className="text-center py-6 text-sm text-muted-foreground">
                                No matching records found.
                            </p>
                        ) : (
                            <div className="divide-y divide-border">
                                {filteredResults.map((result) => {
                                    const config = ENTITY_RELATIONSHIP_MAP[result.entityType];
                                    const Icon = config?.icon;
                                    return (
                                        <button
                                            key={result.id}
                                            type="button"
                                            onClick={() => handleSelect(result)}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm
                                                hover:bg-secondary/50 transition-colors text-left
                                                focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                                        >
                                            {Icon && (
                                                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            )}
                                            <span className="flex-1 truncate font-medium">
                                                {result.name}
                                            </span>
                                            {result.status && (
                                                <Badge
                                                    variant="secondary"
                                                    className="density-caption shrink-0"
                                                >
                                                    {result.status}
                                                </Badge>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Hint */}
                {selectedType && searchQuery.length < 2 && (
                    <p className="text-center text-xs text-muted-foreground py-2">
                        Type at least 2 characters to search.
                    </p>
                )}

                {/* Create New button */}
                {selectedType && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Create New{" "}
                        {ENTITY_RELATIONSHIP_MAP[selectedType]?.pluralLabel?.replace(/s$/, "") ??
                            "Record"}
                    </Button>
                )}
            </CardContent>

            {/* Create dialog */}
            {selectedType && buildMinimalCreateConfig(selectedType) && (
                <CreateEntityDialog
                    config={buildMinimalCreateConfig(selectedType)!}
                    open={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    onSubmit={async (values) => {
                        // Auto-select the newly created record
                        handleSelect({
                            id: (values.id as string) ?? `temp-${Date.now()}`,
                            name: String(values.name ?? "Untitled"),
                            entityType: selectedType,
                        });
                    }}
                />
            )}
        </Card>
    );
}
