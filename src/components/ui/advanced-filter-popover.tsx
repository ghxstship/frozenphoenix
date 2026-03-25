"use client";

/* ═══════════════════════════════════════════════════════════════
   ADVANCED FILTER POPOVER — Airtable-style multi-condition filter

   Renders an icon button that opens a popover with a list of
   filter conditions. Each condition has: column, operator, value.
   Conditions can be joined with AND / OR conjunctions.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { Filter, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ─── Types ──────────────────────────────────────────────────

export interface FilterFieldDef {
    /** Unique field ID (maps to record key) */
    id: string;
    /** Display label */
    label: string;
    /** Available values for "is" / "is not" operators */
    options?: { value: string; label: string }[] | undefined;
}

export type FilterOperator =
    | "is"
    | "is_not"
    | "contains"
    | "does_not_contain"
    | "is_empty"
    | "is_not_empty";

const OPERATOR_LABELS: Record<FilterOperator, string> = {
    is: "is",
    is_not: "is not",
    contains: "contains",
    does_not_contain: "does not contain",
    is_empty: "is empty",
    is_not_empty: "is not empty",
};

/** Operators that don't require a value input */
const VALUELESS_OPERATORS: Set<FilterOperator> = new Set(["is_empty", "is_not_empty"]);

export type FilterConjunction = "and" | "or";

export interface FilterCondition {
    id: string;
    fieldId: string;
    operator: FilterOperator;
    value: string;
}

export interface FilterGroup {
    conjunction: FilterConjunction;
    conditions: FilterCondition[];
}

export interface AdvancedFilterPopoverProps {
    /** Available fields to filter on */
    fields: FilterFieldDef[];
    /** Current filter groups */
    filterGroups: FilterGroup[];
    /** Called when filter groups change */
    onFilterGroupsChange: (groups: FilterGroup[]) => void;
    /** Total active condition count (for badge) */
    activeCount?: number | undefined;
}

// ─── Helpers ────────────────────────────────────────────────

let conditionCounter = 0;
function nextConditionId(): string {
    return `fc-${++conditionCounter}-${Date.now()}`;
}

function createCondition(fieldId: string): FilterCondition {
    return { id: nextConditionId(), fieldId, operator: "is", value: "" };
}

// ─── Condition Row ──────────────────────────────────────────

function ConditionRow({
    condition,
    fields,
    conjunction,
    showConjunction,
    onConjunctionChange,
    onChange,
    onRemove,
}: {
    condition: FilterCondition;
    fields: FilterFieldDef[];
    conjunction: FilterConjunction;
    showConjunction: boolean;
    onConjunctionChange: (c: FilterConjunction) => void;
    onChange: (updated: FilterCondition) => void;
    onRemove: () => void;
}) {
    const field = fields.find((f) => f.id === condition.fieldId);
    const hasOptions = field?.options && field.options.length > 0;
    const needsValue = !VALUELESS_OPERATORS.has(condition.operator);

    return (
        <div className="flex items-center gap-1.5 text-sm">
            {/* Conjunction label / toggle */}
            <div className="w-[52px] shrink-0 text-right">
                {showConjunction ? (
                    <button
                        type="button"
                        onClick={() => onConjunctionChange(conjunction === "and" ? "or" : "and")}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
                    >
                        {conjunction}
                    </button>
                ) : (
                    <span className="text-xs text-muted-foreground">Where</span>
                )}
            </div>

            {/* Field selector */}
            <select
                value={condition.fieldId}
                onChange={(e) => onChange({ ...condition, fieldId: e.target.value, value: "" })}
                className="h-7 rounded border border-input bg-background px-2 text-xs min-w-[100px] max-w-[130px] focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Filter field"
            >
                {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                        {f.label}
                    </option>
                ))}
            </select>

            {/* Operator selector */}
            <select
                value={condition.operator}
                onChange={(e) =>
                    onChange({ ...condition, operator: e.target.value as FilterOperator })
                }
                className="h-7 rounded border border-input bg-background px-2 text-xs min-w-[90px] max-w-[130px] focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Filter operator"
            >
                {(Object.keys(OPERATOR_LABELS) as FilterOperator[]).map((op) => (
                    <option key={op} value={op}>
                        {OPERATOR_LABELS[op]}
                    </option>
                ))}
            </select>

            {/* Value input */}
            {needsValue && (
                <>
                    {hasOptions ? (
                        <select
                            value={condition.value}
                            onChange={(e) => onChange({ ...condition, value: e.target.value })}
                            className="h-7 rounded border border-input bg-background px-2 text-xs min-w-[100px] max-w-[130px] focus:outline-none focus:ring-1 focus:ring-ring"
                            aria-label="Filter value"
                        >
                            <option value="">Select...</option>
                            {field!.options!.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={condition.value}
                            onChange={(e) => onChange({ ...condition, value: e.target.value })}
                            placeholder="Value..."
                            className="h-7 rounded border border-input bg-background px-2 text-xs w-[100px] focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                            aria-label="Filter value"
                        />
                    )}
                </>
            )}

            {/* Remove button */}
            <Tooltip content="Remove condition" side="right">
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-auto shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors p-0.5"
                    aria-label="Remove filter condition"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </Tooltip>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────

export function AdvancedFilterPopover({
    fields,
    filterGroups,
    onFilterGroupsChange,
    activeCount = 0,
}: AdvancedFilterPopoverProps) {
    // Ensure at least one group exists when opening
    const groups = React.useMemo(
        () =>
            filterGroups.length > 0
                ? filterGroups
                : [{ conjunction: "and" as FilterConjunction, conditions: [] }],
        [filterGroups]
    );

    const totalConditions = groups.reduce((sum, g) => sum + g.conditions.length, 0);
    const displayCount = activeCount > 0 ? activeCount : totalConditions;

    const updateGroup = React.useCallback(
        (groupIdx: number, updater: (g: FilterGroup) => FilterGroup) => {
            const next = groups.map((g, i) => (i === groupIdx ? updater(g) : g));
            onFilterGroupsChange(next);
        },
        [groups, onFilterGroupsChange]
    );

    const addCondition = React.useCallback(
        (groupIdx: number) => {
            const defaultFieldId = fields[0]?.id ?? "";
            updateGroup(groupIdx, (g) => ({
                ...g,
                conditions: [...g.conditions, createCondition(defaultFieldId)],
            }));
        },
        [fields, updateGroup]
    );

    const removeCondition = React.useCallback(
        (groupIdx: number, condIdx: number) => {
            updateGroup(groupIdx, (g) => ({
                ...g,
                conditions: g.conditions.filter((_, i) => i !== condIdx),
            }));
        },
        [updateGroup]
    );

    const updateCondition = React.useCallback(
        (groupIdx: number, condIdx: number, updated: FilterCondition) => {
            updateGroup(groupIdx, (g) => ({
                ...g,
                conditions: g.conditions.map((c, i) => (i === condIdx ? updated : c)),
            }));
        },
        [updateGroup]
    );

    const clearAll = React.useCallback(() => {
        onFilterGroupsChange([{ conjunction: "and", conditions: [] }]);
    }, [onFilterGroupsChange]);

    if (fields.length === 0) return null;

    return (
        <Popover>
            <Tooltip content="Filter" side="bottom">
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-8 w-8 p-0 relative", displayCount > 0 && "text-primary")}
                        aria-label="Open filters"
                    >
                        <Filter className="h-4 w-4" />
                        {displayCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1">
                                {displayCount}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
            </Tooltip>
            <PopoverContent align="start" className="w-auto min-w-[420px] max-w-[600px] p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-border">
                    <span className="text-sm font-medium">Filters</span>
                    {totalConditions > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground"
                            onClick={clearAll}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear all
                        </Button>
                    )}
                </div>

                {/* Condition List */}
                <div className="p-3 space-y-4 max-h-[320px] overflow-y-auto">
                    {groups.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-1.5">
                            {group.conditions.map((cond, condIdx) => (
                                <ConditionRow
                                    key={cond.id}
                                    condition={cond}
                                    fields={fields}
                                    conjunction={group.conjunction}
                                    showConjunction={condIdx > 0}
                                    onConjunctionChange={(c) =>
                                        updateGroup(groupIdx, (g) => ({
                                            ...g,
                                            conjunction: c,
                                        }))
                                    }
                                    onChange={(updated) =>
                                        updateCondition(groupIdx, condIdx, updated)
                                    }
                                    onRemove={() => removeCondition(groupIdx, condIdx)}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 p-3 border-t border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => addCondition(0)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add filter
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

AdvancedFilterPopover.displayName = "AdvancedFilterPopover";
