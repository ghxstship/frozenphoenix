"use client";

import { useState } from "react";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PERMISSION_MATRIX } from "@/config/rbac";
import {
    useDeletePermissionGrant,
    useRoleDefinitions,
    useUpsertPermissionGrant,
} from "@/lib/settings/hooks";
import { useAuth } from "@/lib/supabase/auth-context";
import { getStatusLabel } from "@/config/ui-variants";
import {
    CheckCircle2,
    Database,
    Eye,
    Loader2,
    Pencil,
    Settings,
    Shield,
    Trash2,
    Users,
    XCircle,
} from "lucide-react";

type RoleKey = keyof typeof PERMISSION_MATRIX;

const STATIC_ROLE_META: Record<RoleKey, { label: string; description: string; color: string }> = {
    exec: {
        label: "Executive",
        description: "Full platform access with manage-level permissions across all resources",
        color: "bg-primary/10 text-primary",
    },
    director: {
        label: "Director",
        description: "Cross-project oversight with broad read/write access and scoped management",
        color: "bg-primary/10 text-primary",
    },
    pm: {
        label: "Project Manager",
        description:
            "Read/write access to projects, tasks, crew, scheduling, and production resources",
        color: "bg-info/10 text-info",
    },
    member: {
        label: "Team Member",
        description:
            "Task execution access with time tracking, assigned work, and limited resources",
        color: "bg-info/10 text-info",
    },
    client: {
        label: "Client",
        description: "Read-only access to assigned projects, proposals, contracts, and approvals",
        color: "bg-success/10 text-success",
    },
    collaborator: {
        label: "Collaborator",
        description: "External partner access to assigned work orders, schedules, and documents",
        color: "bg-warning/10 text-warning",
    },
};

const ACTION_ICONS: Record<string, React.ElementType> = {
    read: Eye,
    write: Pencil,
    delete: Trash2,
    manage: Settings,
};

export function RolesPageClient() {
    const { activeOrg } = useAuth();
    const { data: dbRoles, isLoading: dbLoading } = useRoleDefinitions(activeOrg?.organization_id);
    const [selectedRoleKey, setSelectedRoleKey] = useState<string>("exec");
    const upsertGrant = useUpsertPermissionGrant();
    const deleteGrant = useDeletePermissionGrant();

    // Use DB roles if available, otherwise fall back to static PERMISSION_MATRIX
    const useDbRoles = dbRoles && dbRoles.length > 0;

    const staticRoleKeys = Object.keys(PERMISSION_MATRIX) as RoleKey[];

    // Build unified role list
    const roles = useDbRoles
        ? dbRoles.map((r) => ({
              key: r.key,
              label: r.label,
              description: r.description ?? "",
              color:
                  STATIC_ROLE_META[r.key as RoleKey]?.color ??
                  "bg-secondary/10 text-muted-foreground",
              permissionCount: r.permission_grants.length,
              isSystem: r.is_system,
              priority: r.priority,
          }))
        : staticRoleKeys.map((key) => ({
              key,
              label: STATIC_ROLE_META[key].label,
              description: STATIC_ROLE_META[key].description,
              color: STATIC_ROLE_META[key].color,
              permissionCount: PERMISSION_MATRIX[key].length,
              isSystem: true,
              priority: key === "exec" ? 100 : key === "pm" ? 75 : key === "client" ? 50 : 25,
          }));

    const selectedRole = roles.find((r) => r.key === selectedRoleKey) ?? roles[0];

    // Build permission matrix for selected role
    const selectedPermissions = useDbRoles
        ? (dbRoles.find((r) => r.key === selectedRoleKey)?.permission_grants ?? []).map((g) => ({
              resource: g.resource,
              actions: [g.action] as string[],
          }))
        : (PERMISSION_MATRIX[selectedRoleKey as RoleKey] ?? []).map((p) => ({
              resource: p.resource,
              actions: [...p.actions],
          }));

    // Merge duplicate resource entries
    const permsByResource = new Map<string, Set<string>>();
    for (const p of selectedPermissions) {
        const existing = permsByResource.get(p.resource) ?? new Set();
        for (const a of p.actions) existing.add(a);
        permsByResource.set(p.resource, existing);
    }

    const allResources = useDbRoles
        ? [...new Set(dbRoles.flatMap((r) => r.permission_grants.map((g) => g.resource)))].sort()
        : [
              ...new Set(
                  Object.values(PERMISSION_MATRIX).flatMap((perms) => perms.map((p) => p.resource))
              ),
          ].sort();

    const totalPermissions = useDbRoles
        ? dbRoles.reduce((sum, r) => sum + r.permission_grants.length, 0)
        : Object.values(PERMISSION_MATRIX).flatMap((p) => p).length;

    const contentSlot = (
        <div className="density-gap-page">
            {dbLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 density-gap-card">
                        <StatCard title="Roles Defined" value={roles.length} icon={Shield} />
                        <StatCard
                            title="Resources"
                            value={allResources.length}
                            icon={CheckCircle2}
                        />
                        <StatCard
                            title="Permission Rules"
                            value={totalPermissions}
                            icon={Settings}
                        />
                        <StatCard
                            title="System Roles"
                            value={roles.filter((r) => r.isSystem).length}
                            icon={Users}
                        />
                    </div>

                    {/* Role Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 density-gap-card">
                        {roles
                            .sort((a, b) => b.priority - a.priority)
                            .map((role) => {
                                const isSelected = selectedRoleKey === role.key;
                                return (
                                    <Card
                                        key={role.key}
                                        className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary border-primary" : ""}`}
                                        onClick={() => setSelectedRoleKey(role.key)}
                                    >
                                        <CardContent className="py-4">
                                            <div
                                                className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${role.color}`}
                                            >
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold">
                                                    {role.label}
                                                </h3>
                                                {role.isSystem && (
                                                    <Badge
                                                        variant="ghost"
                                                        className="density-caption"
                                                    >
                                                        system
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {role.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <Badge variant="ghost">
                                                    {role.permissionCount} permissions
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>

                    {/* Permission Matrix */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Permission Matrix — {selectedRole?.label ?? selectedRoleKey}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                                                Resource
                                            </th>
                                            <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                                                Read
                                            </th>
                                            <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                                                Write
                                            </th>
                                            <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                                                Delete
                                            </th>
                                            <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                                                Manage
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allResources.map((resource) => {
                                            const actions =
                                                permsByResource.get(resource) ?? new Set();
                                            // Wildcard expansion: if role has *, show all actions
                                            const hasWildcard = permsByResource.has("*");
                                            return (
                                                <tr
                                                    key={resource}
                                                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                                                >
                                                    <td className="py-2.5 pr-4">
                                                        <span className="font-medium text-xs">
                                                            {getStatusLabel(resource)}
                                                        </span>
                                                    </td>
                                                    {(
                                                        [
                                                            "read",
                                                            "write",
                                                            "delete",
                                                            "manage",
                                                        ] as const
                                                    ).map((action) => {
                                                        const has =
                                                            hasWildcard || actions.has(action);
                                                        return (
                                                            <td
                                                                key={action}
                                                                className="text-center py-2.5 px-3"
                                                            >
                                                                {useDbRoles ? (
                                                                    <button
                                                                        type="button"
                                                                        className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-secondary/50 transition-colors disabled:opacity-50"
                                                                        disabled={
                                                                            upsertGrant.isPending ||
                                                                            deleteGrant.isPending
                                                                        }
                                                                        onClick={() => {
                                                                            const dbRole =
                                                                                dbRoles.find(
                                                                                    (r) =>
                                                                                        r.key ===
                                                                                        selectedRoleKey
                                                                                );
                                                                            if (!dbRole) return;
                                                                            const grant =
                                                                                dbRole.permission_grants.find(
                                                                                    (g) =>
                                                                                        g.resource ===
                                                                                            resource &&
                                                                                        g.action ===
                                                                                            action
                                                                                );
                                                                            if (grant) {
                                                                                deleteGrant.mutate(
                                                                                    grant.id
                                                                                );
                                                                            } else {
                                                                                upsertGrant.mutate({
                                                                                    role_definition_id:
                                                                                        dbRole.id,
                                                                                    resource,
                                                                                    action,
                                                                                });
                                                                            }
                                                                        }}
                                                                        title={
                                                                            has
                                                                                ? `Revoke ${action} on ${resource}`
                                                                                : `Grant ${action} on ${resource}`
                                                                        }
                                                                    >
                                                                        {has ? (
                                                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                                                        ) : (
                                                                            <XCircle className="h-4 w-4 text-muted-foreground/30" />
                                                                        )}
                                                                    </button>
                                                                ) : has ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-success inline-block" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-muted-foreground/30 inline-block" />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legend */}
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center density-gap-card text-xs text-muted-foreground flex-wrap">
                                <span className="font-medium">Permission Actions:</span>
                                {Object.entries(ACTION_ICONS).map(([action, Icon]) => (
                                    <span key={action} className="flex items-center gap-1">
                                        <Icon className="h-3 w-3" />
                                        <span className="capitalize">{action}</span>
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );

    const config: DashboardPageConfig = {
        resource: "settings",
        action: "read",
        title: "Role & Permission Management",
        description: "Configure role-based access control across all platform resources",
        headerActions: (
            <div className="flex items-center gap-2">
                {useDbRoles && (
                    <Badge variant="success" className="gap-1">
                        <Database className="h-3 w-3" />
                        DB-Backed
                    </Badge>
                )}
                <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Audit Log
                </Button>
            </div>
        ),
        contentSlot,
    };

    return <OperationalDashboardShell config={config} />;
}
