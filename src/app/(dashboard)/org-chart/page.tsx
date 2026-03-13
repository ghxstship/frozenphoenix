"use client";

import React, { useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { useCrewMembers, useProjects } from "@/lib/supabase/hooks";
import { LoadingState } from "@/components/layouts/loading-state";

interface OrgNode {
    role: string;
    name: string;
    level: number;
    children: string[];
}

const ROLE_HIERARCHY: Record<string, number> = {
    "executive producer": 0,
    producer: 0,
    director: 0,
    "technical director": 1,
    "production manager": 1,
    "client lead": 1,
    supervisor: 1,
    lead: 1,
};

export default function OrgChartPage() {
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();
    const { data: sbCrew, isLoading: loadingCrew } = useCrewMembers();

    const projects = useMemo(
        () => (sbProjects ?? []) as Array<Record<string, unknown>>,
        [sbProjects]
    );
    const crew = useMemo(() => (sbCrew ?? []) as Array<Record<string, unknown>>, [sbCrew]);

    const orgTree: OrgNode[] = useMemo(() => {
        if (crew.length === 0) return [];
        const nodes: OrgNode[] = crew.map((c) => {
            const role = String(c.role ?? c.specialty ?? "Team Member");
            const roleLower = role.toLowerCase();
            const level = ROLE_HIERARCHY[roleLower] ?? 2;
            return { role, name: String(c.name ?? ""), level, children: [] };
        });
        const level0 = nodes.filter((n) => n.level === 0);
        const level1 = nodes.filter((n) => n.level === 1);
        if (level0.length > 0) {
            level0[0]!.children = level1.map((n) => n.role);
        }
        const level2 = nodes.filter((n) => n.level === 2);
        for (const l1 of level1) {
            l1.children = level2.slice(0, 2).map((n) => n.role);
        }
        return nodes;
    }, [crew]);

    if (loadingProjects || loadingCrew) {
        return <LoadingState />;
    }

    return (
        <PermissionGate resource="org_chart" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Org Chart"
                    description="Auto-generated chain of command for each production"
                >
                    <select className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
                        {projects.map((p) => (
                            <option key={String(p.id)} value={String(p.id)}>
                                {String(p.name ?? "")}
                            </option>
                        ))}
                    </select>
                </PageHeader>

                {/* Visual Org Chart */}
                <Card>
                    <CardContent className="py-8">
                        <div className="flex flex-col items-center space-y-6">
                            {/* Level 0 — Top */}
                            <div className="spatial-card p-4 text-center min-w-48 border-primary/30">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-sm font-bold">{orgTree[0]!.name}</p>
                                <OverlineText>{orgTree[0]!.role}</OverlineText>
                            </div>

                            {/* Connector */}
                            <div className="w-px h-6 bg-border" />

                            {/* Level 1 */}
                            <div className="flex gap-12">
                                {orgTree
                                    .filter((n) => n.level === 1)
                                    .map((node, i) => (
                                        <div key={node.role} className="flex flex-col items-center">
                                            {i > 0 && (
                                                <div
                                                    className="absolute h-px w-12 bg-border"
                                                    style={{ marginTop: -12 }}
                                                />
                                            )}
                                            <div className="spatial-card p-4 text-center min-w-40">
                                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                                                    <User className="h-4 w-4 text-foreground" />
                                                </div>
                                                <p className="text-sm font-semibold">{node.name}</p>
                                                <Badge variant="ghost" className="text-[9px] mt-1">
                                                    {node.role}
                                                </Badge>
                                            </div>

                                            {/* Level 2 children */}
                                            {node.children.length > 0 && (
                                                <>
                                                    <div className="w-px h-4 bg-border" />
                                                    <div className="flex gap-4">
                                                        {orgTree
                                                            .filter(
                                                                (n) =>
                                                                    n.level === 2 &&
                                                                    node.children.includes(n.role)
                                                            )
                                                            .map((child) => (
                                                                <div
                                                                    key={child.role}
                                                                    className="spatial-card p-3 text-center min-w-32"
                                                                >
                                                                    <p className="text-xs font-medium">
                                                                        {child.name}
                                                                    </p>
                                                                    <p className="text-[9px] text-muted-foreground">
                                                                        {child.role}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PermissionGate>
    );
}
