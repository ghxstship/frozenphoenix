"use client";

import React from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { hasPermission, isFieldVisible, maskSensitiveFields } from "@/config/rbac";
import type { PermissionLevel } from "@/types";
import { Lock, ShieldX } from "lucide-react";
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
    const { profile } = useAuth();
    return resolvePermissionLevel(profile);
}

export function useHasPermission(
    resource: string,
    action: "read" | "write" | "delete" | "manage"
): boolean {
    const level = usePermissionLevel();
    return hasPermission(level, resource, action);
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
    action?: "read" | "write" | "delete" | "manage";
    fallback?: React.ReactNode;
    silent?: boolean;
}

export function PermissionGate({
    children,
    resource,
    action = "read",
    fallback,
    silent = false,
}: PermissionGateProps) {
    const allowed = useHasPermission(resource, action);

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
    placeholder?: string;
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
