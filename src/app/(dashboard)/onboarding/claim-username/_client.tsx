"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { csrfHeaders } from "@/lib/security/csrf";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Input } from "@/components/ui/input";
import { AtSign, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { WizardShell } from "@/components/shells/wizard-shell";
import type { WizardConfig } from "@/types/wizard-config";

type AvailabilityState = "idle" | "checking" | "available" | "unavailable";

export function ClaimUsernamePageClient() {
    const router = useRouter();
    const { profile, username: currentUsername, refreshProfile } = useAuth();

    const [input, setInput] = useState("");
    const [availability, setAvailability] = useState<AvailabilityState>("idle");
    const [reason, setReason] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Already claimed — skip
    useEffect(() => {
        if (currentUsername) {
            router.push("/dashboard");
        }
    }, [currentUsername, router]);

    const handleInputChange = useCallback((value: string) => {
        const normalized = value.toLowerCase().trim();
        setInput(normalized);
        if (normalized.length < 3) {
            setAvailability("idle");
            setReason(null);
            setSuggestions([]);
        }
    }, []);

    // Debounced availability check
    useEffect(() => {
        if (input.length < 3) return;

        const timer = setTimeout(async () => {
            setAvailability("checking");

            try {
                const res = await fetch(`/api/usernames/check?q=${encodeURIComponent(input)}`);
                if (!res.ok) {
                    setAvailability("idle");
                    return;
                }
                const data = await res.json();
                setAvailability(data.available ? "available" : "unavailable");
                setReason(data.reason ?? null);
                setSuggestions(data.suggestions ?? []);
            } catch {
                setAvailability("idle");
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [input]);

    const handleClaim = useCallback(async () => {
        if (availability !== "available" || !input) return;
        setClaiming(true);
        setError(null);

        try {
            const res = await fetch("/api/usernames/claim", {
                method: "POST",
                headers: csrfHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({ username: input }),
            });

            const contentType = res.headers.get("content-type") ?? "";
            if (!contentType.includes("application/json")) {
                setError("Unexpected response. Please try again.");
                setClaiming(false);
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                const msg =
                    typeof data.error === "string"
                        ? data.error
                        : (data.error?.message ?? "Failed to claim username.");
                setError(msg);
                setClaiming(false);
                return;
            }

            try {
                await refreshProfile();
            } catch {
                // best-effort
            }

            setClaiming(false);
            setSuccess(true);

            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        } catch {
            setError("Something went wrong. Please try again.");
            setClaiming(false);
        }
    }, [input, availability, refreshProfile, router]);

    const wizardConfig: WizardConfig = useMemo(
        () => ({
            title: "Choose your username",
            description: `Pick a unique handle for your public profile${profile?.display_name ? `, ${profile.display_name}` : ""}. You can change it later.`,
            icon: AtSign,
            showProgress: false,
            onCancel: () => router.push("/dashboard"),
            onComplete: handleClaim,
            submitLabel: `Claim @${input || "username"}`,
            steps: [
                {
                    id: "claim",
                    label: "Username",
                    icon: AtSign,
                    validate: () =>
                        availability === "available" || "Please choose an available username.",
                    content: success ? (
                        <div
                            className="w-full text-center density-gap-section"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                                <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                            </div>
                            <h2 className="text-xl font-bold">Username claimed!</h2>
                            <p className="text-sm text-muted-foreground">
                                You&apos;re now{" "}
                                <span className="font-semibold text-foreground">@{input}</span>
                            </p>
                            <Loader2 className="h-5 w-5 motion-safe:animate-spin text-primary mx-auto" />
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {error && (
                                <div
                                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                                    role="alert"
                                    aria-live="assertive"
                                >
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="username-input" className="text-sm font-medium">
                                    Username
                                </label>
                                <div className="relative">
                                    <AtSign
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        id="username-input"
                                        value={input}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        placeholder="your.username"
                                        className="pl-10 pr-10"
                                        disabled={claiming}
                                        autoComplete="off"
                                        autoFocus
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {availability === "checking" && (
                                            <Loader2 className="h-4 w-4 motion-safe:animate-spin text-muted-foreground" />
                                        )}
                                        {availability === "available" && (
                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                        )}
                                        {availability === "unavailable" && (
                                            <XCircle className="h-4 w-4 text-destructive" />
                                        )}
                                    </div>
                                </div>

                                {/* Feedback */}
                                {availability === "available" && (
                                    <p className="text-xs text-success">Username is available!</p>
                                )}
                                {availability === "unavailable" && reason && (
                                    <p className="text-xs text-destructive">{reason}</p>
                                )}
                                {input.length > 0 && input.length < 3 && (
                                    <p className="text-xs text-muted-foreground">
                                        Username must be at least 3 characters
                                    </p>
                                )}
                            </div>

                            {/* Suggestions */}
                            {suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">
                                        Try one of these instead:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setInput(s)}
                                                className="px-3 py-1 text-xs rounded-lg border border-border hover:bg-accent/10 transition-colors"
                                            >
                                                @{s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ),
                },
            ],
        }),
        [
            profile?.display_name,
            router,
            handleClaim,
            input,
            availability,
            success,
            error,
            claiming,
            handleInputChange,
            reason,
            suggestions,
        ]
    );

    return <WizardShell config={wizardConfig} isSubmitting={claiming} />;
}
