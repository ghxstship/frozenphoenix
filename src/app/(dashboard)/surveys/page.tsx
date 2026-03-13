"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { formatDate } from "@/lib/utils";
import {
    Award,
    BarChart3,
    ClipboardList,
    Copy,
    Eye,
    MessageSquare,
    Plus,
    Send,
    Smile,
    Star,
    TrendingUp,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { LoadingState } from "@/components/layouts/loading-state";
import { useSurveyResponses, useSurveyTemplates } from "@/lib/supabase/hooks-v2-features";

type SurveysTab = "templates" | "responses" | "analytics";

interface SurveyTemplate {
    id: string;
    name: string;
    type: "csat" | "nps" | "post_event" | "post_project" | "custom";
    questionCount: number;
    responseCount: number;
    averageRating: number;
    triggerOn: string;
    isActive: boolean;
    createdAt: string;
}

interface SurveyResponse {
    id: string;
    templateName: string;
    respondentName: string;
    respondentEmail: string;
    entityName: string;
    overallRating: number;
    npsScore: number | null;
    comments: string;
    submittedAt: string;
}

const TYPE_BADGE: Record<string, "default" | "info" | "warning" | "success"> = {
    csat: "success",
    nps: "info",
    post_event: "warning",
    post_project: "default",
    custom: "default",
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${star <= rating ? "text-star-rating fill-star-rating" : "text-muted-foreground/30"}`}
                />
            ))}
        </div>
    );
}

function NpsIndicator({ score }: { score: number }) {
    const color = score >= 9 ? "text-success" : score >= 7 ? "text-warning" : "text-destructive";
    const label = score >= 9 ? "Promoter" : score >= 7 ? "Passive" : "Detractor";
    return (
        <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${color}`}>{score}</span>
            <Badge
                variant={score >= 9 ? "success" : score >= 7 ? "warning" : "destructive"}
                className="text-[10px]"
            >
                {label}
            </Badge>
        </div>
    );
}

export default function SurveysPage() {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useQueryTabState<SurveysTab>({
        key: "tab",
        defaultValue: "templates",
        validValues: ["templates", "responses", "analytics"],
    });

    const { data: sbTemplates, isLoading: loadingTemplates } = useSurveyTemplates();
    const { data: sbResponses, isLoading: loadingResponses } = useSurveyResponses();

    const templates: SurveyTemplate[] = useMemo(
        () =>
            (sbTemplates ?? []).map((t: Record<string, unknown>) => {
                const questions = (t.questions as unknown[] | null) ?? [];
                return {
                    id: String(t.id),
                    name: String(t.name ?? ""),
                    type: (t.survey_type as SurveyTemplate["type"]) ?? "custom",
                    questionCount: questions.length,
                    responseCount: 0,
                    averageRating: 0,
                    triggerOn: String(t.trigger_on ?? "manual"),
                    isActive: t.is_active !== false,
                    createdAt: String(t.created_at ?? ""),
                };
            }),
        [sbTemplates]
    );

    const responses: SurveyResponse[] = useMemo(
        () =>
            (sbResponses ?? []).map((r: Record<string, unknown>) => {
                const tpl = r.survey_templates as Record<string, unknown> | null;
                return {
                    id: String(r.id),
                    templateName: String(tpl?.name ?? ""),
                    respondentName: String(r.respondent_name ?? r.respondent_email ?? "Anonymous"),
                    respondentEmail: String(r.respondent_email ?? ""),
                    entityName: String(r.entity_type ?? ""),
                    overallRating: Number(r.overall_rating ?? 0),
                    npsScore: r.nps_score != null ? Number(r.nps_score) : null,
                    comments: String(r.comments ?? ""),
                    submittedAt: String(r.submitted_at ?? r.created_at ?? ""),
                };
            }),
        [sbResponses]
    );

    // Enrich templates with response counts and avg ratings
    const enrichedTemplates: SurveyTemplate[] = useMemo(() => {
        const countByTemplate = new Map<string, { count: number; ratingSum: number }>();
        for (const r of responses) {
            const key = r.templateName;
            const prev = countByTemplate.get(key) ?? { count: 0, ratingSum: 0 };
            countByTemplate.set(key, {
                count: prev.count + 1,
                ratingSum: prev.ratingSum + r.overallRating,
            });
        }
        return templates.map((t) => {
            const stats = countByTemplate.get(t.name);
            return {
                ...t,
                responseCount: stats?.count ?? 0,
                averageRating: stats ? stats.ratingSum / stats.count : 0,
            };
        });
    }, [templates, responses]);

    const isLoading = loadingTemplates || loadingResponses;

    const TAB_VALUES: SurveysTab[] = ["templates", "responses", "analytics"];
    const tabs = [
        {
            id: "templates" as const,
            label: "Templates",
            count: enrichedTemplates.length,
            icon: <ClipboardList className="h-4 w-4" />,
        },
        {
            id: "responses" as const,
            label: "Responses",
            count: responses.length,
            icon: <MessageSquare className="h-4 w-4" />,
        },
        { id: "analytics" as const, label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    ];

    const totalResponses = responses.length;
    const avgRating =
        responses.length > 0
            ? responses.reduce((s, r) => s + r.overallRating, 0) / responses.length
            : 0;
    const npsResponses = responses.filter((r) => r.npsScore !== null);
    const npsAvg =
        npsResponses.length > 0
            ? npsResponses.reduce((s, r) => s + (r.npsScore || 0), 0) / npsResponses.length
            : 0;
    const promoters = responses.filter((r) => (r.npsScore || 0) >= 9).length;

    const filteredTemplates = enrichedTemplates.filter(
        (t) => !search || t.name.toLowerCase().includes(search.toLowerCase())
    );
    const filteredResponses = responses.filter(
        (r) =>
            !search ||
            r.respondentName.toLowerCase().includes(search.toLowerCase()) ||
            r.entityName.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <LoadingState />;

    return (
        <PermissionGate resource="surveys" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Customer Satisfaction Surveys"
                    description="Build survey templates, collect responses, and analyze satisfaction metrics"
                >
                    <Button size="sm">
                        <Plus className="h-4 w-4" /> New Template
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Responses" value={totalResponses} icon={MessageSquare} />
                    <StatCard title="Avg. Rating" value={avgRating.toFixed(1)} icon={Star} />
                    <StatCard
                        title="NPS Score"
                        value={
                            responses.length > 0
                                ? Math.round(
                                      (promoters / responses.length) * 100 -
                                          ((responses.length - promoters) / responses.length) * 100
                                  )
                                : 0
                        }
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Active Templates"
                        value={enrichedTemplates.filter((t) => t.isActive).length}
                        icon={ClipboardList}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search surveys..."
                        className="max-w-sm"
                    />
                </div>

                <TabBar
                    items={tabs}
                    value={activeTab}
                    onValueChange={(id) => setActiveTab(id as SurveysTab)}
                />

                {TAB_VALUES.map((tabId) => (
                    <TabPanel key={tabId} value={tabId} activeValue={activeTab}>
                        {tabId === "templates" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredTemplates.map((template) => (
                                    <StaggerItem
                                        key={template.id}
                                        index={enrichedTemplates.indexOf(template)}
                                    >
                                        <Card className="hover:border-primary/30 transition-colors">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-sm font-semibold">
                                                            {template.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge
                                                                variant={TYPE_BADGE[template.type]}
                                                                className="text-[10px]"
                                                            >
                                                                {template.type.toUpperCase()}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {template.questionCount} questions
                                                            </span>
                                                            {!template.isActive && (
                                                                <Badge
                                                                    variant="ghost"
                                                                    className="text-[10px]"
                                                                >
                                                                    Inactive
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            <Send className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            <Copy className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 mb-3">
                                                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                                                        <p className="text-lg font-bold">
                                                            {template.responseCount}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            Responses
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                                                        <p className="text-lg font-bold">
                                                            {template.averageRating.toFixed(1)}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            Avg Rating
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                                                        <p className="text-xs font-medium capitalize">
                                                            {template.triggerOn.replace("_", " ")}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            Trigger
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>
                                                        Created {formatDate(template.createdAt)}
                                                    </span>
                                                    <StarRating
                                                        rating={Math.round(template.averageRating)}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </StaggerItem>
                                ))}
                            </div>
                        )}

                        {tabId === "responses" && (
                            <div className="space-y-3">
                                {filteredResponses.map((response) => (
                                    <StaggerItem
                                        key={response.id}
                                        index={responses.indexOf(response)}
                                    >
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-semibold">
                                                                {response.respondentName}
                                                            </h3>
                                                            <Badge
                                                                variant="ghost"
                                                                className="text-[10px]"
                                                            >
                                                                {response.templateName}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {response.respondentEmail} ·{" "}
                                                            {response.entityName}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <StarRating
                                                            rating={response.overallRating}
                                                        />
                                                        {response.npsScore !== null && (
                                                            <NpsIndicator
                                                                score={response.npsScore}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                {response.comments && (
                                                    <p className="text-xs bg-secondary/30 rounded-lg p-3 mt-2 italic">
                                                        &ldquo;{response.comments}&rdquo;
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-muted-foreground mt-2">
                                                    {formatDate(response.submittedAt)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </StaggerItem>
                                ))}
                            </div>
                        )}

                        {tabId === "analytics" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Smile className="h-4 w-4" />
                                                CSAT Distribution
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {[5, 4, 3, 2, 1].map((rating) => {
                                                const count = responses.filter(
                                                    (r) => r.overallRating === rating
                                                ).length;
                                                const pct =
                                                    responses.length > 0
                                                        ? Math.round(
                                                              (count / responses.length) * 100
                                                          )
                                                        : 0;
                                                return (
                                                    <div
                                                        key={rating}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <div className="flex items-center gap-1 w-16">
                                                            <Star className="h-3 w-3 text-star-rating fill-star-rating" />
                                                            <span className="text-sm font-medium">
                                                                {rating}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <ProgressBar value={pct} size="sm" />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground w-12 text-right">
                                                            {pct}% ({count})
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                NPS Breakdown
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {[
                                                {
                                                    label: "Promoters (9-10)",
                                                    count: responses.filter(
                                                        (r) => (r.npsScore || 0) >= 9
                                                    ).length,
                                                    color: "bg-success",
                                                },
                                                {
                                                    label: "Passives (7-8)",
                                                    count: responses.filter(
                                                        (r) =>
                                                            (r.npsScore || 0) >= 7 &&
                                                            (r.npsScore || 0) < 9
                                                    ).length,
                                                    color: "bg-warning",
                                                },
                                                {
                                                    label: "Detractors (0-6)",
                                                    count: responses.filter(
                                                        (r) => (r.npsScore || 0) < 7
                                                    ).length,
                                                    color: "bg-destructive",
                                                },
                                            ].map((seg) => (
                                                <div
                                                    key={seg.label}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`h-3 w-3 rounded-full ${seg.color}`}
                                                        />
                                                        <span className="text-sm">{seg.label}</span>
                                                    </div>
                                                    <span className="text-sm font-bold">
                                                        {seg.count} (
                                                        {Math.round(
                                                            (seg.count / (responses.length || 1)) *
                                                                100
                                                        )}
                                                        %)
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="pt-3 border-t">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">
                                                        Net Promoter Score
                                                    </span>
                                                    <span className="text-2xl font-bold text-success">
                                                        +{Math.round(npsAvg * 10)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Award className="h-4 w-4" />
                                            Top Rated Projects
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {(() => {
                                            const byEntity = new Map<
                                                string,
                                                { sum: number; count: number }
                                            >();
                                            for (const r of responses) {
                                                if (!r.entityName) continue;
                                                const prev = byEntity.get(r.entityName) ?? {
                                                    sum: 0,
                                                    count: 0,
                                                };
                                                byEntity.set(r.entityName, {
                                                    sum: prev.sum + r.overallRating,
                                                    count: prev.count + 1,
                                                });
                                            }
                                            return Array.from(byEntity.entries())
                                                .map(([name, s]) => ({
                                                    name,
                                                    avg: s.sum / s.count,
                                                }))
                                                .sort((a, b) => b.avg - a.avg)
                                                .slice(0, 5);
                                        })().map((entry, i) => (
                                            <div
                                                key={entry.name}
                                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-muted-foreground">
                                                        #{i + 1}
                                                    </span>
                                                    <span className="text-sm font-semibold">
                                                        {entry.name}
                                                    </span>
                                                </div>
                                                <StarRating rating={Math.round(entry.avg)} />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabPanel>
                ))}
            </div>
        </PermissionGate>
    );
}
