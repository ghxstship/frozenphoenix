"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { Badge } from "@/components/ui/badge";
import { MOCK_PROJECTS } from "@/lib/demo-data";
import { User } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

// TODO: Wire to Supabase when org_chart/crew_assignments queries are available
void isSupabaseConfigured;

export default function OrgChartPage() {
    const orgTree = [
        { role: "Executive Producer", name: "Alex Rivera", level: 0, children: ["Technical Director", "Client Lead"] },
        { role: "Technical Director", name: "Marcus Johnson", level: 1, children: ["Lead Fabricator", "Electrician"] },
        { role: "Client Lead", name: "Derek Allen", level: 1, children: [] },
        { role: "Lead Fabricator", name: "Crew TBD", level: 2, children: [] },
        { role: "Electrician", name: "Tommy Rodriguez", level: 2, children: [] },
    ];

    return (
        <PermissionGate resource="org_chart" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Org Chart" description="Auto-generated chain of command for each production">
                <select className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
                    {MOCK_PROJECTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
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
                            {orgTree.filter(n => n.level === 1).map((node, i) => (
                                <div key={node.role} className="flex flex-col items-center">
                                    {i > 0 && <div className="absolute h-px w-12 bg-border" style={{ marginTop: -12 }} />}
                                    <div className="spatial-card p-4 text-center min-w-40">
                                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                                            <User className="h-4 w-4 text-foreground" />
                                        </div>
                                        <p className="text-sm font-semibold">{node.name}</p>
                                        <Badge variant="ghost" className="text-[9px] mt-1">{node.role}</Badge>
                                    </div>

                                    {/* Level 2 children */}
                                    {node.children.length > 0 && (
                                        <>
                                            <div className="w-px h-4 bg-border" />
                                            <div className="flex gap-4">
                                                {orgTree.filter(n => n.level === 2 && node.children.includes(n.role)).map((child) => (
                                                    <div key={child.role} className="spatial-card p-3 text-center min-w-32">
                                                        <p className="text-xs font-medium">{child.name}</p>
                                                        <p className="text-[9px] text-muted-foreground">{child.role}</p>
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
