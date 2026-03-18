"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth";
import {
    AlertCircle,
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    Loader2,
    Mail,
    UserPlus,
} from "lucide-react";

interface InvitationDetails {
    id: string;
    invite_type: string;
    role: string | null;
    status: string;
    expires_at: string;
    inviter_name: string | null;
    organization_name: string | null;
}

function InviteContent() {
    const params = useParams<{ token: string }>();
    const router = useRouter();
    const token = params.token;

    const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInvitation = useCallback(async () => {
        try {
            const res = await fetch(`/api/invitations/${token}/details`);
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                if (res.status === 404) {
                    setError("This invitation was not found.");
                } else if (res.status === 410) {
                    setError(data?.error?.message ?? "This invitation is no longer valid.");
                } else {
                    setError("Unable to load invitation details.");
                }
                return;
            }
            const data = await res.json();
            setInvitation(data);
        } catch {
            setError("Unable to load invitation details. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchInvitation();
    }, [fetchInvitation]);

    if (loading) {
        return (
            <AuthLayout title="Loading invitation…" subtitle="Please wait">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" />
                </div>
            </AuthLayout>
        );
    }

    if (error) {
        return (
            <AuthLayout title="Invitation" subtitle="Something went wrong">
                <div className="space-y-4 py-4">
                    <div
                        className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                        role="alert"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {error}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" onClick={() => router.push("/signup")}>
                            Create an account
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Link
                            href="/login"
                            className="text-sm text-center text-muted-foreground hover:text-primary transition-colors"
                        >
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    if (!invitation) return null;

    const isExpired = new Date(invitation.expires_at) < new Date();
    const isOrgInvite = invitation.invite_type !== "referral";
    const expiresDate = new Date(invitation.expires_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    if (isExpired || invitation.status !== "pending") {
        return (
            <AuthLayout title="Invitation expired" subtitle="This invitation is no longer valid">
                <div className="space-y-4 py-4">
                    <div
                        className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm"
                        role="status"
                    >
                        <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {invitation.status === "accepted"
                            ? "This invitation has already been accepted."
                            : `This invitation expired on ${expiresDate}.`}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Contact the person who invited you to request a new invitation.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push("/login")}
                    >
                        Go to login
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    const roleLabel = invitation.role
        ? invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)
        : "Member";

    return (
        <AuthLayout
            title="You've been invited"
            subtitle={
                isOrgInvite && invitation.organization_name
                    ? `Join ${invitation.organization_name}`
                    : "Accept your invitation"
            }
        >
            <div className="space-y-6 py-2">
                <div className="space-y-3">
                    {isOrgInvite && invitation.organization_name && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                            <Building2
                                className="h-5 w-5 text-primary shrink-0"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="text-sm font-medium">
                                    {invitation.organization_name}
                                </p>
                                <p className="text-xs text-muted-foreground">Role: {roleLabel}</p>
                            </div>
                        </div>
                    )}

                    {invitation.inviter_name && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                            <Mail
                                className="h-5 w-5 text-muted-foreground shrink-0"
                                aria-hidden="true"
                            />
                            <p className="text-sm text-muted-foreground">
                                Invited by{" "}
                                <span className="font-medium text-foreground">
                                    {invitation.inviter_name}
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <Clock
                            className="h-5 w-5 text-muted-foreground shrink-0"
                            aria-hidden="true"
                        />
                        <p className="text-xs text-muted-foreground">Expires {expiresDate}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        className="w-full"
                        onClick={() =>
                            router.push(`/signup?invite_token=${encodeURIComponent(token)}`)
                        }
                    >
                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                        Create account &amp; accept
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">or</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            router.push(
                                `/login?redirect=${encodeURIComponent(`/api/invitations/${token}/accept`)}`
                            )
                        }
                    >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Sign in &amp; accept
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function InvitePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <InviteContent />
        </Suspense>
    );
}
