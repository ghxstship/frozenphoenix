"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
        | "currency";
    placeholder?: string;
    required?: boolean;
    description?: string;
    options?: SelectOption[];
    defaultValue?: string | number;
    min?: number;
    max?: number;
    step?: number;
}

// ─── Entity Form Config ───

export interface CreateEntityConfig {
    entityName: string;
    description?: string;
    fields: CreateFieldDef[];
    size?: "sm" | "md" | "lg";
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
    onSubmit?: (values: Record<string, unknown>) => Promise<void> | void;
}

export function CreateEntityDialog({ config, open, onClose, onSubmit }: CreateEntityDialogProps) {
    const [values, setValues] = useState<Record<string, unknown>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            const defaults: Record<string, unknown> = {};
            for (const field of config.fields) {
                if (field.defaultValue !== undefined) {
                    defaults[field.key] = field.defaultValue;
                }
            }
            setValues(defaults);
            setErrors({});
            setSubmitting(false);
        }
    }, [open, config.fields]);

    const setValue = useCallback((key: string, value: unknown) => {
        setValues((prev) => ({ ...prev, [key]: value }));
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
            } catch {
                // Allow onSubmit to throw — keep dialog open
            } finally {
                setSubmitting(false);
            }
        },
        [validate, values, onSubmit, onClose]
    );

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent size={config.size ?? "md"}>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New {config.entityName}</DialogTitle>
                        {config.description && (
                            <DialogDescription>{config.description}</DialogDescription>
                        )}
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
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

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create {config.entityName}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
