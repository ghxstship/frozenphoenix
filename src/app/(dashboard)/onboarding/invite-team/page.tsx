"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Mail,
    Trash2,
    UserPlus,
} from "lucide-react";

const ROLE_OPTIONS = [
    { value: "pm", label: "Project Manager" },
    { value: "client", label: "Client" },
    { value: "vendor", label: "Vendor" },
    { value: "exec", label: "Executive" },
];

interface InviteRow {
    id: string;
    email: string;
    role: string;
}

let rowCounter = 0;
function createRow(): InviteRow {
    return { id: `row-${++rowCounter}`, email: "", role: "pm" };
}

export default function InviteTeamPage() {
    const router = useRouter();
    const { activeOrg } = useAuth();

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
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            const validRows = rows.filter(
                (r) => r.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())
            );

            if (validRows.length === 0) {
                setError("Please enter at least one valid email address.");
                return;
            }

            if (!activeOrg) {
                setError("No organization found. Please set up your organization first.");
                return;
            }

            setLoading(true);

            try {
                const res = await fetch("/api/invitations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        invitees: validRows.map((r) => ({ email: r.email.trim(), role: r.role })),
                        organization_id: activeOrg.organization_id,
                        message: message.trim() || undefined,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    setError(data.error || "Failed to send invitations.");
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
        [rows, message, activeOrg]
    );

    const handleSkip = useCallback(() => {
        router.push("/dashboard");
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
                    <h2 className="text-xl font-bold">
                        {sentCount} invitation{sentCount !== 1 ? "s" : ""} sent!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Your team members will receive an email with a link to join.
                    </p>
                    <Button onClick={() => router.push("/dashboard")}>
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
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
                    <div className="h-2 w-12 rounded-full bg-primary" />
                    <div className="h-2 w-12 rounded-full bg-muted" />
                </div>

                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-2">
                        <UserPlus className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Invite your team</h1>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Add team members to {activeOrg?.organizations?.name || "your organization"}.
                        You can always invite more people later.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                            <div key={row.id} className="flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <Mail
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        type="email"
                                        placeholder={`teammate${idx + 1}@company.com`}
                                        value={row.email}
                                        onChange={(e) => updateRow(row.id, "email", e.target.value)}
                                        className="pl-10"
                                        aria-label={`Email address ${idx + 1}`}
                                        disabled={loading}
                                    />
                                </div>
                                <select
                                    value={row.role}
                                    onChange={(e) => updateRow(row.id, "role", e.target.value)}
                                    className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label={`Role for invite ${idx + 1}`}
                                    disabled={loading}
                                >
                                    {ROLE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
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
                        <label
                            htmlFor="invite-message"
                            className="text-sm font-medium leading-none"
                        >
                            Personal message{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="invite-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Hey! Join us on Playbook to collaborate on our upcoming productions."
                            rows={3}
                            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            disabled={loading}
                        />
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
                                    Sending…
                                </>
                            ) : (
                                <>
                                    Send Invitations
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
