"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import {
    LayoutList, Plus, Eye, Star,
    Users, Lock, Globe, Pencil, Copy, Trash2,
    Filter, SortAsc, Columns,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

type ViewType = "list" | "board" | "table" | "calendar" | "timeline" | "gantt";
type ViewVisibility = "private" | "team" | "organization";

interface SavedView {
    id: string;
    name: string;
    description: string;
    entityType: string;
    viewType: ViewType;
    visibility: ViewVisibility;
    owner: string;
    filterCount: number;
    sortCount: number;
    columnCount: number;
    starred: boolean;
    usageCount: number;
    lastUsed: string;
    createdAt: string;
}

const VISIBILITY_CONFIG: Record<ViewVisibility, { label: string; icon: React.ElementType; variant: "ghost" | "info" | "success" }> = {
    private: { label: "Private", icon: Lock, variant: "ghost" },
    team: { label: "Team", icon: Users, variant: "info" },
    organization: { label: "Organization", icon: Globe, variant: "success" },
};

const mockViews: SavedView[] = [
    { id: "1", name: "My Active Tasks", description: "Tasks assigned to me, filtered by in-progress status", entityType: "Tasks", viewType: "board", visibility: "private", owner: "Sarah Chen", filterCount: 3, sortCount: 1, columnCount: 6, starred: true, usageCount: 142, lastUsed: "2026-02-25", createdAt: "2026-01-10" },
    { id: "2", name: "Project Profitability Overview", description: "All projects with budget vs actual comparison", entityType: "Projects", viewType: "table", visibility: "organization", owner: "Mike Johnson", filterCount: 2, sortCount: 2, columnCount: 12, starred: true, usageCount: 89, lastUsed: "2026-02-24", createdAt: "2025-12-15" },
    { id: "3", name: "Open Deals by Stage", description: "Pipeline deals grouped by stage with probability", entityType: "Deals", viewType: "board", visibility: "team", owner: "Lisa Wang", filterCount: 1, sortCount: 1, columnCount: 8, starred: false, usageCount: 67, lastUsed: "2026-02-23", createdAt: "2026-01-20" },
    { id: "4", name: "Team Schedule — Next 2 Weeks", description: "Resource bookings for all team members", entityType: "Bookings", viewType: "timeline", visibility: "team", owner: "David Kim", filterCount: 2, sortCount: 0, columnCount: 5, starred: false, usageCount: 45, lastUsed: "2026-02-25", createdAt: "2026-02-01" },
    { id: "5", name: "Overdue Invoices", description: "Client invoices past due date, sorted by amount", entityType: "Invoices", viewType: "list", visibility: "organization", owner: "Sarah Chen", filterCount: 2, sortCount: 1, columnCount: 7, starred: true, usageCount: 38, lastUsed: "2026-02-25", createdAt: "2026-01-25" },
    { id: "6", name: "Crew Availability Calendar", description: "All crew members with time-off and bookings", entityType: "Crew", viewType: "calendar", visibility: "team", owner: "Tom Harris", filterCount: 0, sortCount: 0, columnCount: 4, starred: false, usageCount: 52, lastUsed: "2026-02-24", createdAt: "2026-01-05" },
    { id: "7", name: "Production Timeline — Q1", description: "Gantt view of all Q1 production milestones", entityType: "Projects", viewType: "gantt", visibility: "organization", owner: "Mike Johnson", filterCount: 3, sortCount: 1, columnCount: 9, starred: false, usageCount: 31, lastUsed: "2026-02-20", createdAt: "2025-12-20" },
    { id: "8", name: "Expense Approvals Queue", description: "Pending expenses awaiting my approval", entityType: "Expenses", viewType: "list", visibility: "private", owner: "Mike Johnson", filterCount: 2, sortCount: 1, columnCount: 6, starred: false, usageCount: 24, lastUsed: "2026-02-22", createdAt: "2026-02-05" },
];

export default function SavedViewsPage() {
    const [search, setSearch] = useState("");
    const [visFilter, setVisFilter] = useState<"all" | ViewVisibility>("all");

    const filtered = mockViews.filter((v) => {
        if (visFilter !== "all" && v.visibility !== visFilter) return false;
        if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.entityType.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const starred = filtered.filter((v) => v.starred);
    const unstarred = filtered.filter((v) => !v.starred);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Saved Views" description="Manage custom filtered, sorted, and grouped views shared across your team">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New View
                </Button>
            </PageHeader>

            <div className="flex items-center gap-4">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search views..." className="flex-1 max-w-sm" />
                <div className="flex gap-1">
                    {(["all", "private", "team", "organization"] as const).map((f) => (
                        <Button key={f} variant={visFilter === f ? "default" : "ghost"} size="sm" onClick={() => setVisFilter(f)} className="text-xs">
                            {{ all: "All", private: "Private", team: "Team", organization: "Organization" }[f]}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Starred Views */}
            {starred.length > 0 && (
                <div className="space-y-2">
                    <OverlineText as="h3" className="flex items-center gap-1">
                        <Star className="h-3 w-3" /> Starred
                    </OverlineText>
                    {starred.map((v) => <ViewCard key={v.id} view={v} />)}
                </div>
            )}

            {/* All Views */}
            <div className="space-y-2">
                {starred.length > 0 && (
                    <OverlineText as="h3">All Views</OverlineText>
                )}
                {unstarred.map((v) => <ViewCard key={v.id} view={v} />)}
            </div>
        </div>
    );
}

function ViewCard({ view }: { view: SavedView }) {
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
                        {view.starred && <Star className="h-3 w-3 text-star-rating fill-star-rating" />}
                        <p className="text-sm font-semibold">{view.name}</p>
                        <Badge variant={VISIBILITY_CONFIG[view.visibility].variant} className="text-[10px] gap-0.5">
                            <VisIcon className="h-2.5 w-2.5" />
                            {VISIBILITY_CONFIG[view.visibility].label}
                        </Badge>
                        <Badge variant="ghost" className="text-[10px]">{{ list: "List", board: "Board", table: "Table", calendar: "Calendar", timeline: "Timeline", gantt: "Gantt" }[view.viewType]}</Badge>
                        <Badge variant="ghost" className="text-[10px]">{view.entityType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{view.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        {view.filterCount > 0 && (
                            <span className="flex items-center gap-0.5"><Filter className="h-2.5 w-2.5" /> {view.filterCount} filters</span>
                        )}
                        {view.sortCount > 0 && (
                            <span className="flex items-center gap-0.5"><SortAsc className="h-2.5 w-2.5" /> {view.sortCount} sorts</span>
                        )}
                        <span className="flex items-center gap-0.5"><Columns className="h-2.5 w-2.5" /> {view.columnCount} columns</span>
                        <span><Eye className="h-2.5 w-2.5 inline" /> {view.usageCount} views</span>
                        <span>by {view.owner}</span>
                    </div>
                </div>
                <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
            </CardContent>
        </Card>
        </PermissionGate>
    );
}
