"use client";

/* ═══════════════════════════════════════════════════════════════
   WIZARD SHELL — Universal composable multi-step flow container

   Composes step indicator, step panels, and navigation buttons
   from a pure-data WizardConfig. Handles step validation,
   skip logic, back/next navigation, and completion callback.

   Pattern D from NON_LIST_PAGE_INFRASTRUCTURE_AUDIT.md:
   Step indicator → Step content panels → Navigation buttons

   Target: ~7 wizard/onboarding pages
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PermissionGate } from "@/components/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import type { WizardConfig, WizardStepDef } from "@/types/wizard-config";

// ─── Types ───────────────────────────────────────────────────

export interface WizardShellProps {
    config: WizardConfig;
    /** Controlled step index — when provided, shell is controlled externally */
    activeStep?: number;
    /** Controlled step change handler */
    onStepChange?: (step: number) => void;
    /** External submitting state */
    isSubmitting?: boolean;
}

// ─── Step Indicator ─────────────────────────────────────────

function StepIndicator({
    steps,
    currentIndex,
    onStepClick,
}: {
    steps: WizardStepDef[];
    currentIndex: number;
    onStepClick?: (index: number) => void;
}) {
    const visibleSteps = steps.filter((s) => !s.hidden);

    return (
        <nav aria-label="Wizard progress" className="w-full">
            <ol className="flex items-center gap-2">
                {visibleSteps.map((step, i) => {
                    const originalIndex = steps.indexOf(step);
                    const isComplete = originalIndex < currentIndex;
                    const isCurrent = originalIndex === currentIndex;
                    const StepIcon = step.icon;

                    return (
                        <li key={step.id} className="flex items-center flex-1 last:flex-initial">
                            <button
                                type="button"
                                onClick={() => isComplete && onStepClick?.(originalIndex)}
                                disabled={!isComplete}
                                className={cn(
                                    "flex items-center gap-2 text-left transition-colors",
                                    isComplete && "cursor-pointer hover:text-primary",
                                    !isComplete && !isCurrent && "cursor-default"
                                )}
                                aria-current={isCurrent ? "step" : undefined}
                            >
                                <span
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                                        isComplete &&
                                            "border-primary bg-primary text-primary-foreground",
                                        isCurrent && "border-primary bg-background text-primary",
                                        !isComplete &&
                                            !isCurrent &&
                                            "border-muted-foreground/30 text-muted-foreground/50"
                                    )}
                                >
                                    {isComplete ? (
                                        <Check className="h-4 w-4" />
                                    ) : StepIcon ? (
                                        <StepIcon className="h-4 w-4" />
                                    ) : (
                                        i + 1
                                    )}
                                </span>
                                <span className="hidden sm:block">
                                    <span
                                        className={cn(
                                            "block text-xs font-medium leading-tight",
                                            isCurrent ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                    {step.description && (
                                        <span className="block text-[10px] text-muted-foreground/70 leading-tight mt-0.5">
                                            {step.description}
                                        </span>
                                    )}
                                </span>
                            </button>
                            {i < visibleSteps.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-0.5 mx-2 rounded-full transition-colors",
                                        originalIndex < currentIndex
                                            ? "bg-primary"
                                            : "bg-muted-foreground/20"
                                    )}
                                    aria-hidden
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

// ─── Main Component ─────────────────────────────────────────

export function WizardShell({
    config,
    activeStep: controlledStep,
    onStepChange: controlledOnStepChange,
    isSubmitting = false,
}: WizardShellProps) {
    const [internalStep, setInternalStep] = useState(0);
    const [validationError, setValidationError] = useState<string | null>(null);

    const currentIndex = controlledStep ?? internalStep;
    const setCurrentIndex = controlledOnStepChange ?? setInternalStep;

    const steps = config.steps;
    const currentStep = steps[currentIndex];
    const isFirstStep = currentIndex === 0;
    const isLastStep = currentIndex === steps.length - 1;

    const showProgress = config.showProgress !== false;
    const allowBack = config.allowBack !== false;

    const nextLabel = config.nextLabel ?? "Continue";
    const backLabel = config.backLabel ?? "Back";
    const submitLabel = config.submitLabel ?? "Complete";
    const skipLabel = config.skipLabel ?? "Skip";

    const handleNext = useCallback(async () => {
        setValidationError(null);

        if (currentStep?.validate) {
            const result = currentStep.validate();
            if (result === false) {
                setValidationError("Please complete this step before continuing.");
                return;
            }
            if (typeof result === "string") {
                setValidationError(result);
                return;
            }
        }

        if (isLastStep) {
            await config.onComplete?.();
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentStep, isLastStep, config, currentIndex, setCurrentIndex]);

    const handleBack = useCallback(() => {
        setValidationError(null);
        if (!isFirstStep) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [isFirstStep, currentIndex, setCurrentIndex]);

    const handleSkip = useCallback(() => {
        setValidationError(null);
        if (!isLastStep) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [isLastStep, currentIndex, setCurrentIndex]);

    const handleStepClick = useCallback(
        (index: number) => {
            if (allowBack && index < currentIndex) {
                setValidationError(null);
                setCurrentIndex(index);
            }
        },
        [allowBack, currentIndex, setCurrentIndex]
    );

    // Progress percentage
    const progressPercent = useMemo(
        () => Math.round(((currentIndex + 1) / steps.length) * 100),
        [currentIndex, steps.length]
    );

    const content = (
        <div className="space-y-6 motion-safe:animate-fade-in">
            <PageHeader title={config.title} description={config.description} />

            {/* Step indicator */}
            {showProgress && steps.length > 1 && (
                <StepIndicator
                    steps={steps}
                    currentIndex={currentIndex}
                    onStepClick={allowBack ? handleStepClick : undefined}
                />
            )}

            {/* Progress bar (small) */}
            {showProgress && steps.length > 1 && (
                <div
                    className="w-full bg-muted rounded-full h-1.5"
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            {/* Step content */}
            <Card>
                <CardContent className="pt-6">{currentStep?.content}</CardContent>
            </Card>

            {/* Validation error */}
            {validationError && (
                <p className="text-sm text-destructive font-medium" role="alert">
                    {validationError}
                </p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    {allowBack && !isFirstStep && (
                        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {backLabel}
                        </Button>
                    )}
                    {config.onCancel && isFirstStep && (
                        <Button variant="ghost" onClick={config.onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {currentStep?.skippable && !isLastStep && (
                        <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
                            {skipLabel}
                            <SkipForward className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                    <Button onClick={handleNext} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : isLastStep ? submitLabel : nextLabel}
                        {!isLastStep && !isSubmitting && <ChevronRight className="h-4 w-4 ml-1" />}
                    </Button>
                </div>
            </div>
        </div>
    );

    if (config.resource) {
        return (
            <PermissionGate
                resource={config.resource}
                action={config.action as "read" | "write" | "delete" | "manage" | undefined}
            >
                {content}
            </PermissionGate>
        );
    }

    return content;
}

WizardShell.displayName = "WizardShell";
