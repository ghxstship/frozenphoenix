"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured, useCaseStudies } from "@/lib/supabase/hooks";
import { MOCK_CASE_STUDIES } from "@/lib/demo-data";
import { Award, ExternalLink, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaggerItem } from "@/components/ui/stagger-container";
import { PermissionGate } from "@/components/permission-guard";

export default function CaseStudiesPage() {
    const { data: sbCaseStudies, isLoading } = useCaseStudies();

    const caseStudies =
        isSupabaseConfigured && sbCaseStudies
            ? sbCaseStudies.map((cs) => ({
                  id: cs.id,
                  projectId: cs.project_id,
                  title: cs.title,
                  client: cs.client,
                  summary: cs.summary,
                  status: cs.status as "draft" | "published",
                  metrics: (
                      (
                          cs as unknown as {
                              case_study_metrics?: Array<{ label: string; value: string }>;
                          }
                      ).case_study_metrics || []
                  ).map((m) => ({
                      label: m.label,
                      value: m.value,
                  })),
                  publishedAt: cs.published_at ?? undefined,
                  createdAt: cs.created_at,
              }))
            : MOCK_CASE_STUDIES;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }
    return (
        <PermissionGate resource="case_studies" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Case Studies"
                    description="Auto-published from completed productions"
                >
                    <Button size="sm">
                        <Award className="h-4 w-4" /> Publish New
                    </Button>
                </PageHeader>

                <div className="space-y-4">
                    {caseStudies.map((cs, i) => (
                        <StaggerItem key={cs.id} index={i} stagger="relaxed">
                            <Card>
                                <CardContent>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <Badge variant="info" className="mb-2">
                                                {cs.client}
                                            </Badge>
                                            <h3 className="text-lg font-bold">{cs.title}</h3>
                                        </div>
                                        <Badge
                                            variant={
                                                cs.status === "published" ? "success" : "ghost"
                                            }
                                        >
                                            {cs.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                        {cs.summary}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {cs.metrics.map((m) => (
                                            <div
                                                key={m.label}
                                                className="px-3 py-2 rounded-xl bg-secondary"
                                            >
                                                <p className="text-lg font-bold">{m.value}</p>
                                                <OverlineText>{m.label}</OverlineText>
                                            </div>
                                        ))}
                                    </div>
                                    {cs.status === "published" && (
                                        <div className="mt-4 flex items-center gap-2 text-xs text-primary">
                                            <Globe className="h-3.5 w-3.5" />
                                            Published to landing page
                                            <ExternalLink className="h-3 w-3" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    ))}
                </div>
            </div>
        </PermissionGate>
    );
}
