"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { csrfHeaders } from "@/lib/security/csrf";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Link2,
    Mail,
    Trash2,
    UserPlus,
    Users,
} from "lucide-react";
import { WizardShell } from "@/components/shells/wizard-shell";
import type { WizardConfig } from "@/types/wizard-config";

type InviteType = "org_invite" | "referral";

const ROLE_OPTIONS = [
    { value: "exec", label: "Executive" },
    { value: "director", label: "Director" },
    { value: "pm", label: "Project Manager" },
    { value: "member", label: "Team Member" },
    { value: "client", label: "Client" },
    { value: "collaborator", label: "Collaborator" },
];

interface InviteRow {
    id: string;
    email: string;
    role: string;
}

let rowCounter = 0;
function createRow(): InviteRow {
    return { id: `row-${++rowCounter}`, email: "", role: "member" };
}

const INVITE_OPTIONS: { value: InviteType; label: string; icon: typeof Users }[] = [
    { value: "org_invite", label: "Team Invite", icon: Users },
    { value: "referral", label: "Referral Invite", icon: Link2 },
];

function InviteTypeToggle({
    inviteType,
    onChange,
}: {
    inviteType: InviteType;
    onChange: (v: InviteType) => void;
}) {
    const groupRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const idx = INVITE_OPTIONS.findIndex((o) => o.value === inviteType);
            let next = idx;
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                next = (idx + 1) % INVITE_OPTIONS.length;
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                next = (idx - 1 + INVITE_OPTIONS.length) % INVITE_OPTIONS.length;
            } else {
                return;
            }
            e.preventDefault();
            const nextOption = INVITE_OPTIONS[next];
            if (!nextOption) return;
            onChange(nextOption.value);
            // Focus the newly active radio
            const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
            buttons?.[next]?.focus();
        },
        [inviteType, onChange]
    );

    return (
        <div
            ref={groupRef}
            className="flex rounded-lg border border-input p-1 gap-1"
            role="radiogroup"
            aria-label="Invitation type"
            onKeyDown={handleKeyDown}
        >
            {INVITE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = inviteType === opt.value;
                return (
                    <Button
                        key={opt.value}
                        variant="ghost"
                        role="radio"
                        aria-checked={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => onChange(opt.value)}
                        className={`flex-1 gap-2 rounded-md px-3 py-2 text-sm font-medium h-auto ${
                            isActive
                                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {opt.label}
                    </Button>
                );
            })}
        </div>
    );
}

export function InviteTeamPageClient() {
    const router = useRouter();
    const { activeOrg } = useAuth();

    const [inviteType, setInviteType] = useState<InviteType>("org_invite");
    const [rows, setRows] = useState<InviteRow[]>([createRow(), createRow(), createRow()]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sentCount, setSentCount] = useState(0);
    const [success, setSuccess] = useState(false);

    const updateRow = useCallback((id: string, field: keyof InviteRow, value: string) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    }, []);

    const removeRow = useCallback((id: string) => {
        setRows((prev) => {
            if (prev.length <= 1) return prev;
            return prev.filter((r) => r.id !== id);
        });
    }, []);

    const addRow = useCallback(() => {
        setRows((prev) => [...prev, createRow()]);
    }, []);

    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            e?.preventDefault();
            setError(null);

            const validRows = rows.filter(
                (r) => r.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())
            );

            if (validRows.length === 0) {
                setError("Please enter at least one valid email address.");
                return;
            }

            if (inviteType === "org_invite" && !activeOrg) {
                setError("No organization found. Please set up your organization first.");
                return;
            }

            setLoading(true);

            try {
                const body =
                    inviteType === "org_invite"
                        ? {
                              invite_type: "org_invite" as const,
                              invitees: validRows.map((r) => ({
                                  email: r.email.trim(),
                                  role: r.role,
                              })),
                              organization_id: activeOrg?.organization_id,
                              message: message.trim() || undefined,
                          }
                        : {
                              invite_type: "referral" as const,
                              invitees: validRows.map((r) => ({ email: r.email.trim() })),
                              message: message.trim() || undefined,
                          };

                const res = await fetch("/api/invitations", {
                    method: "POST",
                    headers: csrfHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify(body),
                });

                if (!res.ok) {
                    const data = await res.json();
                    const msg =
                        typeof data.error === "string"
                            ? data.error
                            : data.error?.message || "Failed to send invitations.";
                    setError(msg);
                    return;
                }

                const data = await res.json();
                setSentCount(data.invitations?.length || validRows.length);
                setSuccess(true);
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [rows, message, activeOrg, inviteType]
    );

    const handleSkip = useCallback(() => {
        router.push("/onboarding/billing");
    }, [router]);

    const wizardConfig: WizardConfig = useMemo(
        () => ({
            title: "Invite people",
            description:
                (inviteType === "org_invite"
                    ? `Add team members to ${activeOrg?.organizations?.name || "your organization"}.`
                    : "Invite people to join the platform — no organization required.") +
                " You can always invite more people later.",
            icon: UserPlus,
            showProgress: false,
            submitLabel: "Send Invitations",
            onCancel: handleSkip,
            onComplete: handleSubmit,
            steps: [
                {
                    id: "invite",
                    label: "Invite Team",
                    icon: UserPlus,
                    skippable: true,
                    content: success ? (
                        <div
                            className="w-full text-center density-gap-section"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                                <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                            </div>
                            <h2 className="text-xl font-bold">
                                {sentCount} invitation{sentCount !== 1 ? "s" : ""} sent!
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {inviteType === "org_invite"
                                    ? "Your team members will receive an email with a link to join."
                                    : "They\u2019ll receive an email with a link to sign up."}
                            </p>
                            <p className="text-xs text-muted-foreground">One more step to go.</p>
                            <Button onClick={() => router.push("/onboarding/billing")}>
                                Continue
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Invite type toggle */}
                            <InviteTypeToggle inviteType={inviteType} onChange={setInviteType} />

                            {error && (
                                <div
                                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                                    role="alert"
                                    aria-live="assertive"
                                >
                                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                {rows.map((row, idx) => (
                                    <div
                                        key={row.id}
                                        className="flex flex-col sm:flex-row gap-2 sm:items-center"
                                    >
                                        <div className="relative flex-1">
                                            <Mail
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                                aria-hidden="true"
                                            />
                                            <Input
                                                type="email"
                                                placeholder={
                                                    inviteType === "org_invite"
                                                        ? `teammate${idx + 1}@company.com`
                                                        : `friend${idx + 1}@example.com`
                                                }
                                                value={row.email}
                                                onChange={(e) =>
                                                    updateRow(row.id, "email", e.target.value)
                                                }
                                                className="pl-10"
                                                aria-label={`Email address ${idx + 1}`}
                                                disabled={loading}
                                            />
                                        </div>
                                        {inviteType === "org_invite" && (
                                            <NativeSelect
                                                value={row.role}
                                                onChange={(e) =>
                                                    updateRow(row.id, "role", e.target.value)
                                                }
                                                className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                aria-label={`Role for invite ${idx + 1}`}
                                                disabled={loading}
                                            >
                                                {ROLE_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRow(row.id)}
                                            disabled={rows.length <= 1 || loading}
                                            aria-label={`Remove invite row ${idx + 1}`}
                                            className="shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addRow}
                                disabled={loading}
                                className="w-full"
                            >
                                <UserPlus className="h-4 w-4" aria-hidden="true" />
                                Add another
                            </Button>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="invite-message"
                                    className="text-sm font-medium leading-none"
                                >
                                    Personal message{" "}
                                    <span className="text-muted-foreground font-normal">
                                        (optional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="invite-message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Hey! Join us on ATLVS to collaborate on our upcoming productions."
                                    rows={3}
                                    className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    ),
                },
            ],
        }),
        [
            inviteType,
            activeOrg?.organizations?.name,
            handleSkip,
            handleSubmit,
            success,
            sentCount,
            router,
            error,
            rows,
            loading,
            updateRow,
            removeRow,
            addRow,
            message,
        ]
    );

    return <WizardShell config={wizardConfig} isSubmitting={loading} />;
}
