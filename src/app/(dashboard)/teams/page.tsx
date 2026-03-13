"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import {
    useAddTeamMember,
    useRemoveTeamMember,
    useTeamMembersPage,
    useTeams,
} from "@/lib/supabase/hooks-pages";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { StaggerItem } from "@/components/ui/stagger-container";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { PermissionGate } from "@/components/permission-guard";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_TEAM_CONFIG } from "@/config/create-entity-configs";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import {
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    Plus,
    Shield,
    Table2,
    Trash2,
    UserPlus,
    Users,
    UsersRound,
} from "lucide-react";

type ViewMode = "cards" | "table";

interface TeamRow {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    avatar_url: string | null;
    is_default: boolean;
    created_at: string;
    user_profiles?: { display_name: string } | null;
}

const teamColumns: ColumnDef<TeamRow>[] = [
    {
        id: "name",
        header: "Team",
        accessorKey: "name",
        sortable: true,
        filterable: true,
        sticky: true,
        render: (_v, row) => (
            <div className="flex items-center gap-2">
                <Avatar name={row.name} size="sm" />
                <div>
                    <p className="text-sm font-medium">{row.name}</p>
                    <p className="text-[10px] text-muted-foreground">{row.slug}</p>
                </div>
            </div>
        ),
    },
    {
        id: "description",
        header: "Description",
        accessorKey: "description",
        render: (value) => (
            <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
                {String(value || "—")}
            </span>
        ),
    },
    {
        id: "is_default",
        header: "Type",
        accessorKey: "is_default",
        sortable: true,
        render: (value) =>
            value ? (
                <Badge variant="info" className="text-[10px]">
                    Default
                </Badge>
            ) : (
                <Badge variant="ghost" className="text-[10px]">
                    Custom
                </Badge>
            ),
    },
    {
        id: "created_by",
        header: "Created By",
        accessorFn: (row) => row.user_profiles?.display_name ?? "—",
    },
    {
        id: "created_at",
        header: "Created",
        accessorKey: "created_at",
        sortable: true,
        render: (value) => (
            <span className="text-xs text-muted-foreground">
                {new Date(String(value)).toLocaleDateString()}
            </span>
        ),
    },
];

interface TeamMemberRow {
    id: string;
    user_id: string;
    role: string | null;
    display_name?: string;
    email?: string;
}

function TeamMemberPanel({ teamId }: { teamId: string }) {
    const { data: members, isLoading } = useTeamMembersPage(teamId);
    const addMember = useAddTeamMember();
    const removeMember = useRemoveTeamMember();
    const [newUserId, setNewUserId] = useState("");
    const [newRole, setNewRole] = useState("");

    const memberRows: TeamMemberRow[] = (members ?? []).map((m: Record<string, unknown>) => ({
        id: (m.id as string) ?? "",
        user_id: (m.user_id as string) ?? "",
        role: (m.role as string) ?? null,
        display_name: (m.user_profiles as Record<string, unknown> | null)?.display_name as
            | string
            | undefined,
        email: (m.user_profiles as Record<string, unknown> | null)?.email as string | undefined,
    }));

    return (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Members ({memberRows.length})
            </p>
            {isLoading ? (
                <p className="text-xs text-muted-foreground">Loading members…</p>
            ) : memberRows.length === 0 ? (
                <p className="text-xs text-muted-foreground">No members yet</p>
            ) : (
                <ul className="space-y-1">
                    {memberRows.map((m) => (
                        <li
                            key={m.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-secondary/30"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Avatar name={m.display_name ?? m.user_id} size="sm" />
                                <span className="truncate">
                                    {m.display_name ?? m.email ?? m.user_id}
                                </span>
                                {m.role && (
                                    <Badge variant="ghost" className="text-[8px]">
                                        {m.role}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                title="Remove member"
                                disabled={removeMember.isPending}
                                onClick={() =>
                                    removeMember.mutate({
                                        teamId,
                                        memberId: m.id,
                                    })
                                }
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
            <form
                className="flex gap-1.5 pt-1"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!newUserId.trim()) return;
                    addMember.mutate(
                        {
                            teamId,
                            user_id: newUserId.trim(),
                            ...(newRole ? { role: newRole } : {}),
                        },
                        {
                            onSuccess: () => {
                                setNewUserId("");
                                setNewRole("");
                            },
                        }
                    );
                }}
            >
                <input
                    type="text"
                    className="h-7 flex-1 rounded border border-input bg-background px-2 text-xs placeholder:text-muted-foreground"
                    placeholder="User ID"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                />
                <input
                    type="text"
                    className="h-7 w-20 rounded border border-input bg-background px-2 text-xs placeholder:text-muted-foreground"
                    placeholder="Role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                />
                <Button
                    type="submit"
                    size="sm"
                    className="h-7"
                    disabled={addMember.isPending || !newUserId.trim()}
                >
                    <UserPlus className="h-3 w-3" />
                </Button>
            </form>
        </div>
    );
}

export default function TeamsPage() {
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id ?? null;
    const { data: teams, isLoading } = useTeams(orgId);
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
    const [createOpen, openCreate, closeCreate] = useCreateAction();

    const VIEW_MODES = ["cards", "table"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "cards",
        validValues: VIEW_MODES,
    });

    const teamRows: TeamRow[] = (teams ?? []).map((t: Record<string, unknown>) => ({
        id: t.id as string,
        name: t.name as string,
        slug: t.slug as string,
        description: t.description as string | null,
        avatar_url: t.avatar_url as string | null,
        is_default: t.is_default as boolean,
        created_at: t.created_at as string,
        user_profiles: t.user_profiles as { display_name: string } | null,
    }));

    const defaultTeams = teamRows.filter((t) => t.is_default);
    const customTeams = teamRows.filter((t) => !t.is_default);

    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <>
            <PermissionGate resource="teams" action="read">
                <div className="space-y-6 animate-fade-in">
                    <PageHeader
                        title="Teams"
                        description="Manage organizational teams and membership"
                    >
                        <div className="flex items-center gap-2">
                            <SegmentedControl<ViewMode>
                                ariaLabel="Team view mode"
                                value={viewMode}
                                onValueChange={setViewMode}
                                options={[
                                    {
                                        value: "cards",
                                        label: "Cards",
                                        icon: <LayoutGrid className="h-4 w-4" />,
                                        labelHidden: true,
                                    },
                                    {
                                        value: "table",
                                        label: "Table",
                                        icon: <Table2 className="h-4 w-4" />,
                                        labelHidden: true,
                                    },
                                ]}
                            />
                            <PermissionGate resource="teams" action="write" fallback={null}>
                                <Button size="sm" onClick={openCreate}>
                                    <Plus className="h-4 w-4" />
                                    New Team
                                </Button>
                            </PermissionGate>
                        </div>
                    </PageHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard title="Total Teams" value={teamRows.length} icon={UsersRound} />
                        <StatCard title="Default Teams" value={defaultTeams.length} icon={Shield} />
                        <StatCard title="Custom Teams" value={customTeams.length} icon={Users} />
                    </div>

                    {viewMode === "table" && (
                        <DataTable<TeamRow>
                            data={teamRows}
                            columns={teamColumns}
                            keyField="id"
                            searchable
                            searchPlaceholder="Search teams..."
                            pageSize={15}
                            hoverable
                        />
                    )}

                    {viewMode === "cards" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teamRows.map((team, i) => (
                                <StaggerItem key={team.id} index={i} stagger="relaxed">
                                    <Card>
                                        <CardContent>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={team.name} size="lg" />
                                                    <div>
                                                        <h3 className="text-sm font-bold">
                                                            {team.name}
                                                        </h3>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {team.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                                {team.is_default ? (
                                                    <Badge variant="info" className="text-[10px]">
                                                        Default
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="ghost" className="text-[10px]">
                                                        Custom
                                                    </Badge>
                                                )}
                                            </div>

                                            {team.description && (
                                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                                    {team.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                                                <span>
                                                    Created{" "}
                                                    {new Date(team.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {team.user_profiles?.display_name && (
                                                        <span>
                                                            by {team.user_profiles.display_name}
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 w-5 p-0"
                                                        title={
                                                            expandedTeamId === team.id
                                                                ? "Collapse members"
                                                                : "Show members"
                                                        }
                                                        onClick={() =>
                                                            setExpandedTeamId(
                                                                expandedTeamId === team.id
                                                                    ? null
                                                                    : team.id
                                                            )
                                                        }
                                                    >
                                                        {expandedTeamId === team.id ? (
                                                            <ChevronUp className="h-3 w-3" />
                                                        ) : (
                                                            <ChevronDown className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            {expandedTeamId === team.id && (
                                                <TeamMemberPanel teamId={team.id} />
                                            )}
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            ))}

                            {teamRows.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    <UsersRound className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">No teams yet</p>
                                    <p className="text-xs mt-1">
                                        Create your first team to organize members
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </PermissionGate>
            <CreateEntityDialog
                config={CREATE_TEAM_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );
}
