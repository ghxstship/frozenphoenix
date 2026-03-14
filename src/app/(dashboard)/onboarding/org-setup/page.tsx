"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth";
import {
    ArrowRight,
    Briefcase,
    Building2,
    CheckCircle2,
    Clock,
    Globe,
    Loader2,
    Shield,
    UserCheck,
    Users,
} from "lucide-react";

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

const ROLE_OPTIONS = [
    {
        value: "exec" as const,
        label: "Executive / C-Suite",
        description: "Full platform access with financial oversight and org management",
        icon: Shield,
    },
    {
        value: "director" as const,
        label: "Department Head / Director",
        description: "Cross-project oversight with budget approval and crew management",
        icon: Users,
    },
    {
        value: "pm" as const,
        label: "Project Manager",
        description: "Manage projects, vendors, schedules, and team assignments",
        icon: Briefcase,
    },
    {
        value: "member" as const,
        label: "Team Member",
        description: "Execute tasks, track time, and complete checklists",
        icon: UserCheck,
    },
];

export default function OrgSetupPage() {
    const router = useRouter();
    const { user, profile, refreshProfile } = useAuth();

    const [orgName, setOrgName] = useState(user?.user_metadata?.org_name || "");
    const [role, setRole] = useState<"exec" | "director" | "pm" | "member">("pm");
    const [industry, setIndustry] = useState("");
    const [timezone, setTimezone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
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
                        role,
                        industry: industry || undefined,
                        timezone,
                    }),
                });

                // Guard against non-JSON responses (e.g. middleware HTML redirect)
                const contentType = res.headers.get("content-type") ?? "";
                if (!contentType.includes("application/json")) {
                    setError(
                        res.status === 401
                            ? "Your session has expired. Please log in again."
                            : `Unexpected response (${res.status}). Please try again.`
                    );
                    setLoading(false);
                    return;
                }

                const data = await res.json();

                if (!res.ok) {
                    const msg =
                        typeof data.error === "string"
                            ? data.error
                            : data.error?.message || "Failed to create organization.";
                    setError(msg);
                    setLoading(false);
                    return;
                }

                // Profile refresh is best-effort — don't let it block success
                try {
                    await refreshProfile();
                } catch {
                    // Swallow — the org was created; profile will sync on next load
                }

                setLoading(false);
                setSuccess(true);

                // Auto-advance after a short delay
                setTimeout(() => {
                    router.push("/onboarding/invite-team");
                }, 1500);
            } catch {
                setError("Something went wrong. Please try again.");
                setLoading(false);
            }
        },
        [orgName, role, industry, timezone, refreshProfile, router]
    );

    const handleSkip = useCallback(() => {
        router.push("/onboarding/invite-team");
    }, [router]);

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div
                    className="w-full max-w-lg text-center space-y-4"
                    role="status"
                    aria-live="polite"
                >
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-bold">Organization created!</h2>
                    <p className="text-sm text-muted-foreground">Taking you to invite your team…</p>
                    <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-lg space-y-8">
                {/* Progress indicator */}
                <div
                    className="flex items-center gap-2 justify-center"
                    role="progressbar"
                    aria-valuenow={1}
                    aria-valuemin={1}
                    aria-valuemax={3}
                    aria-label="Onboarding step 1 of 3"
                >
                    <div className="h-2 w-12 rounded-full bg-primary" />
                    <div className="h-2 w-12 rounded-full bg-muted" />
                    <div className="h-2 w-12 rounded-full bg-muted" />
                </div>

                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-2">
                        <Building2 className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Set up your organization</h1>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Welcome{profile?.name ? `, ${profile.name}` : ""}! Let&apos;s get your
                        workspace configured.
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

                    <fieldset className="space-y-2" disabled={loading}>
                        <legend className="text-sm font-medium leading-none">
                            What best describes your role?
                        </legend>
                        <div className="grid gap-2">
                            {ROLE_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = role === opt.value;
                                return (
                                    <label
                                        key={opt.value}
                                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                                            isSelected
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-input hover:border-muted-foreground/30"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={opt.value}
                                            checked={isSelected}
                                            onChange={() => setRole(opt.value)}
                                            className="sr-only"
                                        />
                                        <Icon
                                            className={`h-5 w-5 mt-0.5 shrink-0 ${
                                                isSelected
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                            aria-hidden="true"
                                        />
                                        <div className="space-y-0.5">
                                            <span
                                                className={`text-sm font-medium ${
                                                    isSelected ? "text-primary" : ""
                                                }`}
                                            >
                                                {opt.label}
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                {opt.description}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can change this later. As the organization creator, you&apos;ll have
                            full admin access regardless of role.
                        </p>
                    </fieldset>

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
                                className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                disabled={loading}
                            >
                                <option value="">Select your industry…</option>
                                {INDUSTRIES.map((ind) => (
                                    <option key={ind} value={ind}>
                                        {ind}
                                    </option>
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
                                className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                disabled={loading}
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz.replace(/_/g, " ")}
                                    </option>
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
