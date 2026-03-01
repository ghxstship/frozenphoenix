"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowRight, Construction } from "lucide-react";

export default function BillingSetupPage() {
    const router = useRouter();

    const handleSkip = useCallback(() => {
        router.push("/dashboard");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-lg space-y-8">
                {/* Progress indicator */}
                <div className="flex items-center gap-2 justify-center">
                    <div className="h-2 w-12 rounded-full bg-primary" />
                    <div className="h-2 w-12 rounded-full bg-primary" />
                    <div className="h-2 w-12 rounded-full bg-primary" />
                </div>

                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-2">
                        <CreditCard className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Configure billing
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Set up your subscription and payment method to unlock all features.
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted">
                        <Construction className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-semibold text-base">Coming soon</h2>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Billing integration is being finalized. You can continue using
                            the platform and configure billing later from your organization settings.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSkip}
                        className="flex-1"
                    >
                        Skip for now
                    </Button>
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="flex-1"
                    >
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
