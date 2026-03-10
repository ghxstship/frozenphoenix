"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { useTeams } from "@/lib/supabase/hooks-pages";
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
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import {
    LayoutGrid,
    Loader2,
    Plus,
    Shield,
    Table2,
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

export default function TeamsPage() {
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id ?? null;
    const { data: teams, isLoading } = useTeams(orgId);

    const VIEW_MODES = ["cards", "table"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "cards",
        validValues: VIEW_MODES,
    });

    const teamRows: TeamRow[] = (teams ?? []).map(
        (t: Record<string, unknown>) => ({
            id: t.id as string,
            name: t.name as string,
            slug: t.slug as string,
            description: t.description as string | null,
            avatar_url: t.avatar_url as string | null,
            is_default: t.is_default as boolean,
            created_at: t.created_at as string,
            user_profiles: t.user_profiles as { display_name: string } | null,
        })
    );

    const defaultTeams = teamRows.filter((t) => t.is_default);
    const customTeams = teamRows.filter((t) => !t.is_default);

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    return (
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
                            <Button size="sm">
                                <Plus className="h-4 w-4" />
                                New Team
                            </Button>
                        </PermissionGate>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Teams"
                        value={teamRows.length}
                        icon={UsersRound}
                    />
                    <StatCard
                        title="Default Teams"
                        value={defaultTeams.length}
                        icon={Shield}
                    />
                    <StatCard
                        title="Custom Teams"
                        value={customTeams.length}
                        icon={Users}
                    />
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
                                                <Badge
                                                    variant="info"
                                                    className="text-[10px]"
                                                >
                                                    Default
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="ghost"
                                                    className="text-[10px]"
                                                >
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
                                                {new Date(
                                                    team.created_at
                                                ).toLocaleDateString()}
                                            </span>
                                            {team.user_profiles?.display_name && (
                                                <span>
                                                    by {team.user_profiles.display_name}
                                                </span>
                                            )}
                                        </div>
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
    );
}
