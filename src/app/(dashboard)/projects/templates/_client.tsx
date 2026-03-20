"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_PROJECT_TEMPLATE_CONFIG } from "@/config/create-entity-configs";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { formatDate } from "@/lib/utils";
import {
    ArrowRight,
    Calendar,
    CheckSquare,
    Copy,
    FolderPlus,
    Layout,
    Plus,
    Tag,
    Users,
} from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { useCreateProjectTemplate, useProjectTemplates } from "@/lib/supabase";

interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    taskCount: number;
    milestoneCount: number;
    roleCount: number;
    estimatedDuration: string;
    usageCount: number;
    lastUsed: string;
    createdBy: string;
    tags: string[];
}

export function ProjectTemplatesPageClient() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const duplicateTemplate = useCreateProjectTemplate();

    const { data: sbTemplates, isLoading } = useProjectTemplates();

    const templates: ProjectTemplate[] = useMemo(
        () =>
            (sbTemplates ?? []).map((t: Record<string, unknown>) => {
                const tasks = (t.default_tasks as unknown[] | null) ?? [];
                const milestones = (t.default_milestones as unknown[] | null) ?? [];
                const roles = (t.default_roles as unknown[] | null) ?? [];
                const tags = (t.tags as string[] | null) ?? [];
                return {
                    id: String(t.id),
                    name: String(t.name ?? ""),
                    description: String(t.description ?? ""),
                    category: String(t.category ?? ""),
                    taskCount: tasks.length,
                    milestoneCount: milestones.length,
                    roleCount: roles.length,
                    estimatedDuration: String(t.estimated_duration ?? ""),
                    usageCount: Number(t.usage_count ?? 0),
                    lastUsed: String(t.last_used_at ?? t.updated_at ?? ""),
                    createdBy: String(t.created_by_name ?? ""),
                    tags,
                };
            }),
        [sbTemplates]
    );

    const filtered = templates.filter(
        (t) =>
            !search ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.category.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
    );

    const totalUsage = templates.reduce((s, t) => s + t.usageCount, 0);

    const contentSlot = (
        <div className="density-gap-page">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 density-gap-card">
                <StatCard title="Templates" value={templates.length} icon={Layout} />
                <StatCard title="Total Usage" value={totalUsage} icon={Copy} />
                <StatCard
                    title="Avg Tasks"
                    value={
                        templates.length > 0
                            ? Math.round(
                                  templates.reduce((s, t) => s + t.taskCount, 0) / templates.length
                              )
                            : 0
                    }
                    icon={CheckSquare}
                />
                <StatCard
                    title="Categories"
                    value={new Set(templates.map((t) => t.category)).size}
                    icon={Tag}
                />
            </div>

            <div className="flex items-center gap-3">
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search templates..."
                    className="max-w-sm"
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Layout}
                    title="No templates found"
                    description={
                        search ? "Try adjusting your search" : "Create your first project template"
                    }
                    action={!search ? { label: "New Template", onClick: openCreate } : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 density-gap-card">
                    {filtered.map((template) => (
                        <Card
                            key={template.id}
                            className="hover:border-primary/30 transition-colors"
                        >
                            <CardContent className="p-5 density-gap-section">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant="info" className="density-caption">
                                            {template.category}
                                        </Badge>
                                        <span className="density-caption text-muted-foreground">
                                            Used {template.usageCount}x
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-semibold mt-2">{template.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {template.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                                        <div className="flex items-center justify-center gap-1">
                                            <CheckSquare className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm font-bold">
                                                {template.taskCount}
                                            </span>
                                        </div>
                                        <p className="density-caption text-muted-foreground">
                                            Tasks
                                        </p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                                        <div className="flex items-center justify-center gap-1">
                                            <FolderPlus className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm font-bold">
                                                {template.milestoneCount}
                                            </span>
                                        </div>
                                        <p className="density-caption text-muted-foreground">
                                            Milestones
                                        </p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm font-bold">
                                                {template.roleCount}
                                            </span>
                                        </div>
                                        <p className="density-caption text-muted-foreground">
                                            Roles
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>{template.estimatedDuration}</span>
                                    <span className="mx-1">·</span>
                                    <span>by {template.createdBy}</span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {template.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="ghost"
                                            className="density-caption"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t">
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={() =>
                                            router.push(`/projects/new?template=${template.id}`)
                                        }
                                    >
                                        <ArrowRight className="h-3.5 w-3.5" /> Create Project
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        title="Duplicate template"
                                        onClick={() =>
                                            duplicateTemplate.mutate({
                                                name: `${template.name} (Copy)`,
                                                description: template.description,
                                                category: template.category,
                                                estimated_duration: template.estimatedDuration,
                                            })
                                        }
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                <p className="density-caption text-muted-foreground">
                                    Last used {formatDate(template.lastUsed)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            <CreateEntityDialog
                config={CREATE_PROJECT_TEMPLATE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </div>
    );

    const config: DashboardPageConfig = {
        resource: "projects",
        action: "read",
        title: "Project Templates",
        description:
            "Create projects from predefined templates with tasks, milestones, and role assignments",
        headerActions: (
            <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> New Template
            </Button>
        ),
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}
