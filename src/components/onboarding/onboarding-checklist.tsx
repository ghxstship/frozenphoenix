"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
    CheckCircle2,
    Circle,
    Building2,
    UserPlus,
    FolderPlus,
    Compass,
    Mail,
    User,
    Shield,
    FileCheck,
    CreditCard,
    ChevronRight,
    Loader2,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface OnboardingStep {
    id: string;
    step_key: string;
    title: string;
    description: string;
    sort_order: number;
    is_required: boolean;
    gate_access: boolean;
    completed: boolean;
}

interface OnboardingSummary {
    total: number;
    completed: number;
    totalRequired: number;
    completedRequired: number;
    isComplete: boolean;
}

const STEP_ICONS: Record<string, LucideIcon> = {
    verify_email: Mail,
    complete_profile: User,
    setup_organization: Building2,
    invite_team: UserPlus,
    configure_billing: CreditCard,
    create_first_project: FolderPlus,
    assign_team: UserPlus,
    review_deliverables: FileCheck,
    set_preferences: Shield,
    complete_compliance: Shield,
    review_assignments: FileCheck,
    explore_dashboard: Compass,
};

const STEP_ROUTES: Record<string, string> = {
    verify_email: "/settings/security",
    complete_profile: "/settings/security",
    setup_organization: "/onboarding/org-setup",
    invite_team: "/onboarding/invite-team",
    configure_billing: "/onboarding/billing",
    create_first_project: "/projects",
    review_deliverables: "/dashboard",
    complete_compliance: "/settings/security",
    explore_dashboard: "/dashboard",
};

const DISMISSED_KEY = "fp-onboarding-dismissed";

export function OnboardingChecklist() {
    const router = useRouter();
    const { profile } = useAuth();
    const [steps, setSteps] = useState<OnboardingStep[]>([]);
    const [summary, setSummary] = useState<OnboardingSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(DISMISSED_KEY) === "true";
        }
        return false;
    });
    const [completing, setCompleting] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProgress() {
            try {
                const res = await fetch("/api/onboarding/progress");
                if (res.ok) {
                    const data = await res.json();
                    setSteps(data.steps);
                    setSummary(data.summary);
                }
            } catch {
                // Silently fail — checklist is non-blocking
            } finally {
                setLoading(false);
            }
        }

        fetchProgress();
    }, []);

    const markComplete = useCallback(async (stepId: string) => {
        setCompleting(stepId);
        try {
            const res = await fetch("/api/onboarding/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ step_definition_id: stepId, status: "completed" }),
            });

            if (res.ok) {
                setSteps((prev) =>
                    prev.map((s) => (s.id === stepId ? { ...s, completed: true } : s))
                );
                setSummary((prev) =>
                    prev
                        ? {
                            ...prev,
                            completed: prev.completed + 1,
                            completedRequired: prev.completedRequired + (steps.find((s) => s.id === stepId)?.is_required ? 1 : 0),
                        }
                        : prev
                );
            }
        } catch {
            // Silently fail
        } finally {
            setCompleting(null);
        }
    }, [steps]);

    if (loading) return null;
    if (dismissed) return null;
    if (!summary || summary.isComplete) return null;
    if (steps.length === 0) return null;

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-base">
                            Welcome{profile?.name ? `, ${profile.name}` : ""}!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Complete these steps to get the most out of the platform.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setDismissed(true);
                            localStorage.setItem(DISMISSED_KEY, "true");
                        }}
                        aria-label="Dismiss onboarding checklist"
                        className="shrink-0 -mt-1 -mr-1"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <ProgressBar
                        value={summary.completed}
                        max={summary.total}
                        size="sm"
                        variant="success"
                        className="flex-1"
                    />
                    <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0">
                        {summary.completed}/{summary.total}
                    </span>
                </div>

                <ul className="space-y-1" role="list">
                    {steps.map((step) => {
                        const Icon = STEP_ICONS[step.step_key] || Circle;
                        const route = STEP_ROUTES[step.step_key];
                        const isCompleting = completing === step.id;

                        return (
                            <li key={step.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (step.completed) return;
                                        if (route) {
                                            router.push(route);
                                        } else {
                                            markComplete(step.id);
                                        }
                                    }}
                                    disabled={step.completed || isCompleting}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                                        step.completed
                                            ? "opacity-60"
                                            : "hover:bg-muted/50 cursor-pointer"
                                    )}
                                >
                                    {step.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-hidden="true" />
                                    ) : isCompleting ? (
                                        <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" aria-hidden="true" />
                                    ) : (
                                        <Icon className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <span className={cn(
                                            "text-sm font-medium block",
                                            step.completed && "line-through"
                                        )}>
                                            {step.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground block truncate">
                                            {step.description}
                                        </span>
                                    </div>
                                    {!step.completed && route && (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
