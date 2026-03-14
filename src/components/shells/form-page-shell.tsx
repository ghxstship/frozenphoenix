"use client";

/* ═══════════════════════════════════════════════════════════════
   FORM PAGE SHELL — Universal composable form page container

   Composes FormLayout + FormSection primitives into a complete
   create/edit form page from a pure-data FormPageConfig. Supports
   section-based and wizard-based layouts. Slot overrides allow
   custom content injection for complex forms.

   Replaces: hand-built FormLayout form pages.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { getEntityConfig } from "@/lib/api/entity-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput, DatePicker, FormField, Select, Textarea } from "@/components/ui/form";
import { FormSection } from "@/components/layouts/form-layout";
import { PermissionGate } from "@/components/permission-guard";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import type { FormFieldDef, FormPageConfig, FormWizardStepDef } from "@/types/form-page-config";

// ─── Types ───────────────────────────────────────────────────

type FormData = Record<string, unknown>;

export interface FormPageShellProps {
    config: FormPageConfig;
    /** Pre-fetched record for edit mode — bypasses built-in fetch */
    record?: FormData | null;
    /** Loading state for externally-provided record */
    isLoading?: boolean;
    /** External submit handler — receives transformed form data */
    onSubmit: (data: FormData) => void | Promise<void>;
    /** Whether the external submit is pending */
    isSubmitting?: boolean;
}

// ─── Field Renderer ─────────────────────────────────────────

function renderField(
    field: FormFieldDef,
    value: unknown,
    onChange: (id: string, value: unknown) => void,
    error?: string | null
) {
    if (field.hidden) return null;

    const commonProps = {
        id: field.id,
        disabled: field.disabled,
    };

    let input: React.ReactNode;

    switch (field.type) {
        case "text":
        case "email":
        case "tel":
        case "url":
        case "password":
            input = (
                <Input
                    {...commonProps}
                    type={field.type}
                    value={String(value ?? "")}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                />
            );
            break;

        case "number":
            input = (
                <Input
                    {...commonProps}
                    type="number"
                    value={String(value ?? "")}
                    onChange={(e) =>
                        onChange(field.id, e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder={field.placeholder}
                />
            );
            break;

        case "currency":
            input = (
                <CurrencyInput
                    {...commonProps}
                    value={Number(value ?? 0)}
                    onChange={(v) => onChange(field.id, v ?? 0)}
                    placeholder={field.placeholder}
                />
            );
            break;

        case "date":
            input = (
                <DatePicker
                    {...commonProps}
                    value={String(value ?? "")}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            );
            break;

        case "datetime":
            input = (
                <Input
                    {...commonProps}
                    type="datetime-local"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            );
            break;

        case "textarea":
            input = (
                <Textarea
                    {...commonProps}
                    value={String(value ?? "")}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                />
            );
            break;

        case "select":
            input = (
                <Select
                    {...commonProps}
                    value={String(value ?? "")}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    options={field.options ?? []}
                    placeholder={field.placeholder}
                />
            );
            break;

        case "checkbox":
            input = (
                <div className="flex items-center gap-3">
                    <input
                        {...commonProps}
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => onChange(field.id, e.target.checked)}
                        className="h-4 w-4 rounded border-input"
                    />
                    {field.description && (
                        <label htmlFor={field.id} className="text-sm font-medium">
                            {field.description}
                        </label>
                    )}
                </div>
            );
            // Checkbox renders its own label via description, so skip FormField wrapper description
            return (
                <div key={field.id} className={field.fullWidth ? "col-span-2" : undefined}>
                    <FormField label={field.label} htmlFor={field.id} required={field.required}>
                        {input}
                    </FormField>
                    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
                </div>
            );

        case "color":
            input = (
                <div className="flex items-center gap-2">
                    <input
                        {...commonProps}
                        type="color"
                        value={String(value ?? "#000000")}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                    />
                    <Input
                        value={String(value ?? "#000000")}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className="font-mono text-xs"
                        disabled={field.disabled}
                    />
                </div>
            );
            break;

        case "hidden":
            return null;

        default:
            input = (
                <Input
                    {...commonProps}
                    value={String(value ?? "")}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                />
            );
    }

    return (
        <div key={field.id} className={field.fullWidth ? "col-span-2" : undefined}>
            <FormField
                label={field.label}
                htmlFor={field.id}
                required={field.required}
                description={field.description}
            >
                {input}
            </FormField>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
}

// ─── Section Fields Grid ────────────────────────────────────

function SectionFieldsGrid({
    fields,
    formData,
    onChange,
    errors,
}: {
    fields: FormFieldDef[];
    formData: FormData;
    onChange: (id: string, value: unknown) => void;
    errors: Record<string, string | null>;
}) {
    const visibleFields = fields.filter((f) => !f.hidden);
    const hasGridFields = visibleFields.some((f) => !f.fullWidth);

    if (!hasGridFields) {
        return (
            <>
                {visibleFields.map((field) =>
                    renderField(field, formData[field.id], onChange, errors[field.id])
                )}
            </>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {visibleFields.map((field) =>
                renderField(field, formData[field.id], onChange, errors[field.id])
            )}
        </div>
    );
}

// ─── Wizard Step Indicator ──────────────────────────────────

function WizardStepIndicator({
    steps,
    currentIndex,
}: {
    steps: FormWizardStepDef[];
    currentIndex: number;
}) {
    return (
        <div className="flex items-center gap-2">
            {steps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i === currentIndex;
                const isComplete = i < currentIndex;
                return (
                    <div key={step.id} className="flex items-center gap-2 flex-1">
                        <div
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                isComplete && "bg-success text-success-foreground",
                                isActive && !isComplete && "bg-primary text-primary-foreground",
                                !isActive && !isComplete && "bg-muted text-muted-foreground"
                            )}
                        >
                            {isComplete ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : Icon ? (
                                <Icon className="h-4 w-4" />
                            ) : (
                                <span>{i + 1}</span>
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-xs font-medium hidden sm:block",
                                isActive ? "text-foreground" : "text-muted-foreground"
                            )}
                        >
                            {step.label}
                        </span>
                        {i < steps.length - 1 && (
                            <div
                                className={cn(
                                    "flex-1 h-0.5",
                                    isComplete ? "bg-success" : "bg-muted"
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Component (outer wrapper) ─────────────────────────

export function FormPageShell({
    config,
    record,
    isLoading,
    onSubmit,
    isSubmitting = false,
}: FormPageShellProps) {
    const entityConfig = getEntityConfig(config.entityKey);
    const resource = entityConfig?.resource ?? config.entityKey;

    // Loading state
    if (isLoading) {
        return (
            <div className="animate-fade-in max-w-3xl flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Key the inner component on record identity so React resets form state
    // when the record loads (edit mode) without needing useEffect sync.
    const recordKey =
        config.mode === "edit" && record
            ? String((record as Record<string, unknown>).id ?? "loaded")
            : "new";

    return (
        <PermissionGate resource={resource} action="write">
            <FormPageShellInner
                key={recordKey}
                config={config}
                record={record}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
            />
        </PermissionGate>
    );
}

FormPageShell.displayName = "FormPageShell";

// ─── Inner Component (owns form state) ──────────────────────

function FormPageShellInner({
    config,
    record,
    onSubmit,
    isSubmitting,
}: {
    config: FormPageConfig;
    record?: FormData | null;
    onSubmit: (data: FormData) => void | Promise<void>;
    isSubmitting: boolean;
}) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    // ─── Form state ───
    const initialData = useMemo(() => {
        const defaults: FormData = {};
        const allFields =
            config.layout === "wizard"
                ? (config.steps ?? []).flatMap((s) => s.fields ?? [])
                : (config.sections ?? []).flatMap((s) => s.fields);

        for (const field of allFields) {
            defaults[field.id] = field.defaultValue ?? (field.type === "checkbox" ? false : "");
        }

        if (config.mode === "edit" && record) {
            const transformed = config.transformRecord ? config.transformRecord(record) : record;
            return { ...defaults, ...transformed };
        }

        return defaults;
    }, [config, record]);

    const [formData, setFormData] = useState<FormData>(initialData);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [wizardStep, setWizardStep] = useState(0);

    const handleChange = useCallback((id: string, value: unknown) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
        setErrors((prev) => ({ ...prev, [id]: null }));
    }, []);

    // ─── Validation ───
    const validate = useCallback((): boolean => {
        const allFields =
            config.layout === "wizard"
                ? (config.steps ?? []).flatMap((s) => s.fields ?? [])
                : (config.sections ?? []).flatMap((s) => s.fields);

        const newErrors: Record<string, string | null> = {};
        let valid = true;

        for (const field of allFields) {
            if (field.hidden) continue;
            const value = formData[field.id];

            // Required check
            if (field.required && (value === "" || value === null || value === undefined)) {
                newErrors[field.id] = `${field.label} is required`;
                valid = false;
                continue;
            }

            // Custom validation
            if (field.validate) {
                const err = field.validate(value);
                if (err) {
                    newErrors[field.id] = err;
                    valid = false;
                }
            }
        }

        setErrors(newErrors);
        return valid;
    }, [formData, config]);

    // ─── Submit ───
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!validate()) return;

            try {
                const payload = config.transformSubmit
                    ? config.transformSubmit(formData)
                    : formData;
                await onSubmit(payload);

                if (config.successRedirect) {
                    router.push(config.successRedirect);
                } else {
                    router.push(config.backHref);
                }
            } catch (error) {
                logger.error(`Failed to ${config.mode} ${config.entityKey}`, { error });
            }
        },
        [formData, validate, onSubmit, config, router]
    );

    // ─── Keyboard shortcut (Cmd/Ctrl+S) ───
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                if (!isSubmitting) {
                    formRef.current?.requestSubmit();
                }
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isSubmitting]);

    // ─── Wizard navigation ───
    const steps = config.steps ?? [];
    const currentWizardStep = steps[wizardStep];
    const isLastStep = wizardStep === steps.length - 1;

    const canAdvanceWizard = useMemo(() => {
        if (!currentWizardStep) return false;
        if (currentWizardStep.canAdvance) {
            return currentWizardStep.canAdvance(formData);
        }
        // Default: all required fields in current step must have values
        const stepFields = currentWizardStep.fields ?? [];
        return stepFields
            .filter((f) => f.required && !f.hidden)
            .every((f) => {
                const v = formData[f.id];
                return v !== "" && v !== null && v !== undefined;
            });
    }, [currentWizardStep, formData]);

    const defaultSubmitLabel = config.mode === "edit" ? "Save Changes" : "Create";

    // ─── Sections Layout ───
    if (config.layout !== "wizard") {
        return (
            <div className="animate-fade-in max-w-3xl">
                {/* Back Link */}
                <Link
                    href={config.backHref}
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    aria-label={`Go back to ${config.backLabel ?? "Back"}`}
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    {config.backLabel ?? "Back"}
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">{config.title}</h1>
                    {config.description && (
                        <p className="text-muted-foreground mt-1">{config.description}</p>
                    )}
                </div>

                {/* Form */}
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {config.contentSlot ?? (
                            <>
                                {(config.sections ?? []).map((section) => (
                                    <FormSection
                                        key={section.id}
                                        title={section.title}
                                        description={section.description}
                                        collapsible={section.collapsible}
                                        defaultOpen={!section.defaultCollapsed}
                                    >
                                        <SectionFieldsGrid
                                            fields={section.fields}
                                            formData={formData}
                                            onChange={handleChange}
                                            errors={errors}
                                        />
                                    </FormSection>
                                ))}
                            </>
                        )}

                        {config.footerSlot}
                    </div>

                    {/* Actions — sticky on scroll */}
                    <div className="flex items-center justify-between gap-3 mt-8 pt-4 pb-2 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur-sm z-10">
                        <div
                            className="text-xs text-muted-foreground/50 hidden sm:block"
                            aria-hidden="true"
                        >
                            <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">⌘S</kbd> to
                            save
                        </div>
                        <span className="sr-only">Press Command+S or Control+S to save</span>
                        <div className="flex items-center gap-3 ml-auto">
                            <Button type="button" variant="ghost" asChild disabled={isSubmitting}>
                                <Link href={config.backHref}>{config.cancelLabel ?? "Cancel"}</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {config.submitLabel ?? defaultSubmitLabel}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    // ─── Wizard Layout ───
    return (
        <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            {/* Back Link */}
            <Link
                href={config.backHref}
                className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Go back to ${config.backLabel ?? "Back"}`}
            >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                {config.backLabel ?? "Back"}
            </Link>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">{config.title}</h1>
                {config.description && (
                    <p className="text-muted-foreground mt-1">{config.description}</p>
                )}
            </div>

            {/* Step Indicator */}
            <WizardStepIndicator steps={steps} currentIndex={wizardStep} />

            {/* Content Slot Override */}
            {config.contentSlot ?? (
                <>
                    {/* Step Content */}
                    {currentWizardStep && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {currentWizardStep.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentWizardStep.content ?? (
                                    <SectionFieldsGrid
                                        fields={currentWizardStep.fields ?? []}
                                        formData={formData}
                                        onChange={handleChange}
                                        errors={errors}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {config.footerSlot}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
                    disabled={wizardStep === 0}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                {isLastStep ? (
                    <Button
                        disabled={!canAdvanceWizard || isSubmitting}
                        onClick={handleSubmit as unknown as React.MouseEventHandler}
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        {isSubmitting ? "Saving..." : (config.submitLabel ?? defaultSubmitLabel)}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setWizardStep(wizardStep + 1)}
                        disabled={!canAdvanceWizard}
                    >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
