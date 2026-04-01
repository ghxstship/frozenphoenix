"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings2 } from "lucide-react";
import type { CustomFieldDefinitionRow } from "@/lib/data-hooks/hook-types";

// ═══════════════════════════════════════════════════════════════
// DYNAMIC FIELD RENDERER — Renders a single custom field by type
// ═══════════════════════════════════════════════════════════════

interface DynamicFieldRendererProps {
    definition: CustomFieldDefinitionRow;
    value: unknown;
    onChange: (value: unknown) => void;
    disabled?: boolean | undefined;
}

export function DynamicFieldRenderer({
    definition,
    value,
    onChange,
    disabled = false,
}: DynamicFieldRendererProps) {
    const fieldType = definition.field_type;
    const options = (definition.options ?? []) as Array<{ value: string; label: string }>;

    switch (fieldType) {
        case "text":
        case "url":
        case "email":
        case "phone":
            return (
                <Input
                    type={
                        fieldType === "url"
                            ? "url"
                            : fieldType === "email"
                              ? "email"
                              : fieldType === "phone"
                                ? "tel"
                                : "text"
                    }
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => onChange(value)} // trigger save
                    placeholder={`Enter ${definition.name.toLowerCase()}…`}
                    disabled={disabled}
                />
            );

        case "number":
        case "currency":
            return (
                <Input
                    type="number"
                    value={value !== null && value !== undefined ? String(value) : ""}
                    onChange={(e) => onChange(e.target.valueAsNumber || null)}
                    onBlur={() => onChange(value)}
                    placeholder={fieldType === "currency" ? "0.00" : "0"}
                    step={fieldType === "currency" ? "0.01" : "1"}
                    disabled={disabled}
                />
            );

        case "date":
            return (
                <Input
                    type="date"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value || null)}
                    disabled={disabled}
                />
            );

        case "boolean":
            return (
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`custom-bool-${definition.id}`}
                        checked={Boolean(value)}
                        onCheckedChange={(checked) => onChange(checked === true)}
                        disabled={disabled}
                    />
                    <label
                        htmlFor={`custom-bool-${definition.id}`}
                        className="text-sm text-muted-foreground cursor-pointer"
                    >
                        {value ? "Yes" : "No"}
                    </label>
                </div>
            );

        case "select":
            return (
                <select
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value || null)}
                    disabled={disabled}
                    className={cn(
                        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1",
                        "text-sm ring-offset-background focus-visible:outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                >
                    <option value="">Select…</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );

        case "multi_select": {
            const selectedValues = Array.isArray(value) ? (value as string[]) : [];
            return (
                <div className="flex flex-wrap gap-1.5">
                    {options.map((opt) => {
                        const isSelected = selectedValues.includes(opt.value);
                        return (
                            <Button
                                key={opt.value}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                disabled={disabled}
                                onClick={() => {
                                    const next = isSelected
                                        ? selectedValues.filter((v) => v !== opt.value)
                                        : [...selectedValues, opt.value];
                                    onChange(next);
                                }}
                                className={cn(
                                    "h-auto py-0.5 px-2",
                                    isSelected && "bg-primary text-primary-foreground"
                                )}
                            >
                                {opt.label}
                            </Button>
                        );
                    })}
                    {options.length === 0 && (
                        <span className="text-xs text-muted-foreground">No options defined</span>
                    )}
                </div>
            );
        }

        case "person":
            return (
                <Input
                    type="text"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => onChange(value)}
                    placeholder="Enter person name or ID…"
                    disabled={disabled}
                />
            );

        default:
            return (
                <Input
                    type="text"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder={`Enter ${definition.name.toLowerCase()}…`}
                />
            );
    }
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM FIELDS PANEL — Fetches definitions & values, renders form
// ═══════════════════════════════════════════════════════════════

interface CustomFieldsPanelProps {
    entityType: string;
    entityId: string;
    className?: string | undefined;
}

export function CustomFieldsPanel({ entityType, entityId, className }: CustomFieldsPanelProps) {
    const [saving, setSaving] = useState<string | null>(null);

    // Fetch definitions + values via the dedicated API
    const [definitions, setDefinitions] = useState<CustomFieldDefinitionRow[]>([]);
    const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch on mount
    React.useEffect(() => {
        if (loaded) return;
        setLoading(true);
        fetch(`/api/custom-fields/values?entity_type=${entityType}&entity_id=${entityId}`)
            .then((res) => res.json())
            .then((json) => {
                const data = json?.data ?? {};
                setDefinitions((data.definitions ?? []) as CustomFieldDefinitionRow[]);
                setFieldValues((data.values ?? {}) as Record<string, unknown>);
                setLoaded(true);
            })
            .catch(() => {
                setLoaded(true);
            })
            .finally(() => setLoading(false));
    }, [entityType, entityId, loaded]);

    const handleChange = useCallback(
        async (fieldDef: CustomFieldDefinitionRow, newValue: unknown) => {
            // Optimistic update
            setFieldValues((prev) => ({ ...prev, [fieldDef.id]: newValue }));

            // Save to API
            setSaving(fieldDef.id);
            try {
                await fetch("/api/custom-fields/values", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        entity_type: entityType,
                        entity_id: entityId,
                        field_definition_id: fieldDef.id,
                        value: newValue,
                    }),
                });
            } catch {
                // Silently fail — optimistic UI stays
            } finally {
                setSaving(null);
            }
        },
        [entityType, entityId]
    );

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (definitions.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="py-8 text-center">
                    <Settings2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground mb-1">
                        No custom fields defined for this entity type.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Admins can create custom field definitions under Settings → Custom Fields.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" />
                    Custom Fields
                    <Badge variant="secondary" className="density-caption">
                        {definitions.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {definitions.map((def) => (
                        <div key={def.id} className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <label className="text-sm font-medium text-foreground">
                                    {def.name}
                                </label>
                                {def.is_required && (
                                    <span className="text-destructive text-xs">*</span>
                                )}
                                {saving === def.id && (
                                    <Loader2 className="h-3 w-3 motion-safe:animate-spin text-muted-foreground ml-auto" />
                                )}
                            </div>
                            <DynamicFieldRenderer
                                definition={def}
                                value={fieldValues[def.id] ?? def.default_value ?? null}
                                onChange={(v) => handleChange(def, v)}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
