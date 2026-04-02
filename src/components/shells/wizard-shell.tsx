"use client";

/* ═══════════════════════════════════════════════════════════════
   WIZARD SHELL — Universal composable multi-step flow container

   Composes step indicator, step panels, and navigation buttons
   from a pure-data WizardConfig. Handles step validation,
   skip logic, back/next navigation, and completion callback.

   ⚠️  This shell is for OPAQUE-STEP wizards where each step owns
   its own state (e.g., onboarding, org-setup, billing).
   For DATA-ENTRY wizards where form fields are declared
   and state is managed by the shell, use FormPageShell with
   `layout: "wizard"` instead.

   Target: ~7 wizard/onboarding pages
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useMemo, useState } from "react";
import { PermissionGate } from "@/components/app/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "@/components/ui/step-indicator";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { useTranslation } from "@/lib/i18n/locale-provider";
import type { WizardConfig } from "@/types/wizard-config";

// ─── Types ───────────────────────────────────────────────────

export interface WizardShellProps {
    config: WizardConfig;
    /** Controlled step index — when provided, shell is controlled externally */
    activeStep?: number | undefined; /** Controlled step change handler */
    onStepChange?: ((step: number) => void) | undefined; /** External submitting state */
    isSubmitting?: boolean | undefined;
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
    const { t } = useTranslation("shells");

    const currentIndex = controlledStep ?? internalStep;
    const setCurrentIndex = controlledOnStepChange ?? setInternalStep;

    const steps = config.steps;
    const currentStep = steps[currentIndex];
    const isFirstStep = currentIndex === 0;
    const isLastStep = currentIndex === steps.length - 1;

    const showProgress = config.showProgress !== false;
    const allowBack = config.allowBack !== false;

    const nextLabel = config.nextLabel ?? t("wizard_continue");
    const backLabel = config.backLabel ?? t("wizard_back");
    const submitLabel = config.submitLabel ?? t("wizard_complete");
    const skipLabel = config.skipLabel ?? t("wizard_skip");

    const handleNext = useCallback(async () => {
        setValidationError(null);

        if (currentStep?.validate) {
            const result = currentStep.validate();
            if (result === false) {
                setValidationError(t("wizard_validation_default"));
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
    }, [currentStep, isLastStep, config, currentIndex, setCurrentIndex, t]);

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
        <div className="density-gap-page motion-safe:animate-fade-in pb-24 lg:pb-0">
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
                            {t("wizard_cancel")}
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
                    {currentStep?.skippable && isLastStep && config.onCancel && (
                        <Button variant="ghost" onClick={config.onCancel} disabled={isSubmitting}>
                            {skipLabel}
                            <SkipForward className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                    <Button onClick={handleNext} disabled={isSubmitting}>
                        {isSubmitting ? t("form_saving") : isLastStep ? submitLabel : nextLabel}
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
