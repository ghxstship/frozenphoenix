"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layouts/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/layouts/empty-state";
import { DEPARTMENT_CONFIG, DOCUMENT_CATEGORY_CONFIG } from "@/config/production-config";
import {
    BookOpen,
    CheckSquare,
    ChevronRight,
    Clock,
    FileText,
    Loader2,
    Plus,
    Shield,
    Users,
} from "lucide-react";
import { useKnowledgeBaseArticles } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
    sop: FileText,
    template: FileText,
    checklist: CheckSquare,
    guide: BookOpen,
    policy: Shield,
    form: FileText,
    reference: BookOpen,
    training: Users,
};

interface KBArticle {
    id: string;
    category: string;
    department?: string;
    title: string;
    summary: string;
    tags: string[];
    status: string;
    version: number;
    authorName: string;
    publishedAt: string;
    requiresAcknowledgment: boolean;
    acknowledgmentCount?: number;
    totalRequired?: number;
}

export default function KnowledgeBasePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const { data: sbArticles, isLoading } = useKnowledgeBaseArticles();

    const articles: KBArticle[] = (sbArticles ?? []).map((a: Record<string, unknown>) => ({
        id: (a.id as string) ?? "",
        category: (a.category as string) ?? "guide",
        department: (a.department as string) ?? undefined,
        title: (a.title as string) ?? "",
        summary: (a.summary as string) ?? "",
        tags: (a.tags as string[]) ?? [],
        status: (a.status as string) ?? "published",
        version: (a.version as number) ?? 1,
        authorName: (a.author_name as string) ?? "",
        publishedAt: (a.published_at as string) ?? "",
        requiresAcknowledgment: (a.requires_acknowledgment as boolean) ?? false,
        acknowledgmentCount: (a.acknowledgment_count as number) ?? undefined,
        totalRequired: (a.total_required as number) ?? undefined,
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filteredArticles = articles.filter((article) => {
        const matchesSearch =
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", "sop", "checklist", "template", "guide", "policy", "training"];

    const pendingAcknowledgments = articles.filter(
        (a) =>
            a.requiresAcknowledgment &&
            a.acknowledgmentCount !== undefined &&
            a.totalRequired !== undefined &&
            a.acknowledgmentCount < a.totalRequired
    );

    return (
        <PermissionGate resource="knowledge_base" action="read">
            <PageShell
                title="Knowledge Base"
                description="SOPs, templates, guides, and documentation"
                actions={
                    <Link href="/knowledge-base/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            New Article
                        </Button>
                    </Link>
                }
            >
                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search articles, tags..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={categoryFilter === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCategoryFilter(category)}
                            >
                                {category === "all"
                                    ? "All"
                                    : category === "sop"
                                      ? "SOPs"
                                      : (DOCUMENT_CATEGORY_CONFIG[
                                            category as keyof typeof DOCUMENT_CATEGORY_CONFIG
                                        ]?.label ?? category)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard title="Total Articles" value={articles.length} icon={BookOpen} />
                    <StatCard
                        title="SOPs"
                        value={articles.filter((a) => a.category === "sop").length}
                        icon={FileText}
                    />
                    <StatCard
                        title="Checklists"
                        value={articles.filter((a) => a.category === "checklist").length}
                        icon={CheckSquare}
                    />
                    <StatCard
                        title="Pending Acknowledgments"
                        value={pendingAcknowledgments.length}
                        icon={Clock}
                        className={
                            pendingAcknowledgments.length > 0
                                ? "border-warning/50 bg-warning/5"
                                : ""
                        }
                    />
                </div>

                {/* Category Cards */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-base">Browse by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(DOCUMENT_CATEGORY_CONFIG).map(([key, config]) => {
                                const count = articles.filter((a) => a.category === key).length;
                                const Icon = CATEGORY_ICONS[key] || BookOpen;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => setCategoryFilter(key)}
                                        className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{config.label}</span>
                                        </div>
                                        <p className="text-2xl font-bold">{count}</p>
                                        <p className="text-xs text-muted-foreground">articles</p>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Articles List */}
                {filteredArticles.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="No articles found"
                        description={
                            searchQuery ? "Try adjusting your search" : "Create your first article"
                        }
                        action={
                            !searchQuery ? { label: "New Article", onClick: () => {} } : undefined
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredArticles.map((article) => {
                            const categoryConfig =
                                DOCUMENT_CATEGORY_CONFIG[
                                    article.category as keyof typeof DOCUMENT_CATEGORY_CONFIG
                                ];
                            const deptConfig = article.department
                                ? DEPARTMENT_CONFIG[
                                      article.department as keyof typeof DEPARTMENT_CONFIG
                                  ]
                                : null;
                            const Icon = CATEGORY_ICONS[article.category] || BookOpen;

                            return (
                                <Link key={article.id} href={`/knowledge-base/${article.id}`}>
                                    <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                        <CardContent className="flex items-center gap-4 py-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold truncate">
                                                        {article.title}
                                                    </h3>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px]"
                                                    >
                                                        {categoryConfig?.label || article.category}
                                                    </Badge>
                                                    {deptConfig && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px]"
                                                        >
                                                            {deptConfig.label}
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px]"
                                                    >
                                                        v{article.version}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate mb-1">
                                                    {article.summary}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {article.tags.slice(0, 4).map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="outline"
                                                            className="text-[9px]"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">
                                                        Author
                                                    </p>
                                                    <p className="font-medium text-xs">
                                                        {article.authorName}
                                                    </p>
                                                </div>
                                                {article.requiresAcknowledgment &&
                                                    article.acknowledgmentCount !== undefined &&
                                                    article.totalRequired !== undefined && (
                                                        <div className="text-center">
                                                            <p className="text-muted-foreground text-xs">
                                                                Acknowledged
                                                            </p>
                                                            <p
                                                                className={`font-medium ${article.acknowledgmentCount < article.totalRequired ? "text-warning" : "text-success"}`}
                                                            >
                                                                {article.acknowledgmentCount}/
                                                                {article.totalRequired}
                                                            </p>
                                                        </div>
                                                    )}
                                            </div>

                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </PageShell>
        </PermissionGate>
    );
}
