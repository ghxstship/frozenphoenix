"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form/form-field";
import { Select, type SelectOption } from "@/components/ui/form/select";
import { Textarea } from "@/components/ui/form/textarea";
import { CurrencyInput } from "@/components/ui/form/currency-input";
import {
    type EntityLookupConfig,
    EntityLookupSelect,
} from "@/components/ui/form/entity-lookup-select";
import { AlertCircle, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useConfirm } from "@/components/ui/confirm-dialog";

// ─── Field Definition ───

export interface CreateFieldDef {
    key: string;
    label: string;
    type:
        | "text"
        | "email"
        | "url"
        | "number"
        | "date"
        | "datetime-local"
        | "select"
        | "textarea"
        | "currency"
        | "entity-lookup";
    placeholder?: string | undefined;
    required?: boolean | undefined;
    description?: string | undefined;
    options?: SelectOption[] | undefined;
    defaultValue?: string | number | undefined;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    lookupConfig?: EntityLookupConfig | undefined;
}

// ─── Entity Form Config ───

export interface CreateEntityConfig {
    entityName: string;
    description?: string | undefined;
    fields: CreateFieldDef[];
    size?: "sm" | "md" | "lg" | undefined;
}

// ─── Hook: sync ?action=create to dialog open state ───

export function useCreateAction(): [boolean, () => void, () => void] {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isOpen = searchParams.get("action") === "create";

    const open = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "create");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    const close = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [searchParams, router, pathname]);

    return [isOpen, open, close];
}

// ─── Dialog Component ───

interface CreateEntityDialogProps {
    config: CreateEntityConfig;
    open: boolean;
    onClose: () => void;
    onSubmit?: (values: Record<string, unknown>) => Promise<void> | void | undefined;
}

export function CreateEntityDialog({ config, open, onClose, onSubmit }: CreateEntityDialogProps) {
    const [values, setValues] = useState<Record<string, unknown>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const initialValuesRef = useRef<Record<string, unknown>>({});
    const { confirm } = useConfirm();

    // Compute initial defaults once per open
    const computeDefaults = useCallback(() => {
        const defaults: Record<string, unknown> = {};
        for (const field of config.fields) {
            if (field.defaultValue !== undefined) {
                defaults[field.key] = field.defaultValue;
            }
        }
        return defaults;
    }, [config.fields]);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            const defaults = computeDefaults();
            initialValuesRef.current = defaults;
            setValues(defaults);
            setErrors({});
            setSubmitError(null);
            setSubmitting(false);
        }
    }, [open, computeDefaults]);

    // Dirty-state tracking
    const isDirty = useMemo(() => {
        const initial = initialValuesRef.current;
        return (
            Object.keys(values).some((key) => values[key] !== initial[key]) ||
            Object.keys(initial).some((key) => values[key] !== initial[key])
        );
    }, [values]);

    const setValue = useCallback((key: string, value: unknown) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        setSubmitError(null);
        setErrors((prev) => {
            if (prev[key]) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return prev;
        });
    }, []);

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};
        for (const field of config.fields) {
            if (field.required) {
                const val = values[field.key];
                if (val === undefined || val === null || val === "") {
                    newErrors[field.key] = `${field.label} is required`;
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [config.fields, values]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!validate()) return;

            setSubmitting(true);
            try {
                await onSubmit?.(values);
                onClose();
            } catch (err) {
                // Show error inline in the dialog
                setSubmitError(
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred. Please try again."
                );
            } finally {
                setSubmitting(false);
            }
        },
        [validate, values, onSubmit, onClose]
    );

    const handleClose = useCallback(async () => {
        if (isDirty && !submitting) {
            const confirmed = await confirm({
                title: "Discard changes?",
                description: "You have unsaved changes. Are you sure you want to close this form?",
                confirmLabel: "Discard",
                variant: "destructive",
            });
            if (!confirmed) return;
        }
        onClose();
    }, [isDirty, submitting, confirm, onClose]);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent size={config.size ?? "md"}>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New {config.entityName}</DialogTitle>
                        {config.description && (
                            <DialogDescription>{config.description}</DialogDescription>
                        )}
                    </DialogHeader>

                    <div className="grid density-gap-card py-4">
                        {config.fields.map((field) => (
                            <FormField
                                key={field.key}
                                label={field.label}
                                htmlFor={`create-${field.key}`}
                                required={field.required}
                                description={field.description}
                                error={errors[field.key]}
                            >
                                {field.type === "select" ? (
                                    <Select
                                        id={`create-${field.key}`}
                                        options={field.options ?? []}
                                        placeholder={
                                            field.placeholder ??
                                            `Select ${field.label.toLowerCase()}...`
                                        }
                                        value={(values[field.key] as string) ?? ""}
                                        onChange={(e) => setValue(field.key, e.target.value)}
                                        disabled={submitting}
                                    />
                                ) : field.type === "textarea" ? (
                                    <Textarea
                                        id={`create-${field.key}`}
                                        placeholder={field.placeholder}
                                        value={(values[field.key] as string) ?? ""}
                                        onChange={(e) => setValue(field.key, e.target.value)}
                                        disabled={submitting}
                                        rows={3}
                                    />
                                ) : field.type === "entity-lookup" && field.lookupConfig ? (
                                    <EntityLookupSelect
                                        id={`create-${field.key}`}
                                        lookupConfig={field.lookupConfig}
                                        placeholder={
                                            field.placeholder ??
                                            `Select ${field.label.toLowerCase()}...`
                                        }
                                        value={(values[field.key] as string) ?? ""}
                                        onChange={(v) => setValue(field.key, v)}
                                        disabled={submitting}
                                    />
                                ) : field.type === "currency" ? (
                                    <CurrencyInput
                                        id={`create-${field.key}`}
                                        placeholder={field.placeholder ?? "0.00"}
                                        value={values[field.key] as number | undefined}
                                        onChange={(v) => setValue(field.key, v)}
                                        disabled={submitting}
                                    />
                                ) : (
                                    <Input
                                        id={`create-${field.key}`}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={(values[field.key] as string | number) ?? ""}
                                        onChange={(e) =>
                                            setValue(
                                                field.key,
                                                field.type === "number"
                                                    ? e.target.valueAsNumber
                                                    : e.target.value
                                            )
                                        }
                                        min={field.min}
                                        max={field.max}
                                        step={field.step}
                                        disabled={submitting}
                                    />
                                )}
                            </FormField>
                        ))}
                    </div>

                    {submitError && (
                        <div
                            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                            role="alert"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{submitError}</span>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && (
                                <Loader2 className="h-4 w-4 mr-2 motion-safe:animate-spin" />
                            )}
                            Create {config.entityName}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
