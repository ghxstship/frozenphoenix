"use client";

import React, { useCallback, useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { updateEmail } from "@/lib/supabase/auth-actions";
import { csrfHeaders } from "@/lib/csrf";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Loader2, Mail, X } from "lucide-react";

/**
 * Banner shown to Bluesky users who have a placeholder @atproto.local email.
 * Prompts them to add a real email address for transactional communications.
 * Consumes the `needsEmailCollection` flag from AuthContext.
 */
export function EmailCollectionBanner() {
    const { needsEmailCollection, refreshProfile } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            const trimmed = email.trim();
            if (!trimmed) {
                setError("Please enter your email address.");
                return;
            }

            // Basic email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                setError("Please enter a valid email address.");
                return;
            }

            if (trimmed.endsWith("@atproto.local")) {
                setError("Please enter a real email address.");
                return;
            }

            setLoading(true);
            try {
                const { error: authError } = await updateEmail(trimmed);
                if (authError) {
                    setError(authError.message);
                    return;
                }

                // Also update user_profiles.email via API
                await fetch("/api/auth/update-email", {
                    method: "POST",
                    headers: csrfHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify({ email: trimmed }),
                });

                setSuccess(true);
                await refreshProfile();
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [email, refreshProfile]
    );

    if (!needsEmailCollection || dismissed) return null;

    if (success) {
        return (
            <div
                className="flex items-center gap-3 px-4 py-3 bg-success/10 border-b border-success/20"
                role="status"
                aria-live="polite"
            >
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                <p className="text-sm text-success">
                    Verification email sent to <strong>{email}</strong>. Check your inbox to
                    confirm.
                </p>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 bg-warning/10 border-b border-warning/20"
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-center gap-2 shrink-0">
                <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                <span className="text-sm font-medium text-warning-foreground">Add your email</span>
            </div>

            <p className="text-sm text-muted-foreground">
                You signed in with Bluesky. Add an email to receive notifications and reset your
                password.
            </p>

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto"
            >
                <div className="relative flex-1 sm:flex-initial">
                    <Mail
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="h-8 w-full sm:w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                        aria-label="Email address"
                    />
                </div>

                <Button type="submit" size="sm" variant="outline" disabled={loading}>
                    {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                        "Save"
                    )}
                </Button>

                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Dismiss email collection banner"
                >
                    <X className="h-4 w-4" />
                </button>
            </form>

            {error && (
                <p className="text-xs text-destructive w-full" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
