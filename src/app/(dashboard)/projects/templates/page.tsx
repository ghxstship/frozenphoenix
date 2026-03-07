"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
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
import { PermissionGate } from "@/components/permission-guard";

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

const PLACEHOLDER_TEMPLATES: ProjectTemplate[] = [
    {
        id: "pt1",
        name: "Brand Activation — Standard",
        description:
            "Full lifecycle template for brand activations including venue scouting, fabrication, install, and strike.",
        category: "Activation",
        taskCount: 42,
        milestoneCount: 8,
        roleCount: 12,
        estimatedDuration: "12 weeks",
        usageCount: 15,
        lastUsed: "2026-02-28",
        createdBy: "Anna Williams",
        tags: ["activation", "experiential", "brand"],
    },
    {
        id: "pt2",
        name: "Pop-Up Experience",
        description: "Compact template for pop-up retail and experiential installations.",
        category: "Pop-Up",
        taskCount: 28,
        milestoneCount: 5,
        roleCount: 8,
        estimatedDuration: "6 weeks",
        usageCount: 9,
        lastUsed: "2026-03-05",
        createdBy: "Marcus Chen",
        tags: ["pop-up", "retail", "compact"],
    },
    {
        id: "pt3",
        name: "Festival Stage Build",
        description: "Large-scale festival stage fabrication, rigging, AV, and lighting.",
        category: "Festival",
        taskCount: 65,
        milestoneCount: 12,
        roleCount: 20,
        estimatedDuration: "16 weeks",
        usageCount: 4,
        lastUsed: "2026-01-15",
        createdBy: "Jake Morrison",
        tags: ["festival", "stage", "large-scale"],
    },
    {
        id: "pt4",
        name: "Corporate Event",
        description: "Conference and corporate event planning with AV, catering, and logistics.",
        category: "Corporate",
        taskCount: 35,
        milestoneCount: 6,
        roleCount: 10,
        estimatedDuration: "8 weeks",
        usageCount: 22,
        lastUsed: "2026-03-10",
        createdBy: "Sarah Kim",
        tags: ["corporate", "conference", "event"],
    },
    {
        id: "pt5",
        name: "Product Launch",
        description:
            "End-to-end product launch experience with media, influencer, and retail components.",
        category: "Launch",
        taskCount: 50,
        milestoneCount: 10,
        roleCount: 15,
        estimatedDuration: "10 weeks",
        usageCount: 7,
        lastUsed: "2026-02-20",
        createdBy: "Lisa Park",
        tags: ["launch", "product", "media"],
    },
];

export default function ProjectTemplatesPage() {
    const [search, setSearch] = useState("");

    const filtered = PLACEHOLDER_TEMPLATES.filter(
        (t) =>
            !search ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.category.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
    );

    const totalUsage = PLACEHOLDER_TEMPLATES.reduce((s, t) => s + t.usageCount, 0);

    return (
        <PermissionGate resource="projects" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Project Templates"
                    description="Create projects from predefined templates with tasks, milestones, and role assignments"
                >
                    <Button size="sm">
                        <Plus className="h-4 w-4" /> New Template
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Templates"
                        value={PLACEHOLDER_TEMPLATES.length}
                        icon={Layout}
                    />
                    <StatCard title="Total Usage" value={totalUsage} icon={Copy} />
                    <StatCard
                        title="Avg Tasks"
                        value={Math.round(
                            PLACEHOLDER_TEMPLATES.reduce((s, t) => s + t.taskCount, 0) /
                                PLACEHOLDER_TEMPLATES.length
                        )}
                        icon={CheckSquare}
                    />
                    <StatCard
                        title="Categories"
                        value={new Set(PLACEHOLDER_TEMPLATES.map((t) => t.category)).size}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((template) => (
                        <Card
                            key={template.id}
                            className="hover:border-primary/30 transition-colors"
                        >
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant="info" className="text-[10px]">
                                            {template.category}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            Used {template.usageCount}x
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-semibold mt-2">{template.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {template.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                                        <div className="flex items-center justify-center gap-1">
                                            <CheckSquare className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm font-bold">
                                                {template.taskCount}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Tasks</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                                        <div className="flex items-center justify-center gap-1">
                                            <FolderPlus className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm font-bold">
                                                {template.milestoneCount}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
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
                                        <p className="text-[10px] text-muted-foreground">Roles</p>
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
                                        <Badge key={tag} variant="ghost" className="text-[10px]">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t">
                                    <Button size="sm" className="flex-1">
                                        <ArrowRight className="h-3.5 w-3.5" /> Create Project
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                <p className="text-[10px] text-muted-foreground">
                                    Last used {formatDate(template.lastUsed)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </PermissionGate>
    );
}
