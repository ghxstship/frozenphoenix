"use client";

import React from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { hasPermission, isFieldVisible, maskSensitiveFields } from "@/config/rbac";
import type { PermissionLevel } from "@/types";
import { Loader2, Lock, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_LEVEL: PermissionLevel = "collaborator";

function resolvePermissionLevel(profile: { role?: string | null } | null): PermissionLevel {
    if (!profile?.role) return DEFAULT_LEVEL;
    const { role } = profile;
    if (
        role === "exec" ||
        role === "director" ||
        role === "pm" ||
        role === "member" ||
        role === "client" ||
        role === "collaborator"
    ) {
        return role;
    }
    return DEFAULT_LEVEL;
}

export function usePermissionLevel(): PermissionLevel {
    const { activeOrg, loading } = useAuth();
    // While auth is still hydrating, return DEFAULT_LEVEL.
    // Callers that need to distinguish "loading" from "resolved" should
    // check useAuth().loading directly (e.g. PermissionGate does this).
    if (loading) return DEFAULT_LEVEL;
    // Canonical role comes from the active org membership (org_memberships table).
    // user_profiles has no role column — without an activeOrg, fall back to DEFAULT_LEVEL.
    if (activeOrg?.role) {
        return resolvePermissionLevel({ role: activeOrg.role });
    }
    return DEFAULT_LEVEL;
}

export function useHasPermission(
    resource: string,
    action: "read" | "write" | "delete" | "manage"
): boolean {
    const { loading } = useAuth();
    const level = usePermissionLevel();
    // While auth is hydrating, optimistically allow — PermissionGate
    // handles the loading state visually so Access Denied never flashes.
    if (loading) return true;
    return hasPermission(level, resource, action);
}

export function useIsOwner(): boolean {
    const { isOwner } = useAuth();
    return isOwner;
}

export function useFieldVisible(fieldName: string): boolean {
    const level = usePermissionLevel();
    return isFieldVisible(level, fieldName);
}

export function useMaskFields<T extends Record<string, unknown>>(data: T): T {
    const level = usePermissionLevel();
    return maskSensitiveFields(data, level);
}

interface PermissionGateProps {
    children: React.ReactNode;
    resource: string;
    action?: "read" | "write" | "delete" | "manage" | undefined;
    fallback?: React.ReactNode | undefined;
    silent?: boolean | undefined;
}

export function PermissionGate({
    children,
    resource,
    action = "read",
    fallback,
    silent = false,
}: PermissionGateProps) {
    const { loading } = useAuth();
    const allowed = useHasPermission(resource, action);

    // While auth is hydrating (session + memberships loading), show a
    // non-destructive loading state instead of flashing Access Denied.
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh] p-6">
                <Loader2
                    className="h-6 w-6 motion-safe:animate-spin text-muted-foreground"
                    aria-label="Loading"
                />
            </div>
        );
    }

    if (allowed) return <>{children}</>;

    if (fallback) return <>{fallback}</>;

    if (silent) return null;

    return (
        <div className="flex items-center justify-center min-h-[40vh] p-6">
            <Card className="max-w-md w-full border-destructive/20">
                <CardContent className="py-8">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                            <ShieldX className="h-7 w-7 text-destructive" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Access Denied</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                You do not have permission to access this resource. Contact your
                                administrator if you believe this is an error.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

interface FieldGuardProps {
    children: React.ReactNode;
    field: string;
    placeholder?: string | undefined;
}

interface OwnerGateProps {
    children: React.ReactNode;
    fallback?: React.ReactNode | undefined;
    silent?: boolean | undefined;
}

export function OwnerGate({ children, fallback, silent = false }: OwnerGateProps) {
    const { loading } = useAuth();
    const owner = useIsOwner();

    // While auth is hydrating, show a non-destructive loading state
    // instead of flashing "Owner Access Required".
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh] p-6">
                <Loader2
                    className="h-6 w-6 motion-safe:animate-spin text-muted-foreground"
                    aria-label="Loading"
                />
            </div>
        );
    }

    if (owner) return <>{children}</>;

    if (fallback) return <>{fallback}</>;

    if (silent) return null;

    return (
        <div className="flex items-center justify-center min-h-[40vh] p-6">
            <Card className="max-w-md w-full border-destructive/20">
                <CardContent className="py-8">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                            <ShieldX className="h-7 w-7 text-destructive" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Owner Access Required</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                This section is restricted to the organization owner. Contact your
                                organization owner if you need access.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function FieldGuard({ children, field, placeholder = "••••" }: FieldGuardProps) {
    const visible = useFieldVisible(field);
    if (visible) return <>{children}</>;
    return (
        <span className="inline-flex items-center gap-1 text-muted-foreground" title="Restricted">
            <Lock className="h-3 w-3" />
            {placeholder}
        </span>
    );
}
