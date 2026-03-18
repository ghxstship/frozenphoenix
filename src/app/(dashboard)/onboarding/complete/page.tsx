"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, PartyPopper, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CELEBRATION_ITEMS = [
    { label: "Organization created", delay: 0 },
    { label: "Team invitations sent", delay: 150 },
    { label: "Billing configured", delay: 300 },
    { label: "You\u2019re ready to go!", delay: 450 },
];

export default function OnboardingCompletePage() {
    const router = useRouter();
    const [visibleCount, setVisibleCount] = useState(0);
    const [showCta, setShowCta] = useState(false);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        CELEBRATION_ITEMS.forEach((_, i) => {
            timers.push(setTimeout(() => setVisibleCount(i + 1), 400 + i * 350));
        });

        timers.push(setTimeout(() => setShowCta(true), 400 + CELEBRATION_ITEMS.length * 350 + 200));

        return () => timers.forEach(clearTimeout);
    }, []);

    const handleContinue = useCallback(() => {
        router.push("/dashboard");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md text-center space-y-8">
                {/* Celebration icon */}
                <div
                    className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-success/10 mx-auto animate-in zoom-in-50 duration-500"
                    role="img"
                    aria-label="Celebration"
                >
                    <PartyPopper className="h-10 w-10 text-success" aria-hidden="true" />
                </div>

                {/* Heading */}
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set!</h1>
                    <p className="text-muted-foreground">
                        Your workspace is ready. Here&apos;s what we set up for you.
                    </p>
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
                                    i < visibleCount ? "text-success" : "text-muted-foreground/30"
                                )}
                                aria-hidden="true"
                            />
                            <span className="text-sm font-medium">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div
                    className={cn(
                        "space-y-3 transition-all duration-500",
                        showCta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <Button
                        size="lg"
                        className="w-full max-w-xs"
                        onClick={handleContinue}
                        disabled={!showCta}
                    >
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        You can always adjust settings from the dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}
