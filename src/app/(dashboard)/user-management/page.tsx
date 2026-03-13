"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useMemo, useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_USER_INVITE_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/data-view/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PERMISSION_LEVEL_MAP } from "@/config/domain-config";
import { Clock, Shield, UserCheck, UserPlus, Users, UserX } from "lucide-react";
import type { PermissionLevel, UserLifecycleStatus } from "@/types";
import type { UserDirectoryEntry } from "@/types/user-lifecycle";
import { useUserDirectory } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const LIFECYCLE_FILTERS: { value: UserLifecycleStatus | "all"; label: string }[] = [
    { value: "all", label: "All Users" },
    { value: "active", label: "Active" },
    { value: "onboarding", label: "Onboarding" },
    { value: "suspended", label: "Suspended" },
    { value: "deactivated", label: "Deactivated" },
    { value: "pending_deletion", label: "Pending Deletion" },
];

const ROLE_FILTERS: { value: PermissionLevel | "all"; label: string }[] = [
    { value: "all", label: "All Roles" },
    { value: "exec", label: "Executive" },
    { value: "director", label: "Director" },
    { value: "pm", label: "Project Manager" },
    { value: "member", label: "Team Member" },
    { value: "client", label: "Client" },
    { value: "collaborator", label: "Collaborator" },
];

function formatRelativeTime(dateStr?: string): string {
    if (!dateStr) return "Never";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function UserManagementPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<UserLifecycleStatus | "all">("all");
    const [roleFilter, setRoleFilter] = useState<PermissionLevel | "all">("all");

    const { data: sbUsers, isLoading } = useUserDirectory();

    const users: UserDirectoryEntry[] = (sbUsers ?? []).map((u: Record<string, unknown>) => ({
        id: (u.id as string) ?? "",
        displayName: (u.display_name as string) ?? (u.full_name as string) ?? "",
        email: (u.email as string) ?? "",
        avatarUrl: (u.avatar_url as string) ?? undefined,
        jobTitle: (u.job_title as string) ?? undefined,
        lifecycleStatus: ((u.lifecycle_status as string) ?? "active") as UserLifecycleStatus,
        role: ((u.role as string) ?? "vendor") as PermissionLevel,
        organizationName: (u.organization_name as string) ?? "",
        lastActiveAt: (u.last_active_at as string) ?? undefined,
        onboardingCompletedAt: (u.onboarding_completed_at as string) ?? undefined,
        createdAt: (u.created_at as string) ?? "",
    }));

    const filtered = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                !search ||
                u.displayName.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || u.lifecycleStatus === statusFilter;
            const matchesRole = roleFilter === "all" || u.role === roleFilter;
            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [users, search, statusFilter, roleFilter]);

    const activeCount = users.filter((u) => u.lifecycleStatus === "active").length;
    const onboardingCount = users.filter((u) => u.lifecycleStatus === "onboarding").length;
    const suspendedCount = users.filter((u) => u.lifecycleStatus === "suspended").length;
    const deactivatedCount = users.filter(
        (u) => u.lifecycleStatus === "deactivated" || u.lifecycleStatus === "pending_deletion"
    ).length;

    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <PermissionGate resource="user_management" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="User Management"
                    description="Manage users, roles, and access across your organization"
                >
                    <Button onClick={openCreate}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite User
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Active Users" value={activeCount} icon={UserCheck} />
                    <StatCard title="Onboarding" value={onboardingCount} icon={Clock} />
                    <StatCard title="Suspended" value={suspendedCount} icon={Shield} />
                    <StatCard title="Deactivated" value={deactivatedCount} icon={UserX} />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <SearchInput
                                value={search}
                                onValueChange={setSearch}
                                placeholder="Search users by name or email..."
                                className="flex-1"
                            />
                            <div className="flex gap-2 flex-wrap">
                                {LIFECYCLE_FILTERS.map((f) => (
                                    <Button
                                        key={f.value}
                                        variant={statusFilter === f.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setStatusFilter(f.value)}
                                    >
                                        {f.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4 flex-wrap">
                            {ROLE_FILTERS.map((f) => (
                                <Button
                                    key={f.value}
                                    variant={roleFilter === f.value ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setRoleFilter(f.value)}
                                >
                                    {f.label}
                                </Button>
                            ))}
                        </div>

                        <DataTable
                            data={filtered}
                            keyField="id"
                            columns={[
                                {
                                    id: "displayName",
                                    header: "User",
                                    accessorKey: "displayName",
                                    sortable: true,
                                    render: (_value, row) => (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">
                                                {row.displayName
                                                    .split(" ")
                                                    .map((n: string) => n[0])
                                                    .join("")}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {row.displayName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {row.email}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    id: "jobTitle",
                                    header: "Title",
                                    accessorKey: "jobTitle",
                                    sortable: true,
                                    render: (_value, row) => (
                                        <span className="text-sm text-muted-foreground">
                                            {row.jobTitle || "—"}
                                        </span>
                                    ),
                                },
                                {
                                    id: "role",
                                    header: "Role",
                                    accessorKey: "role",
                                    sortable: true,
                                    render: (_value, row) => {
                                        const config =
                                            PERMISSION_LEVEL_MAP[row.role as PermissionLevel];
                                        return config ? (
                                            <Badge variant={config.variant}>{config.label}</Badge>
                                        ) : (
                                            <Badge variant="ghost">{row.role}</Badge>
                                        );
                                    },
                                },
                                {
                                    id: "lifecycleStatus",
                                    header: "Status",
                                    accessorKey: "lifecycleStatus",
                                    sortable: true,
                                    render: (_value, row) => (
                                        <StatusBadge status={row.lifecycleStatus} />
                                    ),
                                },
                                {
                                    id: "lastActiveAt",
                                    header: "Last Active",
                                    accessorKey: "lastActiveAt",
                                    sortable: true,
                                    render: (_value, row) => (
                                        <span className="text-xs text-muted-foreground">
                                            {formatRelativeTime(row.lastActiveAt)}
                                        </span>
                                    ),
                                },
                                {
                                    id: "createdAt",
                                    header: "Joined",
                                    accessorKey: "createdAt",
                                    sortable: true,
                                    render: (_value, row) => (
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(row.createdAt).toLocaleDateString()}
                                        </span>
                                    ),
                                },
                            ]}
                            searchable={false}
                        />

                        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {filtered.length} of {users.length} users
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CreateEntityDialog
                config={CREATE_USER_INVITE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
