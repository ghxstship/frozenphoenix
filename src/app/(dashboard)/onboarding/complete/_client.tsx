"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PartyPopper, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardShell } from "@/components/shells/wizard-shell";
import type { WizardConfig } from "@/types/wizard-config";

const CELEBRATION_ITEMS = [
    { label: "Organization created", delay: 0 },
    { label: "Team invitations sent", delay: 150 },
    { label: "Billing configured", delay: 300 },
    { label: "You\u2019re ready to go!", delay: 450 },
];

export function OnboardingCompletePageClient() {
    const router = useRouter();
    const [visibleCount, setVisibleCount] = useState(0);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        CELEBRATION_ITEMS.forEach((_, i) => {
            timers.push(setTimeout(() => setVisibleCount(i + 1), 400 + i * 350));
        });

        return () => timers.forEach(clearTimeout);
    }, []);

    const handleContinue = useCallback(() => {
        router.push("/dashboard");
    }, [router]);

    const wizardConfig: WizardConfig = useMemo(
        () => ({
            title: "You're all set!",
            description: "Your workspace is ready. Here's what we set up for you.",
            icon: PartyPopper,
            showProgress: false,
            submitLabel: "Go to Dashboard",
            onComplete: handleContinue,
            steps: [
                {
                    id: "complete",
                    label: "Complete",
                    icon: Sparkles,
                    content: (
                        <div className="text-center space-y-8">
                            {/* Celebration icon */}
                            <div
                                className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-success/10 mx-auto animate-in zoom-in-50 duration-500"
                                role="img"
                                aria-label="Celebration"
                            >
                                <PartyPopper
                                    className="h-10 w-10 text-success"
                                    aria-hidden="true"
                                />
                            </div>

                            {/* Checklist animation */}
                            <div
                                className="space-y-3 text-left max-w-xs mx-auto"
                                role="list"
                                aria-label="Setup completion summary"
                            >
                                {CELEBRATION_ITEMS.map((item, i) => (
                                    <div
                                        key={item.label}
                                        role="listitem"
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
                                            i < visibleCount
                                                ? "opacity-100 translate-y-0 bg-success/5 border-success/20"
                                                : "opacity-0 translate-y-2 border-transparent"
                                        )}
                                    >
                                        <CheckCircle2
                                            className={cn(
                                                "h-5 w-5 shrink-0 transition-colors duration-300",
                                                i < visibleCount
                                                    ? "text-success"
                                                    : "text-muted-foreground/30"
                                            )}
                                            aria-hidden="true"
                                        />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                You can always adjust settings from the dashboard.
                            </p>
                        </div>
                    ),
                },
            ],
        }),
        [handleContinue, visibleCount]
    );

    return <WizardShell config={wizardConfig} />;
}
