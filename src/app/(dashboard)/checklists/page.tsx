"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_CHECKLIST_CONFIG } from "@/config/create-entity-configs";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CheckCircle2, Circle, Clock, ListChecks, Loader2, Percent, Plus } from "lucide-react";
import type { ChecklistTemplate } from "@/types/vendor-lifecycle";
import { useChecklists } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import { TabBar } from "@/components/ui/tab-bar";

type ViewTab = "active" | "templates";

interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
    required: boolean;
    completedBy?: string;
}

interface ChecklistEntry {
    id: string;
    title: string;
    status: string;
    dueDate?: string;
    completionPercent: number;
    completedItems: number;
    totalItems: number;
    items: ChecklistItem[];
}

export default function ChecklistsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const TAB_VALUES = ["active", "templates"] as const;
    const [tab, setTab] = useQueryTabState({
        key: "tab",
        defaultValue: "active",
        validValues: TAB_VALUES,
    });

    const { data: sbChecklists, isLoading } = useChecklists();

    const checklists: ChecklistEntry[] = (sbChecklists ?? []).map((c: Record<string, unknown>) => ({
        id: (c.id as string) ?? "",
        title: (c.title as string) ?? "",
        status: (c.status as string) ?? "not_started",
        dueDate: (c.due_date as string) ?? undefined,
        completionPercent: (c.completion_percent as number) ?? 0,
        completedItems: (c.completed_items as number) ?? 0,
        totalItems: (c.total_items as number) ?? 0,
        items: ((c.items as Array<Record<string, unknown>>) ?? []).map((item) => ({
            id: (item.id as string) ?? "",
            title: (item.title as string) ?? "",
            completed: (item.completed as boolean) ?? false,
            required: (item.required as boolean) ?? false,
            completedBy: (item.completed_by as string) ?? undefined,
        })),
    }));
    // NEXT: Wire to useChecklistTemplates() when hook is available
    const templates: ChecklistTemplate[] = [];

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const filteredChecklists = checklists.filter(
        (c) => !search || c.title.toLowerCase().includes(search.toLowerCase())
    );
    const filteredTemplates = templates.filter(
        (t) => !search || t.name.toLowerCase().includes(search.toLowerCase())
    );

    const inProgress = checklists.filter((c) => c.status === "in_progress").length;
    const completed = checklists.filter((c) => c.status === "completed").length;
    const avgCompletion =
        checklists.length > 0
            ? Math.round(
                  checklists.reduce((s, c) => s + c.completionPercent, 0) / checklists.length
              )
            : 0;

    return (
        <PermissionGate resource="checklists" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Job Checklists"
                    description="Template-based checklists for work orders, quality assurance, and safety compliance"
                >
                    <div className="flex items-center gap-2">
                        <TabBar
                            items={[
                                { id: "active", label: "Active", count: checklists.length },
                                { id: "templates", label: "Templates", count: templates.length },
                            ]}
                            value={tab}
                            onValueChange={(v) => setTab(v as ViewTab)}
                            ariaLabel="Checklist sections"
                            size="sm"
                            variant="pill"
                        />
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="h-4 w-4" />{" "}
                            {tab === "templates" ? "New Template" : "New Checklist"}
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Active Checklists"
                        value={checklists.length}
                        icon={ListChecks}
                    />
                    <StatCard title="In Progress" value={inProgress} icon={Clock} />
                    <StatCard title="Completed" value={completed} icon={CheckCircle2} />
                    <StatCard title="Avg. Completion" value={`${avgCompletion}%`} icon={Percent} />
                </div>

                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder={`Search ${tab === "templates" ? "templates" : "checklists"}...`}
                    className="max-w-sm"
                />

                {tab === "active" && (
                    <div className="space-y-4">
                        {filteredChecklists.map((checklist, i) => (
                            <StaggerItem key={checklist.id} index={i} stagger="relaxed">
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-sm font-bold">
                                                    {checklist.title}
                                                </h3>
                                                {checklist.dueDate && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Due: {checklist.dueDate}
                                                    </p>
                                                )}
                                            </div>
                                            <StatusBadge
                                                status={checklist.status}
                                                className="text-[10px]"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 mb-3">
                                            <ProgressBar
                                                value={checklist.completionPercent}
                                                size="md"
                                                className="flex-1"
                                            />
                                            <span className="text-xs font-medium">
                                                {checklist.completedItems}/{checklist.totalItems}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            {checklist.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-2 py-1"
                                                >
                                                    {item.completed ? (
                                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                                    ) : (
                                                        <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                                    )}
                                                    <span
                                                        className={`text-xs ${item.completed ? "line-through text-muted-foreground" : ""}`}
                                                    >
                                                        {item.title}
                                                    </span>
                                                    {item.required && !item.completed && (
                                                        <span className="text-[9px] text-destructive">
                                                            Required
                                                        </span>
                                                    )}
                                                    {item.completedBy && (
                                                        <span className="text-[9px] text-muted-foreground ml-auto">
                                                            {item.completedBy}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                )}

                {tab === "templates" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((template, i) => (
                            <StaggerItem key={template.id} index={i} stagger="relaxed">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-sm font-bold">{template.name}</h3>
                                            {template.isActive && (
                                                <Badge variant="success" className="text-[10px]">
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                        {template.description && (
                                            <p className="text-xs text-muted-foreground mb-3">
                                                {template.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                            <span className="flex items-center gap-1">
                                                <ListChecks className="h-3 w-3" />{" "}
                                                {template.items.length} items
                                            </span>
                                            {template.category && <span>{template.category}</span>}
                                            <span>Used {template.usageCount}x</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            {template.items.slice(0, 4).map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-2 text-xs text-muted-foreground"
                                                >
                                                    <Circle className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{item.title}</span>
                                                </div>
                                            ))}
                                            {template.items.length > 4 && (
                                                <p className="text-[10px] text-muted-foreground pl-5">
                                                    +{template.items.length - 4} more items
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                )}
            </div>
            <CreateEntityDialog config={CREATE_CHECKLIST_CONFIG} open={createOpen} onClose={closeCreate} />
        </PermissionGate>
    );
}
