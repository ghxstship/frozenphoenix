"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Chip } from "@/components/ui/chip";
import { formatDate } from "@/lib/utils";
import { Clock, Copy, FileText, LayoutTemplate, Loader2, Plus, Star, Tag } from "lucide-react";
import { useTemplates } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type TemplateCategory =
    | "proposal"
    | "contract"
    | "invoice"
    | "call_sheet"
    | "tech_sheet"
    | "sow"
    | "report"
    | "email";

interface TemplateListItem {
    id: string;
    name: string;
    category: TemplateCategory;
    description: string;
    lastUsed: string;
    usageCount: number;
    isDefault: boolean;
    tags: string[];
    createdBy: string;
}

const CATEGORY_CONFIG: Record<
    TemplateCategory,
    { label: string; variant: "default" | "secondary" | "info" | "warning" | "success" | "ghost" }
> = {
    proposal: { label: "Proposal", variant: "info" },
    contract: { label: "Contract", variant: "default" },
    invoice: { label: "Invoice", variant: "success" },
    call_sheet: { label: "Call Sheet", variant: "warning" },
    tech_sheet: { label: "Tech Sheet", variant: "secondary" },
    sow: { label: "SOW", variant: "info" },
    report: { label: "Report", variant: "ghost" },
    email: { label: "Email", variant: "ghost" },
};

export default function TemplatesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const { data: sbTemplates, isLoading } = useTemplates();

    const templates: TemplateListItem[] = (sbTemplates ?? []).map((t: Record<string, unknown>) => ({
        id: (t.id as string) ?? "",
        name: (t.name as string) ?? "",
        category: ((t.category as string) ?? "report") as TemplateCategory,
        description: (t.description as string) ?? "",
        lastUsed: (t.last_used as string) ?? (t.updated_at as string) ?? "",
        usageCount: (t.usage_count as number) ?? 0,
        isDefault: (t.is_default as boolean) ?? false,
        tags: (t.tags as string[]) ?? [],
        createdBy: (t.created_by as string) ?? "",
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = templates.filter((t) => {
        const matchesSearch =
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <PermissionGate resource="templates" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Document Templates"
                    description="Reusable templates for proposals, contracts, invoices, call sheets, and more"
                >
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Template
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Templates"
                        value={templates.length}
                        icon={LayoutTemplate}
                    />
                    <StatCard
                        title="Default Templates"
                        value={templates.filter((t) => t.isDefault).length}
                        icon={Star}
                    />
                    <StatCard
                        title="Total Uses"
                        value={templates.reduce((sum, t) => sum + t.usageCount, 0)}
                        icon={Copy}
                    />
                    <StatCard
                        title="Categories"
                        value={Object.keys(CATEGORY_CONFIG).length}
                        icon={Tag}
                    />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search templates..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={categoryFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCategoryFilter("all")}
                        >
                            All
                        </Button>
                        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                            <Button
                                key={key}
                                variant={categoryFilter === key ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCategoryFilter(key)}
                            >
                                {cfg.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((template, i) => {
                        const catCfg = CATEGORY_CONFIG[template.category];
                        return (
                            <Link key={template.id} href={`/templates/${template.id}/edit`}>
                                <StaggerItem index={i} stagger="relaxed">
                                    <Card className="cursor-pointer hover:shadow-md transition-all h-full">
                                        <CardContent className="py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant={catCfg.variant}>
                                                            {catCfg.label}
                                                        </Badge>
                                                        {template.isDefault && (
                                                            <Badge
                                                                variant="success"
                                                                className="text-[10px]"
                                                            >
                                                                <Star className="mr-1 h-2.5 w-2.5" />
                                                                Default
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-semibold mt-1">
                                                        {template.name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {template.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Copy className="h-3 w-3" />
                                                            {template.usageCount} uses
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Last used{" "}
                                                            {formatDate(template.lastUsed)}
                                                        </span>
                                                    </div>
                                                    {template.tags.length > 0 && (
                                                        <div className="flex gap-1 mt-2 flex-wrap">
                                                            {template.tags.map((tag) => (
                                                                <Chip key={tag} size="sm">
                                                                    {tag}
                                                                </Chip>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            </Link>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <LayoutTemplate className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-1">No templates found</h3>
                            <p className="text-muted-foreground text-center">
                                {searchQuery || categoryFilter !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "Create your first template to get started"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PermissionGate>
    );
}
