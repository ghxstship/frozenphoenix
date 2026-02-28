"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth";
import { Building2, Globe, Clock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

const TIMEZONES = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "Pacific/Honolulu",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Dubai",
    "Australia/Sydney",
    "Pacific/Auckland",
];

const INDUSTRIES = [
    "Film & Television",
    "Live Events & Experiential",
    "Advertising & Creative",
    "Music & Entertainment",
    "Corporate Events",
    "Sports & eSports",
    "Fashion & Retail",
    "Non-Profit & Cause",
    "Technology",
    "Other",
];

export default function OrgSetupPage() {
    const router = useRouter();
    const { user, profile, refreshProfile } = useAuth();

    const [orgName, setOrgName] = useState(
        user?.user_metadata?.org_name || ""
    );
    const [industry, setIndustry] = useState("");
    const [timezone, setTimezone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!orgName.trim()) {
            setError("Organization name is required.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: orgName.trim(),
                    industry: industry || undefined,
                    timezone,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to create organization.");
                return;
            }

            await refreshProfile();
            setSuccess(true);

            // Auto-advance after a short delay
            setTimeout(() => {
                router.push("/onboarding/invite-team");
            }, 1500);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [orgName, industry, timezone, refreshProfile, router]);

    const handleSkip = useCallback(() => {
        router.push("/dashboard");
    }, [router]);

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-lg text-center space-y-4" role="status" aria-live="polite">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-bold">Organization created!</h2>
                    <p className="text-sm text-muted-foreground">
                        Taking you to invite your team…
                    </p>
                    <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-lg space-y-8">
                {/* Progress indicator */}
                <div className="flex items-center gap-2 justify-center">
                    <div className="h-2 w-12 rounded-full bg-primary" />
                    <div className="h-2 w-12 rounded-full bg-muted" />
                    <div className="h-2 w-12 rounded-full bg-muted" />
                </div>

                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-2">
                        <Building2 className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Set up your organization
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Welcome{profile?.name ? `, ${profile.name}` : ""}! Let&apos;s get your workspace configured.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {error && (
                        <div
                            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                            role="alert"
                            aria-live="assertive"
                        >
                            {error}
                        </div>
                    )}

                    <AuthFormField
                        fieldId="org-name"
                        label="Organization Name"
                        type="text"
                        icon={Building2}
                        placeholder="Acme Productions"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                        disabled={loading}
                    />

                    <div className="space-y-2">
                        <label htmlFor="org-industry" className="text-sm font-medium leading-none">
                            Industry
                        </label>
                        <div className="relative">
                            <Globe
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                aria-hidden="true"
                            />
                            <select
                                id="org-industry"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loading}
                            >
                                <option value="">Select your industry…</option>
                                {INDUSTRIES.map((ind) => (
                                    <option key={ind} value={ind}>{ind}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="org-timezone" className="text-sm font-medium leading-none">
                            Default Timezone
                        </label>
                        <div className="relative">
                            <Clock
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                aria-hidden="true"
                            />
                            <select
                                id="org-timezone"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loading}
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleSkip}
                            disabled={loading}
                            className="flex-1"
                        >
                            Skip for now
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1"
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    Creating…
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
