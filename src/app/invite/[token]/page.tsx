"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth";
import {
    AlertCircle,
    ArrowRight,
    Building2,
    CheckCircle2,
    Loader2,
    Shield,
    Users,
    XCircle,
} from "lucide-react";

interface InvitationData {
    email: string;
    role: string;
    status: string;
    expires_at: string;
    personal_message: string | null;
    organizations: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

type InviteState = "loading" | "valid" | "expired" | "used" | "not_found" | "accepted" | "error";

const ROLE_LABELS: Record<string, string> = {
    exec: "Executive",
    pm: "Project Manager",
    client: "Client",
    vendor: "Vendor",
};

export default function InviteAcceptPage() {
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;
    const { user, refreshProfile } = useAuth();

    const [state, setState] = useState<InviteState>("loading");
    const [invitation, setInvitation] = useState<InvitationData | null>(null);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch invitation details
    useEffect(() => {
        async function fetchInvitation() {
            try {
                const res = await fetch(`/api/invitations/${token}/accept`);
                if (res.ok) {
                    const data = await res.json();
                    setInvitation(data.invitation);
                    setState("valid");
                } else {
                    const data = await res.json();
                    if (res.status === 410) {
                        setState(data.status === "accepted" ? "used" : "expired");
                    } else {
                        setState("not_found");
                    }
                }
            } catch {
                setState("error");
            }
        }

        fetchInvitation();
    }, [token]);

    const handleAccept = useCallback(async () => {
        if (!user) {
            // Redirect to signup with invite token
            router.push(`/signup?invite=${token}`);
            return;
        }

        setAccepting(true);
        setError(null);

        try {
            const res = await fetch(`/api/invitations/${token}/accept`, {
                method: "POST",
            });

            if (res.ok) {
                await refreshProfile();
                setState("accepted");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to accept invitation");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setAccepting(false);
        }
    }, [user, token, router, refreshProfile]);

    // Loading state
    if (state === "loading") {
        return (
            <AuthLayout title="Loading invitation…" subtitle="Verifying your invite">
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AuthLayout>
        );
    }

    // Error states
    if (state === "not_found") {
        return (
            <AuthLayout title="Invitation not found" subtitle="This link may be invalid">
                <div className="text-center space-y-4 py-4">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-destructive/10">
                        <XCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This invitation link is invalid or has been removed. Please contact your
                        team administrator for a new invite.
                    </p>
                    <Link href="/login">
                        <Button variant="outline">Go to Sign In</Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    if (state === "expired") {
        return (
            <AuthLayout title="Invitation expired" subtitle="This link is no longer valid">
                <div className="text-center space-y-4 py-4">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-warning/10">
                        <AlertCircle className="h-7 w-7 text-warning" aria-hidden="true" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This invitation has expired. Please ask your team administrator to send a
                        new invitation.
                    </p>
                    <Link href="/login">
                        <Button variant="outline">Go to Sign In</Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    if (state === "used") {
        return (
            <AuthLayout title="Already accepted" subtitle="This invitation was already used">
                <div className="text-center space-y-4 py-4">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-info/10">
                        <CheckCircle2 className="h-7 w-7 text-info" aria-hidden="true" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This invitation has already been accepted. If this was you, sign in to
                        access the organization.
                    </p>
                    <Link href="/login">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    // Accepted state
    if (state === "accepted") {
        return (
            <AuthLayout title="Welcome aboard!" subtitle="You've joined the team">
                <div className="text-center space-y-4 py-4" role="status" aria-live="polite">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">
                            You&apos;ve joined {invitation?.organizations?.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            You&apos;re now a member as{" "}
                            <strong>
                                {ROLE_LABELS[invitation?.role || ""] || invitation?.role}
                            </strong>
                            .
                        </p>
                    </div>
                    <Button onClick={() => router.push("/dashboard")}>
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    // Valid invitation — show accept card
    return (
        <AuthLayout
            title="You're invited"
            subtitle={`Join ${invitation?.organizations?.name || "a team"} on the platform`}
        >
            <div className="space-y-6">
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

                {/* Invitation details card */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">
                                {invitation?.organizations?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">Organization</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <span className="text-muted-foreground">Role:</span>
                            <span className="font-medium">
                                {ROLE_LABELS[invitation?.role || ""] || invitation?.role}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <span className="text-muted-foreground">Invited as:</span>
                            <span className="font-medium">{invitation?.email}</span>
                        </div>
                    </div>

                    {invitation?.personal_message && (
                        <div className="pt-2 border-t">
                            <p className="text-sm italic text-muted-foreground">
                                &ldquo;{invitation.personal_message}&rdquo;
                            </p>
                        </div>
                    )}
                </div>

                {user ? (
                    <Button
                        className="w-full"
                        onClick={handleAccept}
                        disabled={accepting}
                        aria-busy={accepting}
                    >
                        {accepting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                Joining…
                            </>
                        ) : (
                            <>
                                Accept & Join Organization
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <Button
                            className="w-full"
                            onClick={() => router.push(`/signup?invite=${token}`)}
                        >
                            Create Account & Join
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push(`/login?redirect=/invite/${token}`)}
                        >
                            Sign In & Join
                        </Button>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
