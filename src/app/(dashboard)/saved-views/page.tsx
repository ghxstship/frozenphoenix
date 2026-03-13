"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import {
    Columns,
    Copy,
    Filter,
    Globe,
    LayoutList,
    Lock,
    Pencil,
    Plus,
    SortAsc,
    Star,
    Trash2,
    Users,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { LoadingState } from "@/components/layouts/loading-state";
import { useSavedViews } from "@/lib/supabase/hooks-productive";

type ViewVisibility = "private" | "team" | "organization";

interface ViewItem {
    id: string;
    name: string;
    description: string;
    entityType: string;
    viewType: string;
    visibility: ViewVisibility;
    owner: string;
    filterCount: number;
    sortCount: number;
    columnCount: number;
    starred: boolean;
}

const VISIBILITY_CONFIG: Record<
    ViewVisibility,
    { label: string; icon: React.ElementType; variant: "ghost" | "info" | "success" }
> = {
    private: { label: "Private", icon: Lock, variant: "ghost" },
    team: { label: "Team", icon: Users, variant: "info" },
    organization: { label: "Organization", icon: Globe, variant: "success" },
};

function jsonArrayLength(val: unknown): number {
    return Array.isArray(val) ? val.length : 0;
}

function deriveVisibility(row: Record<string, unknown>): ViewVisibility {
    if (
        row.is_shared &&
        Array.isArray(row.shared_with_team_ids) &&
        row.shared_with_team_ids.length > 0
    )
        return "team";
    if (row.is_shared) return "organization";
    return "private";
}

export default function SavedViewsPage() {
    const [search, setSearch] = useState("");
    const VIS_FILTERS = ["all", "private", "team", "organization"] as const;
    const [visFilter, setVisFilter] = useQueryTabState({
        key: "visibility",
        defaultValue: "all",
        validValues: VIS_FILTERS,
    });
    const { data: sbViews, isLoading } = useSavedViews();

    if (isLoading) return <LoadingState />;

    const views: ViewItem[] = (sbViews ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        description: (row.description as string) ?? "",
        entityType: (row.entity_type as string) ?? "",
        viewType: (row.view_type as string) ?? "list",
        visibility: deriveVisibility(row),
        owner:
            (((row as Record<string, unknown>).profiles as Record<string, unknown>)
                ?.name as string) ?? "Unknown",
        filterCount: jsonArrayLength(row.filters),
        sortCount: jsonArrayLength(row.sort_by),
        columnCount: Array.isArray(row.visible_columns) ? row.visible_columns.length : 0,
        starred: (row.is_default as boolean) ?? false,
    }));

    const filtered = views.filter((v) => {
        if (visFilter !== "all" && v.visibility !== visFilter) return false;
        if (
            search &&
            !v.name.toLowerCase().includes(search.toLowerCase()) &&
            !v.entityType.toLowerCase().includes(search.toLowerCase())
        )
            return false;
        return true;
    });

    const starred = filtered.filter((v) => v.starred);
    const unstarred = filtered.filter((v) => !v.starred);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Saved Views"
                description="Manage custom filtered, sorted, and grouped views shared across your team"
            >
                <Button onClick={() => void 0}>
                    <Plus className="mr-2 h-4 w-4" /> New View
                </Button>
            </PageHeader>

            <div className="flex items-center gap-4">
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search views..."
                    className="flex-1 max-w-sm"
                />
                <SegmentedControl
                    ariaLabel="View visibility filter"
                    value={visFilter}
                    onValueChange={(v) => setVisFilter(v as (typeof VIS_FILTERS)[number])}
                    size="sm"
                    options={[
                        { value: "all", label: "All" },
                        { value: "private", label: "Private" },
                        { value: "team", label: "Team" },
                        { value: "organization", label: "Organization" },
                    ]}
                />
            </div>

            {/* Starred Views */}
            {starred.length > 0 && (
                <div className="space-y-2">
                    <OverlineText as="h3" className="flex items-center gap-1">
                        <Star className="h-3 w-3" /> Starred
                    </OverlineText>
                    {starred.map((v) => (
                        <ViewCard key={v.id} view={v} />
                    ))}
                </div>
            )}

            {/* All Views */}
            <div className="space-y-2">
                {starred.length > 0 && <OverlineText as="h3">All Views</OverlineText>}
                {unstarred.map((v) => (
                    <ViewCard key={v.id} view={v} />
                ))}
            </div>
        </div>
    );
}

const VIEW_TYPE_LABELS: Record<string, string> = {
    list: "List",
    board: "Board",
    table: "Table",
    calendar: "Calendar",
    timeline: "Timeline",
    gantt: "Gantt",
};

function ViewCard({ view }: { view: ViewItem }) {
    const VisIcon = VISIBILITY_CONFIG[view.visibility].icon;

    return (
        <PermissionGate resource="saved_views" action="read">
            <Card className="hover:bg-secondary/30 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <LayoutList className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {view.starred && (
                                <Star className="h-3 w-3 text-star-rating fill-star-rating" />
                            )}
                            <p className="text-sm font-semibold">{view.name}</p>
                            <Badge
                                variant={VISIBILITY_CONFIG[view.visibility].variant}
                                className="text-[10px] gap-0.5"
                            >
                                <VisIcon className="h-2.5 w-2.5" />
                                {VISIBILITY_CONFIG[view.visibility].label}
                            </Badge>
                            <Badge variant="ghost" className="text-[10px]">
                                {VIEW_TYPE_LABELS[view.viewType] ?? view.viewType}
                            </Badge>
                            <Badge variant="ghost" className="text-[10px]">
                                {view.entityType}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {view.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                            {view.filterCount > 0 && (
                                <span className="flex items-center gap-0.5">
                                    <Filter className="h-2.5 w-2.5" /> {view.filterCount} filters
                                </span>
                            )}
                            {view.sortCount > 0 && (
                                <span className="flex items-center gap-0.5">
                                    <SortAsc className="h-2.5 w-2.5" /> {view.sortCount} sorts
                                </span>
                            )}
                            <span className="flex items-center gap-0.5">
                                <Columns className="h-2.5 w-2.5" /> {view.columnCount} columns
                            </span>
                            <span>by {view.owner}</span>
                        </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => void 0}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => void 0}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => void 0}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </PermissionGate>
    );
}
