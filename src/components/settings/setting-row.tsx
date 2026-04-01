"use client";

/* ═══════════════════════════════════════════════════════════════
   ATLVS — Setting Row Component
   Renders a single setting with type-aware input, lock badge,
   inheritance indicator, and edit/save controls
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from "react";
import { ArrowDown, Check, Lock, Unlock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import type { ResolvedSetting, SettingCategory } from "@/types/settings";

interface SettingRowProps {
    setting: ResolvedSetting;
    onSave: (category: SettingCategory, key: string, value: unknown) => Promise<void>;
}

export function SettingRow({ setting, onSave }: SettingRowProps) {
    const { definition, value, is_inherited, is_locked, source_scope, can_edit } = setting;
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState<unknown>(value);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(definition.category, definition.key, localValue);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setLocalValue(value);
        setEditing(false);
    };

    const renderInput = () => {
        switch (definition.value_type) {
            case "boolean":
                return (
                    <Toggle
                        checked={parseBool(localValue)}
                        onCheckedChange={(checked) => {
                            if (!can_edit) return;
                            setLocalValue(checked);
                            if (!editing) setEditing(true);
                        }}
                        disabled={!can_edit}
                        aria-label={`Toggle ${definition.label}`}
                        size="sm"
                    />
                );

            case "integer":
            case "float":
                return (
                    <Input
                        type="number"
                        value={String(localValue ?? "")}
                        onChange={(e) => {
                            setLocalValue(
                                definition.value_type === "integer"
                                    ? parseInt(e.target.value)
                                    : parseFloat(e.target.value)
                            );
                            if (!editing) setEditing(true);
                        }}
                        disabled={!can_edit}
                        className="w-32"
                        min={definition.min_value ?? undefined}
                        max={definition.max_value ?? undefined}
                    />
                );

            case "enum":
                if (definition.allowed_values && Array.isArray(definition.allowed_values)) {
                    return (
                        <select
                            value={String(localValue ?? "")}
                            onChange={(e) => {
                                setLocalValue(e.target.value);
                                if (!editing) setEditing(true);
                            }}
                            disabled={!can_edit}
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                        >
                            {(definition.allowed_values as string[]).map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    );
                }
                return (
                    <Input
                        value={String(localValue ?? "")}
                        onChange={(e) => {
                            setLocalValue(e.target.value);
                            if (!editing) setEditing(true);
                        }}
                        disabled={!can_edit}
                        className="w-48"
                    />
                );

            case "text":
                return (
                    <Input
                        value={String(localValue ?? "")}
                        onChange={(e) => {
                            setLocalValue(e.target.value);
                            if (!editing) setEditing(true);
                        }}
                        disabled={!can_edit}
                        className="w-64"
                        type={definition.is_sensitive ? "password" : "text"}
                    />
                );

            default:
                return (
                    <Input
                        value={
                            typeof localValue === "string" ? localValue : JSON.stringify(localValue)
                        }
                        onChange={(e) => {
                            setLocalValue(e.target.value);
                            if (!editing) setEditing(true);
                        }}
                        disabled={!can_edit}
                        className="w-64"
                    />
                );
        }
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{definition.label}</p>
                    {is_locked && (
                        <span
                            className="inline-flex items-center gap-1 text-xs text-warning"
                            title="Locked by admin"
                        >
                            <Lock className="h-3 w-3" />
                        </span>
                    )}
                    {is_inherited && (
                        <span
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                            title={`Inherited from ${source_scope}`}
                        >
                            <ArrowDown className="h-3 w-3" />
                            <span>{source_scope}</span>
                        </span>
                    )}
                </div>
                {definition.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {definition.description}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {renderInput()}
                {editing && (
                    <>
                        <Button size="sm" variant="ghost" onClick={handleSave} disabled={saving}>
                            <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

function parseBool(val: unknown): boolean {
    if (typeof val === "boolean") return val;
    if (val === "true") return true;
    if (val === "false") return false;
    return Boolean(val);
}

export function LockBadge({ locked }: { locked: boolean }) {
    return locked ? (
        <Badge variant="warning" className="gap-1">
            <Lock className="h-3 w-3" />
            Locked
        </Badge>
    ) : (
        <Badge variant="ghost" className="gap-1">
            <Unlock className="h-3 w-3" />
            Editable
        </Badge>
    );
}

interface FlagToggleProps {
    enabled: boolean;
    label: string;
    description?: string | undefined;
    onToggle: (enabled: boolean) => void;
    disabled?: boolean | undefined;
}

export function FlagToggle({ enabled, label, description, onToggle, disabled }: FlagToggleProps) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
            <div>
                <p className="text-sm font-medium">{label}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <Toggle
                checked={enabled}
                onCheckedChange={() => !disabled && onToggle(!enabled)}
                disabled={disabled}
                aria-label={`Toggle ${label}`}
                size="sm"
            />
        </div>
    );
}
