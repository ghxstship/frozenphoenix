"use client";

/* ═══════════════════════════════════════════════════════════════
   STEP INDICATOR — Shared multi-step progress indicator

   Used by WizardShell and FormPageShell (wizard mode) for
   consistent step visualization. Supports clickable completed
   steps, hidden steps, icons, and descriptions.
   ═══════════════════════════════════════════════════════════════ */

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { SHELLS_STRINGS } from "@/lib/i18n/shells-strings";

export interface StepDef {
    /** Unique step identifier */
    id: string;
    /** Display label */
    label: string;
    /** Optional description */
    description?: string | undefined;
    /** Optional step icon */
    icon?: React.ComponentType<{ className?: string }> | undefined;
    /** Whether this step is hidden from the indicator */
    hidden?: boolean | undefined;
}

export interface StepIndicatorProps {
    /** Step definitions */
    steps: StepDef[];
    /** Current step index (0-based) */
    currentIndex: number;
    /** Click handler for completed steps (enables click-to-jump) */
    onStepClick?: ((index: number) => void) | undefined;
    /** Accessible label for the nav element */
    ariaLabel?: string | undefined;
}

export const StepIndicator = React.memo(function StepIndicator({
    steps,
    currentIndex,
    onStepClick,
    ariaLabel,
}: StepIndicatorProps) {
    const visibleSteps = steps.filter((s) => !s.hidden);

    return (
        <nav aria-label={ariaLabel ?? SHELLS_STRINGS.wizard_progress_label} className="w-full">
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
                                        <span className="block density-caption text-muted-foreground/70 leading-tight mt-0.5">
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
});

StepIndicator.displayName = "StepIndicator";
