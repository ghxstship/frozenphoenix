"use client";

/* ═══════════════════════════════════════════════════════════════
   FORM BUILDER — Drag-and-Drop Visual Form Designer

   Typeform/JotForm-inspired form builder for advance intake
   forms and custom entity forms. Uses existing custom fields
   system for persistence.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
    AlignLeft,
    ArrowDown,
    ArrowUp,
    CalendarDays,
    CheckSquare,
    Edit3,
    Eye,
    FileUp,
    GripVertical,
    Hash,
    ListChecks,
    Plus,
    Settings2,
    ToggleLeft,
    Trash2,
    Type,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

export type FormFieldType =
    | "text"
    | "number"
    | "select"
    | "date"
    | "file"
    | "checkbox"
    | "richtext"
    | "toggle";

export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string | undefined;
    required: boolean;
    options?: string[] | undefined; // For select type
    helpText?: string | undefined;
}

// ─── Field Config ────────────────────────────────────────────

const FIELD_TYPE_META: Record<FormFieldType, { icon: React.ElementType; label: string }> = {
    text: { icon: Type, label: "Short Text" },
    number: { icon: Hash, label: "Number" },
    select: { icon: ListChecks, label: "Dropdown" },
    date: { icon: CalendarDays, label: "Date" },
    file: { icon: FileUp, label: "File Upload" },
    checkbox: { icon: CheckSquare, label: "Checkbox" },
    richtext: { icon: AlignLeft, label: "Long Text" },
    toggle: { icon: ToggleLeft, label: "Toggle" },
};

// ─── Component ───────────────────────────────────────────────

export default function FormBuilderPage() {
    const [fields, setFields] = useState<FormField[]>([
        {
            id: "f1",
            type: "text",
            label: "Full Name",
            required: true,
            placeholder: "Enter full name",
        },
        {
            id: "f2",
            type: "text",
            label: "Email Address",
            required: true,
            placeholder: "email@example.com",
        },
        {
            id: "f3",
            type: "select",
            label: "Department",
            required: false,
            options: ["Production", "Logistics", "Creative", "Finance"],
        },
    ]);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(false);

    const addField = useCallback((type: FormFieldType) => {
        const id = `f-${Date.now()}`;
        const meta = FIELD_TYPE_META[type];
        setFields((prev) => [
            ...prev,
            {
                id,
                type,
                label: `New ${meta.label}`,
                required: false,
                placeholder: "",
                options: type === "select" ? ["Option 1", "Option 2"] : undefined,
            },
        ]);
        setSelectedField(id);
    }, []);

    const moveField = useCallback((index: number, direction: -1 | 1) => {
        setFields((prev) => {
            const next = [...prev];
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= next.length) return prev;
            [next[index]!, next[newIndex]!] = [next[newIndex]!, next[index]!];
            return next;
        });
    }, []);

    const updateField = useCallback((id: string, updates: Partial<FormField>) => {
        setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    }, []);

    const deleteField = useCallback(
        (id: string) => {
            setFields((prev) => prev.filter((f) => f.id !== id));
            if (selectedField === id) setSelectedField(null);
        },
        [selectedField]
    );

    const selected = fields.find((f) => f.id === selectedField);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Form Builder"
                    description="Design custom intake forms with drag-and-drop fields."
                />
                <div className="flex gap-2">
                    <Button
                        variant={previewMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="gap-1.5"
                    >
                        {previewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {previewMode ? "Edit" : "Preview"}
                    </Button>
                    <Button size="sm">Save Form</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
                {/* Form Canvas */}
                <Card>
                    <CardContent className="pt-6 space-y-3">
                        {fields.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">No fields yet</p>
                                <p className="text-xs mt-1">Add fields from the palette</p>
                            </div>
                        ) : previewMode ? (
                            // Preview Mode
                            <div className="space-y-4 max-w-md mx-auto">
                                {fields.map((field) => {
                                    const _Meta = FIELD_TYPE_META[field.type];
                                    return (
                                        <div key={field.id} className="space-y-1.5">
                                            <label className="text-sm font-medium flex items-center gap-1">
                                                {field.label}
                                                {field.required && (
                                                    <span className="text-destructive">*</span>
                                                )}
                                            </label>
                                            {field.type === "select" ? (
                                                <select className="w-full border rounded-md p-2 text-sm bg-background">
                                                    <option value="">Select...</option>
                                                    {(field.options ?? []).map((opt) => (
                                                        <option key={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === "checkbox" ||
                                              field.type === "toggle" ? (
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" className="rounded" />
                                                    <span className="text-sm">{field.label}</span>
                                                </div>
                                            ) : field.type === "richtext" ? (
                                                <textarea
                                                    className="w-full border rounded-md p-2 text-sm bg-background min-h-[80px]"
                                                    placeholder={field.placeholder}
                                                />
                                            ) : field.type === "file" ? (
                                                <div className="border-2 border-dashed rounded-md p-4 text-center text-xs text-muted-foreground">
                                                    Drop file here or click to upload
                                                </div>
                                            ) : (
                                                <Input
                                                    type={
                                                        field.type === "number"
                                                            ? "number"
                                                            : field.type === "date"
                                                              ? "date"
                                                              : "text"
                                                    }
                                                    placeholder={field.placeholder}
                                                />
                                            )}
                                            {field.helpText && (
                                                <p className="text-[10px] text-muted-foreground">
                                                    {field.helpText}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Edit Mode
                            fields.map((field, i) => {
                                const Meta = FIELD_TYPE_META[field.type];
                                const isSelected = selectedField === field.id;
                                return (
                                    <button
                                        key={field.id}
                                        type="button"
                                        className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:bg-accent/30"
                                        }`}
                                        onClick={() => setSelectedField(field.id)}
                                    >
                                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                                        <Meta.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {field.label}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="ghost" className="text-[9px]">
                                                    {Meta.label}
                                                </Badge>
                                                {field.required && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] text-destructive"
                                                    >
                                                        Required
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                            <button
                                                type="button"
                                                className="p-1 rounded hover:bg-accent"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveField(i, -1);
                                                }}
                                                aria-label="Move up"
                                                disabled={i === 0}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-1 rounded hover:bg-accent"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveField(i, 1);
                                                }}
                                                aria-label="Move down"
                                                disabled={i === fields.length - 1}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-1 rounded hover:bg-destructive/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteField(field.id);
                                                }}
                                                aria-label="Delete"
                                            >
                                                <Trash2 className="h-3 w-3 text-destructive" />
                                            </button>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Field Palette + Properties */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm">Field Palette</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-1.5">
                            {(
                                Object.entries(FIELD_TYPE_META) as [
                                    FormFieldType,
                                    { icon: React.ElementType; label: string },
                                ][]
                            ).map(([type, meta]) => (
                                <Button
                                    key={type}
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 justify-start text-xs h-8"
                                    onClick={() => addField(type)}
                                >
                                    <meta.icon className="h-3.5 w-3.5 shrink-0" />
                                    {meta.label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Properties Panel */}
                    {selected && !previewMode && (
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Settings2 className="h-4 w-4" />
                                    Properties
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                                        Label
                                    </label>
                                    <Input
                                        value={selected.label}
                                        onChange={(e) =>
                                            updateField(selected.id, { label: e.target.value })
                                        }
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                                        Placeholder
                                    </label>
                                    <Input
                                        value={selected.placeholder ?? ""}
                                        onChange={(e) =>
                                            updateField(selected.id, {
                                                placeholder: e.target.value || undefined,
                                            })
                                        }
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                                        Help Text
                                    </label>
                                    <Input
                                        value={selected.helpText ?? ""}
                                        onChange={(e) =>
                                            updateField(selected.id, {
                                                helpText: e.target.value || undefined,
                                            })
                                        }
                                        className="text-sm"
                                        placeholder="Optional helper text"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selected.required}
                                        onChange={(e) =>
                                            updateField(selected.id, { required: e.target.checked })
                                        }
                                        className="rounded"
                                    />
                                    <span className="text-xs">Required field</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
